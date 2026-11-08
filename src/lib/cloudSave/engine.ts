import type { LoadResult, SaveResult } from "./api";
import { contentEquals, emptyContent } from "./canonical";
import {
  combineContent,
  dominates,
  invariantHolds,
  isLocalActivityLater,
  isPristine,
  mergeActivity,
  mergeContent,
  projectDeferred,
  snapshotWithLocalDeferred,
} from "./merge";
import type { RecordStore } from "./records";
import type {
  ActivityStamps,
  DeferredKeys,
  LocalSnapshot,
  SyncContent,
  SyncIdentity,
} from "./types";
import { buildPayload, parseCloudSave, type CloudSavePayload } from "./wire";

export type SyncPrompt =
  { kind: "other_account"; previousLabel: string } | { kind: "cannot_tell" };

export type PromptChoice = "add" | "fresh" | "combine" | "use_cloud";

export type SyncOutcome =
  | { kind: "synced"; updatedAt: string; created?: boolean }
  | { kind: "unchanged"; updatedAt: string }
  | { kind: "auth" }
  | { kind: "deleted" }
  | { kind: "error" };

export type SyncDeps = {
  getToken: () => Promise<string | null>;
  load: (token: string, knownRev?: number) => Promise<LoadResult>;
  save: (
    token: string,
    payload: CloudSavePayload,
    baseRev: number | null
  ) => Promise<SaveResult>;
  readLocal: () => LocalSnapshot;
  applyLocal: (
    content: SyncContent,
    activity: ActivityStamps,
    deferred: DeferredKeys
  ) => void;
  records: RecordStore;
  deferredKeys: () => DeferredKeys;
  hasLegacyHint: () => boolean;
  now: () => string;
  askUser: (prompt: SyncPrompt) => Promise<PromptChoice>;
  onDeleted: () => void;
};

type RunContext = {
  forcedAdd: boolean;
  cannotTell: PromptChoice | null;
};

type Step =
  | { kind: "done"; outcome: SyncOutcome }
  | { kind: "retry"; loaded: LoadResult };

const MAX_ATTEMPTS = 4;

const EMPTY_ACTIVITY: ActivityStamps = {
  lastPlayedAt: null,
  firstSeenAt: null,
};

export const createSyncEngine = (deps: SyncDeps) => {
  const { records } = deps;

  const done = (outcome: SyncOutcome): Step => ({ kind: "done", outcome });
  const retry = (loaded: LoadResult): Step => ({ kind: "retry", loaded });

  const commit = (
    identity: SyncIdentity,
    content: SyncContent,
    rev: number,
    updatedAt: string,
    deferred: DeferredKeys
  ): Extract<SyncOutcome, { kind: "synced" }> => {
    const actual = deps.readLocal().content;
    records.setRecord(identity.uid, {
      rev,
      snapshot: snapshotWithLocalDeferred(content, actual, deferred),
      syncedAt: updatedAt,
    });
    records.clearPending(identity.uid);
    records.setOwner(identity);
    return { kind: "synced", updatedAt };
  };

  const stashLocal = (owner: SyncIdentity, local: LocalSnapshot) => {
    records.setStash(owner.uid, {
      content: local.content,
      activity: local.activity,
      label: owner.label,
      savedAt: deps.now(),
    });
    records.writeBackup(local.content, "account_switch");
  };

  const resolveCannotTell = async (
    ctx: RunContext,
    local: SyncContent,
    cloud: SyncContent
  ): Promise<SyncContent> => {
    const choice =
      ctx.cannotTell ?? (await deps.askUser({ kind: "cannot_tell" }));
    ctx.cannotTell = choice;
    return choice === "combine" ? combineContent(local, cloud) : cloud;
  };

  const handleDeleted = (identity: SyncIdentity): Step => {
    records.clearUid(identity.uid);
    deps.onDeleted();
    return done({ kind: "deleted" });
  };

  const attempt = async (
    identity: SyncIdentity,
    token: string,
    loaded: LoadResult,
    ctx: RunContext
  ): Promise<Step> => {
    if (loaded.status === "auth") return done({ kind: "auth" });
    if (loaded.status === "deleted") return handleDeleted(identity);
    if (loaded.status === "error") return done({ kind: "error" });
    if (loaded.status === "unchanged") return retry(await deps.load(token));

    const local = deps.readLocal();
    const deferred = deps.deferredKeys();
    const cloud =
      loaded.status === "found" ? parseCloudSave(loaded.save) : null;
    const cloudRev = loaded.status === "found" ? loaded.save.rev : null;
    const cloudUpdatedAt =
      loaded.status === "found" ? loaded.save.updatedAt : deps.now();
    const cloudContent = cloud ? cloud.content : emptyContent();
    const projected = cloud
      ? projectDeferred(local.content, cloudContent, deferred)
      : local.content;

    let record = records.getRecord(identity.uid);
    if (record && (!cloud || (cloudRev !== null && cloudRev < record.rev))) {
      records.clearRecord(identity.uid);
      record = null;
    }

    const pending = records.getPending(identity.uid);
    if (pending) {
      records.clearPending(identity.uid);
      if (
        cloud &&
        cloudRev !== null &&
        contentEquals(cloudContent, pending.content)
      ) {
        record = {
          rev: cloudRev,
          snapshot: pending.content,
          syncedAt: cloudUpdatedAt,
        };
        records.setRecord(identity.uid, record);
        records.setOwner(identity);
      }
    }

    if (
      cloud &&
      cloudRev !== null &&
      (!record || contentEquals(cloudContent, record.snapshot)) &&
      contentEquals(projected, cloudContent)
    ) {
      return done(
        commit(identity, cloudContent, cloudRev, cloudUpdatedAt, deferred)
      );
    }

    const owner = records.getOwner();
    if (
      owner &&
      owner.uid !== identity.uid &&
      !ctx.forcedAdd &&
      !isPristine(projected)
    ) {
      const stashed = records.getStash(identity.uid);
      if (stashed) {
        stashLocal(owner, local);
        deps.applyLocal(stashed.content, stashed.activity, deferred);
        records.removeStash(identity.uid);
        records.setOwner(identity);
        return retry(loaded);
      }
      const choice = await deps.askUser({
        kind: "other_account",
        previousLabel: owner.label,
      });
      if (choice === "fresh") {
        stashLocal(owner, local);
        deps.applyLocal(
          cloud ? cloudContent : emptyContent(),
          cloud ? cloud.activity : EMPTY_ACTIVITY,
          deferred
        );
        records.setOwner(identity);
        return retry(loaded);
      }
      ctx.forcedAdd = true;
    }

    const legacy = owner === null && deps.hasLegacyHint();
    const localIsLater = cloud
      ? isLocalActivityLater(local.activity, cloud.activity)
      : true;

    let merged: SyncContent;
    let needsInvariantCheck = false;
    if (!cloud) {
      merged = projected;
    } else if (!ctx.forcedAdd && record) {
      merged = mergeContent({
        base: record.snapshot,
        local: projected,
        cloud: cloudContent,
        localIsLater,
      });
      needsInvariantCheck = true;
    } else if (!ctx.forcedAdd && isPristine(projected)) {
      merged = cloudContent;
    } else if (!ctx.forcedAdd && legacy) {
      if (dominates(cloudContent, projected)) merged = cloudContent;
      else if (dominates(projected, cloudContent)) merged = projected;
      else merged = await resolveCannotTell(ctx, projected, cloudContent);
    } else {
      merged = mergeContent({
        base: null,
        local: projected,
        cloud: cloudContent,
        localIsLater,
      });
      needsInvariantCheck = true;
    }

    if (
      needsInvariantCheck &&
      cloud &&
      !invariantHolds(merged, projected, cloudContent)
    ) {
      merged = await resolveCannotTell(ctx, projected, cloudContent);
    }

    if (!contentEquals(deps.readLocal().content, local.content))
      return retry(loaded);

    const activity = mergeActivity(
      local.activity,
      cloud ? cloud.activity : EMPTY_ACTIVITY
    );
    const mergedIsCloud = cloud !== null && contentEquals(merged, cloudContent);

    if (!contentEquals(merged, projected)) {
      records.writeBackup(local.content, "sync");
      deps.applyLocal(merged, activity, deferred);
      if (cloud && cloudRev !== null) {
        records.setRecord(identity.uid, {
          rev: cloudRev,
          snapshot: snapshotWithLocalDeferred(
            cloudContent,
            deps.readLocal().content,
            deferred
          ),
          syncedAt: record?.syncedAt ?? cloudUpdatedAt,
        });
      }
      records.setOwner(identity);
    }

    if (mergedIsCloud && cloudRev !== null) {
      return done(
        commit(identity, cloudContent, cloudRev, cloudUpdatedAt, deferred)
      );
    }

    const payload = buildPayload(merged, activity, local.language);
    let result = await deps.save(token, payload, cloudRev);
    if (result.status === "error") {
      result = await deps.save(token, payload, cloudRev);
    }

    if (result.status === "ok") {
      const outcome = commit(
        identity,
        merged,
        result.rev,
        result.updatedAt,
        deferred
      );
      return done(cloud ? outcome : { ...outcome, created: true });
    }
    if (
      result.status === "conflict" &&
      result.save &&
      result.save.rev === (cloudRev ?? 0) + 1 &&
      contentEquals(parseCloudSave(result.save).content, merged)
    ) {
      const outcome = commit(
        identity,
        merged,
        result.save.rev,
        result.save.updatedAt,
        deferred
      );
      return done(cloud ? outcome : { ...outcome, created: true });
    }
    if (result.status === "conflict") {
      return retry(
        result.save
          ? { status: "found", save: result.save }
          : { status: "not_found" }
      );
    }
    if (result.status === "deleted") return handleDeleted(identity);
    if (result.status === "auth") return done({ kind: "auth" });
    records.setPending(identity.uid, { content: merged });
    return done({ kind: "error" });
  };

  const run = async (identity: SyncIdentity): Promise<SyncOutcome> => {
    const token = await deps.getToken();
    if (!token) return { kind: "auth" };

    const ctx: RunContext = { forcedAdd: false, cannotTell: null };
    const record = records.getRecord(identity.uid);
    const owner = records.getOwner();

    let loaded: LoadResult;
    if (
      record &&
      owner?.uid === identity.uid &&
      contentEquals(deps.readLocal().content, record.snapshot)
    ) {
      loaded = await deps.load(token, record.rev);
      if (loaded.status === "unchanged") {
        records.clearPending(identity.uid);
        return { kind: "unchanged", updatedAt: record.syncedAt };
      }
    } else {
      loaded = await deps.load(token);
    }

    for (
      let attemptNumber = 0;
      attemptNumber < MAX_ATTEMPTS;
      attemptNumber += 1
    ) {
      const step = await attempt(identity, token, loaded, ctx);
      if (step.kind === "done") return step.outcome;
      loaded = step.loaded;
    }
    return { kind: "error" };
  };

  return { run };
};
