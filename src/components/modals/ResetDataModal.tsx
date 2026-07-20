import { useEffect, useState } from "react";
import { AlertTriangle, Trash2, ShieldAlert } from "lucide-react";
import { BaseModal } from "./BaseModal";
import { SettingsToggle } from "./SettingsToggle";
import { useCloudAuth } from "../../hooks/useCloudAuth";
import { getIdTokenForCurrentUser, deleteCloudSave } from "../../lib/cloudSync";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
};

const COUNTDOWN_SECONDS = 20;

const DATA_CATEGORIES: { title: string; description: string }[] = [
  {
    title: "Current game",
    description: "Current in-progress word, guesses, and cell colors.",
  },
  {
    title: "Statistics",
    description:
      "Win streak, win distribution, and success rate, for both normal and hard mode.",
  },
  {
    title: "Achievements",
    description:
      "Every achievement you've unlocked and the progress toward them.",
  },
  {
    title: "Settings",
    description:
      "Word length, hard mode, gray count, auto-gray, auto-green, and extra sounds & animations.",
  },
  {
    title: "Background",
    description:
      "Your selected background theme and any hidden video attribution buttons.",
  },
  {
    title: "Challenge & Duel links",
    description:
      "Saved progress for any custom challenge or duel links you've opened.",
  },
];

const providerLabel = (providerId: string): string => {
  if (providerId === "google.com") return "Google";
  if (providerId === "github.com") return "GitHub";
  if (providerId === "discord.com") return "Discord";
  return "your provider";
};

type Stage = "confirm" | "deleting" | "reauth";

const wipeLocalDataAndReload = () => {
  localStorage.clear();
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

    const result = await deleteAccount();
    if (result.status === "success") {
      await deleteCloudSaveRow();
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

  const handleAuthorizeReauth = async () => {
    setDeleteError(null);
    setStage("deleting");
    const result = await reauthenticateAndDeleteAccount();
    if (result.status === "success") {
      await deleteCloudSaveRow();
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

  const handleCancelReauth = () => {
    setDeleteError(null);
    setStage("confirm");
    setReauthProviderId(null);
  };

  if (stage === "reauth") {
    return (
      <BaseModal
        title="Reset All Data"
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
              For your security, deleting your account requires a recent
              sign-in. Authorize deletion to sign in again with{" "}
              {providerLabel(reauthProviderId ?? "")}, then your account and all
              its data will be permanently deleted.
            </p>
          </div>
          {deleteError && (
            <p className="font-code text-xs text-spice-red">{deleteError}</p>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancelReauth}
              className="flex-1 py-3 font-pixel text-xs tracking-widest transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "2px solid rgba(255,255,255,0.12)",
                color: "#9ca3af",
              }}
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleAuthorizeReauth}
              className="flex-1 py-3 font-pixel text-xs tracking-widest flex items-center justify-center gap-2 transition-all"
              style={{
                background: "linear-gradient(180deg, #dc3232 0%, #8c1f1f 100%)",
                border: "2px solid #dc3232",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              AUTHORIZE DELETION
            </button>
          </div>
        </div>
      </BaseModal>
    );
  }

  const isDeleting = stage === "deleting";

  return (
    <BaseModal title="Reset All Data" isOpen={isOpen} handleClose={handleClose}>
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
            This permanently erases everything Vagudle has saved in this
            browser. It cannot be undone.
          </p>
        </div>

        <div className="space-y-3">
          {DATA_CATEGORIES.map((category) => (
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

        {user && (
          <div
            className="pt-1"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            <SettingsToggle
              settingName="Also delete my account"
              flag={alsoDeleteAccount}
              handleFlag={setAlsoDeleteAccount}
              description={`Permanently deletes your ${providerLabel(
                user.providerId
              )} sign-in link to Vagudle and erases your cloud save. This cannot be undone.`}
            />
          </div>
        )}

        {deleteError && (
          <p className="font-code text-xs text-spice-red">{deleteError}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-3 font-pixel text-xs tracking-widest transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "2px solid rgba(255,255,255,0.12)",
              color: "#9ca3af",
            }}
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLocked || isDeleting}
            className="flex-1 py-3 font-pixel text-xs tracking-widest flex items-center justify-center gap-2 transition-all"
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
              ? `WAIT ${secondsLeft}s`
              : isDeleting
                ? "DELETING..."
                : alsoDeleteAccount
                  ? "DELETE ACCOUNT & DATA"
                  : "DELETE EVERYTHING"}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};
