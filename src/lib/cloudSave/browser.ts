import { getIdTokenForCurrentUser } from "../cloudSync";
import { hasSignedInMarker } from "../signInMarker";
import { getLastUsedAccount } from "../lastUsedAccount";
import { loadCloudSave, saveCloudSave } from "./api";
import {
  applyContentToLocal,
  getDeferredKeys,
  readLocalSnapshot,
} from "./content";
import { createSyncEngine, type SyncDeps } from "./engine";
import { createBrowserStorageIo, createRecordStore } from "./records";

const legacyHintAtStartup =
  hasSignedInMarker() || getLastUsedAccount() !== null;

export const createBrowserSyncEngine = (
  askUser: SyncDeps["askUser"],
  onDeleted: SyncDeps["onDeleted"]
) =>
  createSyncEngine({
    getToken: getIdTokenForCurrentUser,
    load: loadCloudSave,
    save: saveCloudSave,
    readLocal: readLocalSnapshot,
    applyLocal: applyContentToLocal,
    records: createRecordStore(createBrowserStorageIo()),
    deferredKeys: getDeferredKeys,
    hasLegacyHint: () => legacyHintAtStartup,
    now: () => new Date().toISOString(),
    askUser,
    onDeleted,
  });
