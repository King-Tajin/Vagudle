import React from "react";
import { Hash, BookOpen, Target } from "lucide-react";
import { SettingsToggle } from "../../SettingsToggle";
import { BackgroundDropdown } from "../BackgroundDropdown";
import { CompactDropdown } from "../CompactDropdown";
import {
  DICT_LABELS,
  DICT_DESCRIPTIONS,
  type ChallengeConfig,
} from "../../../../lib/challenge";
import type { DuelConfig } from "../../../../lib/duel";
import { LANGUAGES, type Language } from "../../../../constants/languages";
import type { GameSettingsValues, GameSettingsHandlers } from "../index";
import strings from "../../../../constants/strings";

export const GeneralSettingsPage = ({
  wordLength,
  onWordLengthChange,
  settings,
  settingsHandlers,
  challengeConfig,
  unlockedAchievementIds,
  isMobile,
  freeBackgroundsMode,
  isBackgroundDropdownOpen,
  setIsBackgroundDropdownOpen,
  handleHardModeChange,
  handleLanguageChange,
  isSavingLanguage = false,
}: {
  wordLength: number;
  onWordLengthChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  settings: GameSettingsValues;
  settingsHandlers: GameSettingsHandlers;
  challengeConfig?: ChallengeConfig | DuelConfig | null;
  unlockedAchievementIds: string[];
  isMobile: boolean;
  freeBackgroundsMode: boolean;
  isBackgroundDropdownOpen: boolean;
  setIsBackgroundDropdownOpen: (open: boolean) => void;
  handleHardModeChange: (value: boolean) => void;
  handleLanguageChange: (value: Language) => void;
  isSavingLanguage?: boolean;
}) => {
  return (
    <div className="flex flex-col divide-y divide-obsidian-700">
      {challengeConfig ? (
        <div className="py-3 space-y-2">
          <p className="font-pixel text-xs text-crown-amber tracking-widest leading-none mb-2">
            {challengeConfig.id === "daily"
              ? strings.GENERAL_SETTINGS_DAILY_MODE_ACTIVE_TEXT
              : strings.GENERAL_SETTINGS_CUSTOM_CHALLENGE_ACTIVE_TEXT}
          </p>
          <div
            className="p-3 space-y-2"
            style={{
              background: "rgba(80,0,170,0.1)",
              border: "1px solid rgba(80,0,170,0.35)",
            }}
          >
            <div className="flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 text-crown-amber shrink-0" />
              <span className="font-code text-xs text-gray-300">
                {strings.DAILY_SCHEDULE_WORD_LENGTH_TEXT(
                  challengeConfig.length
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-crown-amber shrink-0" />
              <span className="font-code text-xs text-gray-300">
                {DICT_LABELS[challengeConfig.dict]}{" "}
                {strings.CHALLENGE_DICTIONARY_SUFFIX_TEXT}{" "}
                <span className="text-gray-500">
                  {DICT_DESCRIPTIONS[challengeConfig.dict]}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-crown-amber shrink-0" />
              <span className="font-code text-xs text-gray-300">
                {strings.CHALLENGE_GUESSES_ALLOWED_TEXT(
                  challengeConfig.guesses
                )}
              </span>
            </div>
          </div>
          <p className="font-code text-xs text-gray-500 leading-snug">
            {challengeConfig.id === "daily"
              ? strings.GENERAL_SETTINGS_DAILY_LOCKED_TEXT
              : strings.GENERAL_SETTINGS_CHALLENGE_LOCKED_TEXT}
          </p>
        </div>
      ) : (
        <>
          <div className="py-3">
            <div className="flex justify-between items-center mb-3">
              <div className="text-left">
                <p className="font-pixel text-xs text-crown-amber tracking-widest leading-none">
                  {strings.DAILY_MODAL_WORD_LENGTH_LABEL}
                </p>
                <p className="font-code text-xs mt-1.5 text-gray-500">
                  {strings.GENERAL_SETTINGS_WORD_LENGTH_HINT_TEXT}
                </p>
              </div>
              <span className="font-pixel text-2xl text-spice-lime w-10 text-center tabular-nums">
                {wordLength}
              </span>
            </div>

            <div className="flex items-center gap-3 py-2">
              <span className="font-pixel text-xs text-gray-500">4</span>
              <div className="relative flex-1 h-2 mx-2.5">
                <div
                  className="absolute inset-0"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 4,
                  }}
                />
                {[5, 6].map((tick) => (
                  <div
                    key={tick}
                    className="absolute top-1/2 w-1.5 h-1.5"
                    style={{
                      left: `${((tick - 4) / 3) * 100}%`,
                      transform: "translate(-50%, -50%)",
                      background: "rgba(255,255,255,0.25)",
                      zIndex: 1,
                    }}
                  />
                ))}
                <div
                  className="absolute inset-y-0 left-0 transition-[width] duration-150"
                  style={{
                    width: `${((wordLength - 4) / 3) * 100}%`,
                    background: "linear-gradient(90deg, #28007c, #5000aa)",
                    borderRadius: 4,
                    zIndex: 2,
                  }}
                />
                <div
                  className="absolute top-1/2 transition-[left] duration-150 pointer-events-none w-5.5 h-5.5 rounded-full bg-[linear-gradient(180deg,#5000aa_0%,#28007c_100%)] border-2 border-[#7020cc] shadow-[0_0_8px_rgba(80,0,170,0.6)] z-3"
                  style={{
                    left: `${((wordLength - 4) / 3) * 100}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                />
                <input
                  type="range"
                  min={4}
                  max={7}
                  step={1}
                  value={wordLength}
                  onChange={onWordLengthChange}
                  aria-label={strings.GENERAL_SETTINGS_WORD_LENGTH_ARIA_LABEL}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  style={{
                    height: 22,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 4,
                  }}
                />
              </div>
              <span className="font-pixel text-xs text-gray-500">7</span>
            </div>
          </div>

          <SettingsToggle
            settingName={strings.SETTINGS_HARD_MODE_LABEL}
            flag={settings.hardMode}
            handleFlag={handleHardModeChange}
            description={strings.SETTINGS_HARD_MODE_DESCRIPTION}
          />
        </>
      )}

      <SettingsToggle
        settingName={strings.SETTINGS_SHOW_GRAY_COUNT_LABEL}
        flag={settings.showGrayCount}
        handleFlag={settingsHandlers.setShowGrayCount}
        description={strings.SETTINGS_SHOW_GRAY_COUNT_DESCRIPTION}
      />
      <SettingsToggle
        settingName={strings.SETTINGS_AUTO_GRAY_LABEL}
        flag={settings.autoGray}
        handleFlag={settingsHandlers.setAutoGray}
        description={strings.SETTINGS_AUTO_GRAY_DESCRIPTION}
      />
      <SettingsToggle
        settingName={strings.SETTINGS_AUTO_GREEN_LABEL}
        flag={settings.autoGreen}
        handleFlag={settingsHandlers.setAutoGreen}
        description={strings.SETTINGS_AUTO_GREEN_DESCRIPTION}
      />

      <div className="flex justify-between gap-4 py-3">
        <div className="text-left mt-1">
          <p className="font-pixel text-xs text-crown-amber tracking-widest leading-none">
            {strings.SETTINGS_BACKGROUND_LABEL}
          </p>
          <p className="font-code text-xs mt-1.5 text-gray-500 leading-snug">
            {freeBackgroundsMode
              ? strings.SETTINGS_BACKGROUND_DESCRIPTION_FREE
              : strings.SETTINGS_BACKGROUND_DESCRIPTION_LOCKED}
          </p>
        </div>
        <BackgroundDropdown
          currentId={settings.backgroundId}
          unlockedIds={unlockedAchievementIds}
          isMobile={isMobile}
          freeBackgroundsMode={freeBackgroundsMode}
          isOpen={isBackgroundDropdownOpen}
          onOpenChange={setIsBackgroundDropdownOpen}
          onChange={settingsHandlers.setBackgroundId}
        />
      </div>

      <div className="flex justify-between gap-4 py-3">
        <div className="text-left mt-1">
          <p className="font-pixel text-xs text-crown-amber tracking-widest leading-none">
            {strings.SETTINGS_LANGUAGE_LABEL}
          </p>
          <p className="font-code text-xs mt-1.5 text-gray-500 leading-snug">
            {strings.SETTINGS_LANGUAGE_DESCRIPTION}
          </p>
          {isSavingLanguage && (
            <p className="font-code text-[10px] mt-1 text-gray-500 leading-snug">
              {strings.SETTINGS_LANGUAGE_SAVING_TEXT}
            </p>
          )}
        </div>
        <CompactDropdown
          value={settings.language}
          options={LANGUAGES.map((lang) => ({
            value: lang.code,
            label: lang.label,
          }))}
          onChange={(value) => handleLanguageChange(value as Language)}
          ariaLabel={strings.SETTINGS_LANGUAGE_ARIA_LABEL}
        />
      </div>
    </div>
  );
};
