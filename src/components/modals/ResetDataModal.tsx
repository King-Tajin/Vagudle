import { useEffect, useState } from "react";
import { AlertTriangle, Trash2, ShieldAlert, Info } from "lucide-react";
import { BaseModal } from "./BaseModal";
import { SettingsToggle } from "./SettingsToggle";
import { useCloudAuth } from "../../hooks/useCloudAuth";
import type { DeleteAccountResult } from "../../hooks/useCloudAuth";
import { getIdTokenForCurrentUser, deleteCloudSave } from "../../lib/cloudSync";
import {
  MODAL_TITLE_RESET_ALL_DATA,
  PROVIDER_LABEL_DEFAULT,
  RESET_DATA_CATEGORIES,
  RESET_DATA_DELETION_STEPS,
  RESET_DATA_DELETION_DELETED_ITEMS,
  RESET_DATA_DELETION_KEPT_TEXT,
  RESET_DATA_REAUTH_TEXT_BEFORE_PROVIDER,
  RESET_DATA_REAUTH_TEXT_AFTER_PROVIDER,
  RESET_DATA_CANCEL_BUTTON_TEXT,
  RESET_DATA_AUTHORIZE_BUTTON_TEXT,
  RESET_DATA_WARNING_TEXT,
  RESET_DATA_ALSO_DELETE_ACCOUNT_LABEL,
  RESET_DATA_DETAILS_ARIA_LABEL,
  RESET_DATA_DETAILS_BUTTON_TEXT,
  RESET_DATA_ACCOUNT_DESC_BEFORE_PROVIDER,
  RESET_DATA_ACCOUNT_DESC_AFTER_PROVIDER,
  RESET_DATA_NOT_SIGNED_IN_TEXT,
  RESET_DATA_WAIT_BUTTON_TEXT,
  RESET_DATA_DELETING_BUTTON_TEXT,
  RESET_DATA_DELETE_ACCOUNT_AND_DATA_BUTTON_TEXT,
  RESET_DATA_DELETE_EVERYTHING_BUTTON_TEXT,
  RESET_DATA_DETAILS_MODAL_TITLE,
  RESET_DATA_HOW_TO_DELETE_HEADING,
  RESET_DATA_WHAT_GETS_DELETED_HEADING,
  RESET_DATA_WHATS_KEPT_HEADING,
  RESET_DATA_CLOSE_BUTTON_TEXT,
} from "../../constants/strings";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
};

const COUNTDOWN_SECONDS = 20;

const providerLabel = (providerId: string): string => {
  if (providerId === "google.com") return "Google";
  if (providerId === "github.com") return "GitHub";
  if (providerId === "discord.com") return "Discord";
  return PROVIDER_LABEL_DEFAULT;
};

type Stage = "confirm" | "deleting" | "reauth";

const wipeLocalDataAndReload = () => {
  localStorage.clear();
  if (window.location.pathname === "/delete-account") {
    window.history.replaceState({}, "", "/");
  }
  window.location.reload();
};

const deleteCloudSaveRow = async () => {
  const idToken = await getIdTokenForCurrentUser();
  if (idToken) await deleteCloudSave(idToken);
};

export const ResetDataModal = ({ isOpen, handleClose }: Props) => {
  const { user, deleteAccount, reauthenticateAndDeleteAccount } =
    useCloudAuth();
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [alsoDeleteAccount, setAlsoDeleteAccount] = useState(false);
  const [stage, setStage] = useState<Stage>("confirm");
  const [reauthProviderId, setReauthProviderId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const applyDeleteAccountResult = (result: DeleteAccountResult) => {
    if (result.status === "success") {
      wipeLocalDataAndReload();
      return;
    }
    if (result.status === "needs_reauth") {
      setReauthProviderId(result.providerId);
      setStage("reauth");
      return;
    }
    setDeleteError(result.message);
    setStage("confirm");
  };

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      setSecondsLeft(COUNTDOWN_SECONDS);
      setAlsoDeleteAccount(false);
      setStage("confirm");
      setReauthProviderId(null);
      setDeleteError(null);
    }
  }

  useEffect(() => {
    if (!isOpen || secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [isOpen, secondsLeft]);

  const isLocked = secondsLeft > 0;

  const handleConfirm = async () => {
    if (isLocked) return;

    if (!alsoDeleteAccount || !user) {
      wipeLocalDataAndReload();
      return;
    }

    setDeleteError(null);
    setStage("deleting");

    await deleteCloudSaveRow();
    const result = await deleteAccount();
    applyDeleteAccountResult(result);
  };

  const handleAuthorizeReauth = async () => {
    setDeleteError(null);
    setStage("deleting");
    await deleteCloudSaveRow();
    const result = await reauthenticateAndDeleteAccount();
    applyDeleteAccountResult(result);
  };

  const handleCancelReauth = () => {
    setDeleteError(null);
    setStage("confirm");
    setReauthProviderId(null);
  };

  if (stage === "reauth") {
    return (
      <BaseModal
        title={MODAL_TITLE_RESET_ALL_DATA}
        isOpen={isOpen}
        handleClose={handleClose}
      >
        <div className="space-y-4">
          <div
            className="flex items-start gap-2.5 p-3"
            style={{
              background: "rgba(196,30,58,0.1)",
              border: "1px solid rgba(196,30,58,0.4)",
            }}
          >
            <ShieldAlert className="w-4 h-4 text-spice-red shrink-0 mt-0.5" />
            <p className="font-code text-xs text-gray-300 leading-snug">
              {RESET_DATA_REAUTH_TEXT_BEFORE_PROVIDER}{" "}
              {providerLabel(reauthProviderId ?? "")}
              {RESET_DATA_REAUTH_TEXT_AFTER_PROVIDER}
            </p>
          </div>
          {deleteError && (
            <p className="font-code text-xs text-spice-red">{deleteError}</p>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancelReauth}
              className="flex-1 py-3 font-pixel text-xs tracking-widest transition-colors"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "2px solid rgba(255,255,255,0.12)",
                color: "#9ca3af",
              }}
            >
              {RESET_DATA_CANCEL_BUTTON_TEXT}
            </button>
            <button
              type="button"
              onClick={handleAuthorizeReauth}
              className="flex-1 py-3 font-pixel text-xs tracking-widest flex items-center justify-center gap-2 transition-colors"
              style={{
                background: "linear-gradient(180deg, #dc3232 0%, #8c1f1f 100%)",
                border: "2px solid #dc3232",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {RESET_DATA_AUTHORIZE_BUTTON_TEXT}
            </button>
          </div>
        </div>
      </BaseModal>
    );
  }

  const isDeleting = stage === "deleting";

  return (
    <BaseModal
      title={MODAL_TITLE_RESET_ALL_DATA}
      isOpen={isOpen}
      handleClose={handleClose}
    >
      <div className="space-y-4">
        <div
          className="flex items-start gap-2.5 p-3"
          style={{
            background: "rgba(196,30,58,0.1)",
            border: "1px solid rgba(196,30,58,0.4)",
          }}
        >
          <AlertTriangle className="w-4 h-4 text-spice-red shrink-0 mt-0.5" />
          <p className="font-code text-xs text-gray-300 leading-snug">
            {RESET_DATA_WARNING_TEXT}
          </p>
        </div>

        <div className="space-y-3">
          {RESET_DATA_CATEGORIES.map((category) => (
            <div key={category.title}>
              <p className="font-pixel text-[10px] text-crown-amber tracking-widest mb-0.5">
                {category.title.toUpperCase()}
              </p>
              <p className="font-code text-xs text-gray-500 leading-snug">
                {category.description}
              </p>
            </div>
          ))}
        </div>

        <div
          className="pt-1"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <SettingsToggle
            settingName={RESET_DATA_ALSO_DELETE_ACCOUNT_LABEL}
            flag={!!user && alsoDeleteAccount}
            handleFlag={setAlsoDeleteAccount}
            disabled={!user}
            labelExtra={
              <button
                type="button"
                onClick={() => setIsDetailsOpen(true)}
                aria-label={RESET_DATA_DETAILS_ARIA_LABEL}
                className="flex items-center gap-1 shrink-0 p-0.5 text-[10px] font-medium leading-none text-gray-500 hover:text-crown-amber transition-colors"
              >
                <Info className="w-3 h-3" />
                {RESET_DATA_DETAILS_BUTTON_TEXT}
              </button>
            }
            description={
              user
                ? `${RESET_DATA_ACCOUNT_DESC_BEFORE_PROVIDER} ${providerLabel(
                    user.providerId
                  )} ${RESET_DATA_ACCOUNT_DESC_AFTER_PROVIDER}`
                : RESET_DATA_NOT_SIGNED_IN_TEXT
            }
          />
        </div>

        {deleteError && (
          <p className="font-code text-xs text-spice-red">{deleteError}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-3 font-pixel text-xs tracking-widest transition-colors"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "2px solid rgba(255,255,255,0.12)",
              color: "#9ca3af",
            }}
          >
            {RESET_DATA_CANCEL_BUTTON_TEXT}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLocked || isDeleting}
            className="flex-1 py-3 font-pixel text-xs tracking-widest flex items-center justify-center gap-2 transition-colors"
            style={{
              background:
                isLocked || isDeleting
                  ? "rgba(255,255,255,0.04)"
                  : "linear-gradient(180deg, #dc3232 0%, #8c1f1f 100%)",
              border: `2px solid ${isLocked || isDeleting ? "#3a3a4a" : "#dc3232"}`,
              color: isLocked || isDeleting ? "#4b5563" : "#fff",
              cursor: isLocked || isDeleting ? "default" : "pointer",
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isLocked
              ? RESET_DATA_WAIT_BUTTON_TEXT(secondsLeft)
              : isDeleting
                ? RESET_DATA_DELETING_BUTTON_TEXT
                : alsoDeleteAccount
                  ? RESET_DATA_DELETE_ACCOUNT_AND_DATA_BUTTON_TEXT
                  : RESET_DATA_DELETE_EVERYTHING_BUTTON_TEXT}
          </button>
        </div>
      </div>

      <BaseModal
        title={RESET_DATA_DETAILS_MODAL_TITLE}
        isOpen={isDetailsOpen}
        handleClose={() => setIsDetailsOpen(false)}
        zIndexClass="z-[70]"
      >
        <div className="space-y-4 text-left">
          <div>
            <p className="font-pixel text-[10px] text-crown-amber tracking-widest mb-1.5">
              {RESET_DATA_HOW_TO_DELETE_HEADING}
            </p>
            <ol className="list-decimal list-inside space-y-1">
              {RESET_DATA_DELETION_STEPS.map((step) => (
                <li
                  key={step}
                  className="font-code text-xs text-gray-400 leading-snug"
                >
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div>
            <p className="font-pixel text-[10px] text-crown-amber tracking-widest mb-1.5">
              {RESET_DATA_WHAT_GETS_DELETED_HEADING}
            </p>
            <ul className="list-disc list-inside space-y-1">
              {RESET_DATA_DELETION_DELETED_ITEMS.map((item) => (
                <li
                  key={item}
                  className="font-code text-xs text-gray-400 leading-snug"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-pixel text-[10px] text-crown-amber tracking-widest mb-1.5">
              {RESET_DATA_WHATS_KEPT_HEADING}
            </p>
            <p className="font-code text-xs text-gray-400 leading-snug">
              {RESET_DATA_DELETION_KEPT_TEXT}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsDetailsOpen(false)}
            className="w-full py-2.5 font-pixel text-xs tracking-widest transition-colors"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "2px solid rgba(255,255,255,0.12)",
              color: "#9ca3af",
            }}
          >
            {RESET_DATA_CLOSE_BUTTON_TEXT}
          </button>
        </div>
      </BaseModal>
    </BaseModal>
  );
};
