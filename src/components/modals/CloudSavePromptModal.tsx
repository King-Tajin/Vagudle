import { BaseModal } from "./BaseModal";
import type { PromptChoice, SyncPrompt } from "../../lib/cloudSave/engine";
import strings from "../../constants/strings";

type Props = {
  prompt: SyncPrompt;
  onChoose: (choice: PromptChoice) => void;
};

type Option = {
  choice: PromptChoice;
  label: string;
  description: string;
};

type PromptContent = {
  title: string;
  intro: string;
  options: Option[];
};

const getPromptContent = (prompt: SyncPrompt): PromptContent => {
  if (prompt.kind === "other_account") {
    return {
      title: strings.MODAL_TITLE_CLOUD_SAVE_OTHER_ACCOUNT,
      intro: strings.CLOUD_SAVE_PROMPT_OTHER_ACCOUNT_INTRO_TEXT(
        prompt.previousLabel
      ),
      options: [
        {
          choice: "add",
          label: strings.CLOUD_SAVE_PROMPT_ADD_BUTTON_TEXT,
          description: strings.CLOUD_SAVE_PROMPT_ADD_DESCRIPTION_TEXT,
        },
        {
          choice: "fresh",
          label: strings.CLOUD_SAVE_PROMPT_FRESH_BUTTON_TEXT,
          description: strings.CLOUD_SAVE_PROMPT_FRESH_DESCRIPTION_TEXT(
            prompt.previousLabel
          ),
        },
      ],
    };
  }
  return {
    title: strings.MODAL_TITLE_CLOUD_SAVE_CANNOT_TELL,
    intro: strings.CLOUD_SAVE_PROMPT_CANNOT_TELL_INTRO_TEXT,
    options: [
      {
        choice: "combine",
        label: strings.CLOUD_SAVE_PROMPT_COMBINE_BUTTON_TEXT,
        description: strings.CLOUD_SAVE_PROMPT_COMBINE_DESCRIPTION_TEXT,
      },
      {
        choice: "use_cloud",
        label: strings.CLOUD_SAVE_PROMPT_USE_CLOUD_BUTTON_TEXT,
        description: strings.CLOUD_SAVE_PROMPT_USE_CLOUD_DESCRIPTION_TEXT,
      },
    ],
  };
};

const optionButtonStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "2px solid #3a3a4a",
  color: "#d1d5db",
};

export const CloudSavePromptModal = ({ prompt, onChoose }: Props) => {
  const { title, intro, options } = getPromptContent(prompt);

  return (
    <BaseModal
      title={title}
      isOpen
      handleClose={() => {}}
      maxWidthClass="sm:max-w-md"
    >
      <p className="font-code text-xs text-gray-400 leading-snug mb-4">
        {intro}
      </p>
      <div className="flex flex-col gap-4">
        {options.map((option) => (
          <div key={option.choice}>
            <button
              type="button"
              onClick={() => onChoose(option.choice)}
              className="w-full font-pixel text-xs tracking-widest px-3 py-2"
              style={optionButtonStyle}
            >
              {option.label}
            </button>
            <p className="font-code text-xs text-gray-500 leading-snug mt-1">
              {option.description}
            </p>
          </div>
        ))}
      </div>
    </BaseModal>
  );
};
