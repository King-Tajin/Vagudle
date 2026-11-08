import { canonicalContent } from "./canonical";
import type { ActivityStamps, SyncContent, SyncIdentity } from "./types";

export const META_KEY = "vagudle-sync-meta:v1";
export const STASH_KEY = "vagudle-sync-stash:v1";
export const BACKUP_KEY = "vagudle-sync-backup:v1";

const MAX_STASH_ENTRIES = 3;

export type SyncRecord = {
  rev: number;
  snapshot: SyncContent;
  syncedAt: string;
};

export type StashEntry = {
  content: SyncContent;
  activity: ActivityStamps;
  label: string;
  savedAt: string;
};

export type PendingPush = {
  content: SyncContent;
};

type Meta = {
  owner: SyncIdentity | null;
  records: Record<string, SyncRecord>;
  pending: Record<string, PendingPush>;
};

export type RecordStore = {
  getOwner: () => SyncIdentity | null;
  setOwner: (owner: SyncIdentity | null) => void;
  getRecord: (uid: string) => SyncRecord | null;
  setRecord: (uid: string, record: SyncRecord) => void;
  clearRecord: (uid: string) => void;
  getPending: (uid: string) => PendingPush | null;
  setPending: (uid: string, pending: PendingPush) => void;
  clearPending: (uid: string) => void;
  getStash: (uid: string) => StashEntry | null;
  setStash: (uid: string, entry: StashEntry) => void;
  removeStash: (uid: string) => void;
  writeBackup: (content: SyncContent, reason: string) => void;
  clearUid: (uid: string) => void;
};

export type StorageIo = {
  read: (key: string) => string | null;
  write: (key: string, value: string) => void;
  remove: (key: string) => void;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const parseIdentity = (value: unknown): SyncIdentity | null =>
  isObject(value) &&
  typeof value.uid === "string" &&
  typeof value.label === "string"
    ? { uid: value.uid, label: value.label }
    : null;

const parseRecord = (value: unknown): SyncRecord | null =>
  isObject(value) &&
  typeof value.rev === "number" &&
  Number.isInteger(value.rev) &&
  typeof value.syncedAt === "string" &&
  isObject(value.snapshot)
    ? {
        rev: value.rev,
        snapshot: canonicalContent(value.snapshot),
        syncedAt: value.syncedAt,
      }
    : null;

const parseActivity = (value: unknown): ActivityStamps => {
  const source = isObject(value) ? value : {};
  return {
    lastPlayedAt:
      typeof source.lastPlayedAt === "string" ? source.lastPlayedAt : null,
    firstSeenAt:
      typeof source.firstSeenAt === "string" ? source.firstSeenAt : null,
  };
};

const parseStashEntry = (value: unknown): StashEntry | null =>
  isObject(value) &&
  isObject(value.content) &&
  typeof value.label === "string" &&
  typeof value.savedAt === "string"
    ? {
        content: canonicalContent(value.content),
        activity: parseActivity(value.activity),
        label: value.label,
        savedAt: value.savedAt,
      }
    : null;

const readJson = (io: StorageIo, key: string): unknown => {
  const raw = io.read(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
};

const readMeta = (io: StorageIo): Meta => {
  const parsed = readJson(io, META_KEY);
  const meta: Meta = { owner: null, records: {}, pending: {} };
  if (!isObject(parsed)) return meta;
  meta.owner = parseIdentity(parsed.owner);
  if (isObject(parsed.pending)) {
    for (const [uid, value] of Object.entries(parsed.pending)) {
      if (isObject(value) && isObject(value.content))
        meta.pending[uid] = { content: canonicalContent(value.content) };
    }
  }
  if (isObject(parsed.records)) {
    for (const [uid, value] of Object.entries(parsed.records)) {
      const record = parseRecord(value);
      if (record) meta.records[uid] = record;
    }
  }
  return meta;
};

const readStash = (io: StorageIo): Record<string, StashEntry> => {
  const parsed = readJson(io, STASH_KEY);
  const stash: Record<string, StashEntry> = {};
  if (!isObject(parsed)) return stash;
  for (const [uid, value] of Object.entries(parsed)) {
    const entry = parseStashEntry(value);
    if (entry) stash[uid] = entry;
  }
  return stash;
};

const trimStash = (
  stash: Record<string, StashEntry>
): Record<string, StashEntry> =>
  Object.fromEntries(
    Object.entries(stash)
      .sort(([, a], [, b]) => (a.savedAt < b.savedAt ? 1 : -1))
      .slice(0, MAX_STASH_ENTRIES)
  );

export const createRecordStore = (io: StorageIo): RecordStore => {
  const writeMeta = (meta: Meta) => io.write(META_KEY, JSON.stringify(meta));
  const writeStash = (stash: Record<string, StashEntry>) =>
    io.write(STASH_KEY, JSON.stringify(trimStash(stash)));

  return {
    getOwner: () => readMeta(io).owner,
    setOwner: (owner) => {
      const meta = readMeta(io);
      meta.owner = owner;
      writeMeta(meta);
    },
    getRecord: (uid) => readMeta(io).records[uid] ?? null,
    setRecord: (uid, record) => {
      const meta = readMeta(io);
      meta.records[uid] = record;
      writeMeta(meta);
    },
    clearRecord: (uid) => {
      const meta = readMeta(io);
      delete meta.records[uid];
      writeMeta(meta);
    },
    getPending: (uid) => readMeta(io).pending[uid] ?? null,
    setPending: (uid, pending) => {
      const meta = readMeta(io);
      meta.pending[uid] = pending;
      writeMeta(meta);
    },
    clearPending: (uid) => {
      const meta = readMeta(io);
      if (!(uid in meta.pending)) return;
      delete meta.pending[uid];
      writeMeta(meta);
    },
    getStash: (uid) => readStash(io)[uid] ?? null,
    setStash: (uid, entry) => {
      const stash = readStash(io);
      stash[uid] = entry;
      writeStash(stash);
    },
    removeStash: (uid) => {
      const stash = readStash(io);
      delete stash[uid];
      writeStash(stash);
    },
    writeBackup: (content, reason) =>
      io.write(
        BACKUP_KEY,
        JSON.stringify({
          content,
          reason,
          savedAt: new Date().toISOString(),
        })
      ),
    clearUid: (uid) => {
      const meta = readMeta(io);
      delete meta.records[uid];
      delete meta.pending[uid];
      if (meta.owner?.uid === uid) meta.owner = null;
      writeMeta(meta);
      const stash = readStash(io);
      delete stash[uid];
      writeStash(stash);
    },
  };
};

export const createMemoryStorageIo = (): StorageIo => {
  const values = new Map<string, string>();
  return {
    read: (key) => values.get(key) ?? null,
    write: (key, value) => {
      values.set(key, value);
    },
    remove: (key) => {
      values.delete(key);
    },
  };
};

export const createBrowserStorageIo = (): StorageIo => ({
  read: (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  write: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {}
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
});

export const clearBrowserSyncState = (uid: string): void => {
  createRecordStore(createBrowserStorageIo()).clearUid(uid);
};
