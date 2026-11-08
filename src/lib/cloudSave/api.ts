import type { CloudSavePayload, CloudSaveRow } from "./wire";

const FETCH_TIMEOUT_MS = 10000;

export type LoadResult =
  | { status: "found"; save: CloudSaveRow }
  | { status: "unchanged"; rev: number }
  | { status: "not_found" }
  | { status: "deleted" }
  | { status: "auth" }
  | { status: "error" };

export type SaveResult =
  | { status: "ok"; rev: number; updatedAt: string }
  | { status: "conflict"; save: CloudSaveRow | null }
  | { status: "deleted" }
  | { status: "auth" }
  | { status: "error" };

type ErrorBody = { error?: string; save?: CloudSaveRow };

const request = async (
  url: string,
  init: RequestInit
): Promise<Response | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

const readBody = async <T>(res: Response): Promise<T | null> => {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
};

export const loadCloudSave = async (
  token: string,
  knownRev?: number
): Promise<LoadResult> => {
  const url =
    knownRev === undefined ? "/api/load" : `/api/load?rev=${knownRev}`;
  const res = await request(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res) return { status: "error" };
  if (res.status === 404) return { status: "not_found" };
  if (res.status === 401) return { status: "auth" };
  const body = await readBody<
    ErrorBody & {
      success?: boolean;
      unchanged?: boolean;
      rev?: number;
      save?: CloudSaveRow;
    }
  >(res);
  if (res.status === 403)
    return body?.error === "account_deleted"
      ? { status: "deleted" }
      : { status: "auth" };
  if (!res.ok || !body?.success) return { status: "error" };
  if (body.unchanged && typeof body.rev === "number")
    return { status: "unchanged", rev: body.rev };
  if (body.save && typeof body.save.rev === "number")
    return { status: "found", save: body.save };
  return { status: "error" };
};

export const saveCloudSave = async (
  token: string,
  payload: CloudSavePayload,
  baseRev: number | null
): Promise<SaveResult> => {
  const res = await request("/api/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...payload, baseRev }),
  });
  if (!res) return { status: "error" };
  if (res.status === 401) return { status: "auth" };
  const body = await readBody<
    ErrorBody & { success?: boolean; updatedAt?: string; rev?: number }
  >(res);
  if (res.status === 403)
    return body?.error === "account_deleted"
      ? { status: "deleted" }
      : { status: "auth" };
  if (res.status === 409)
    return { status: "conflict", save: body?.save ?? null };
  if (
    res.ok &&
    body?.success &&
    typeof body.rev === "number" &&
    typeof body.updatedAt === "string"
  )
    return { status: "ok", rev: body.rev, updatedAt: body.updatedAt };
  return { status: "error" };
};
