import { BaseModal } from "./BaseModal";
import { DiscordSaveConflictChoice } from "../DiscordSaveConflictChoice";
import type {
  DiscordSaveChoice,
  DiscordSaveConflict,
} from "../../lib/cloudSync";
import strings from "../../constants/strings";

type Props = {
  conflict: DiscordSaveConflict;
  busy: boolean;
  error: string | null;
  onConfirm: (keep: DiscordSaveChoice) => void;
  onCancel: () => void;
};

export const DiscordSaveConflictModal = ({
  conflict,
  busy,
  error,
  onConfirm,
  onCancel,
}: Props) => (
  <BaseModal
    title={strings.MODAL_TITLE_DISCORD_SAVE_CONFLICT}
    isOpen
    handleClose={busy ? () => {} : onCancel}
    maxWidthClass="sm:max-w-md"
  >
    <DiscordSaveConflictChoice
      conflict={conflict}
      busy={busy}
      error={error}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  </BaseModal>
);
