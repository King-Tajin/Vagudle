import { Fragment } from "react";
import { Transition } from "@headlessui/react";
import {
  Swords,
  BookOpen,
  Hash,
  Target,
  RotateCcw,
  Loader,
} from "lucide-react";
import { DICT_LABELS, DICT_DESCRIPTIONS } from "../../lib/challenge";
import type { DuelConfig, DuelSaveStatus } from "../../lib/duel";

type Props = {
  isOpen: boolean;
  mode: "accept" | "complete";
  config: DuelConfig;
  onPlay?: () => void;
  onReturn: () => void;
  saveStatus?: DuelSaveStatus;
  isActivityMode?: boolean;
};

export const DuelModal = ({
  isOpen,
  mode,
  config,
  onPlay,
  onReturn,
  saveStatus = "idle",
  isActivityMode = false,
}: Props) => {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="absolute inset-0 transition-opacity"
            style={{ background: "rgba(0,0,0,0.92)" }}
          />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="ease-out duration-250"
          enterFrom="opacity-0 translate-y-4 scale-95"
          enterTo="opacity-100 translate-y-0 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0 scale-100"
          leaveTo="opacity-0 translate-y-4 scale-95"
        >
          <div
            className="relative max-w-sm w-full mx-auto shadow-2xl"
            style={{
              background: "#0a0014",
              border: "4px solid #5000aa",
            }}
          >
            <div
              className="flex items-center gap-3 px-5 py-4 border-b-2 border-obsidian-700"
              style={{ background: "rgba(10,0,20,0.97)" }}
            >
              <Swords className="w-5 h-5 text-crown-gold" />
              <h3 className="font-pixel text-sm text-crown-amber tracking-widest">
                {mode === "accept" ? "DUEL" : "DUEL COMPLETE"}
              </h3>
            </div>

            <div className="px-5 py-5 space-y-4">
              {mode === "accept" && (
                <>
                  <p className="font-code text-sm text-gray-300 leading-relaxed">
                    You have been challenged to a duel. Here's what you're up
                    against:
                  </p>

                  <div
                    className="space-y-2 p-3"
                    style={{
                      background: "rgba(80,0,170,0.1)",
                      border: "1px solid rgba(80,0,170,0.35)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Hash className="w-4 h-4 text-crown-amber flex-shrink-0" />
                      <div>
                        <p className="font-pixel text-xs text-crown-amber tracking-widest leading-none">
                          WORD LENGTH
                        </p>
                        <p className="font-code text-sm text-gray-200 mt-0.5">
                          {config.length} letters
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-crown-amber flex-shrink-0" />
                      <div>
                        <p className="font-pixel text-xs text-crown-amber tracking-widest leading-none">
                          DICTIONARY
                        </p>
                        <p className="font-code text-sm text-gray-200 mt-0.5">
                          {DICT_LABELS[config.dict]} —{" "}
                          <span className="text-gray-400 text-xs">
                            {DICT_DESCRIPTIONS[config.dict]}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Target className="w-4 h-4 text-crown-amber flex-shrink-0" />
                      <div>
                        <p className="font-pixel text-xs text-crown-amber tracking-widest leading-none">
                          GUESSES
                        </p>
                        <p className="font-code text-sm text-gray-200 mt-0.5">
                          {config.guesses} attempts
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="font-code text-xs text-gray-500 leading-snug">
                    Your progress is saved for 24 hours. Revisit this link any
                    time to resume.
                  </p>
                  <p
                    className="font-code text-xs leading-snug"
                    style={{ color: "rgba(212,175,55,0.6)" }}
                  >
                    ⚠ Results do not count toward your stats. ⚠
                  </p>

                  <button
                    onClick={onPlay}
                    className="w-full py-3 font-pixel text-xs tracking-widest flex items-center justify-center gap-2 transition-all"
                    style={{
                      background:
                        "linear-gradient(180deg, #d4af37 0%, #b8860b 100%)",
                      border: "2px solid #d4af37",
                      color: "#0a0014",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.filter = "brightness(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.filter = "brightness(1)";
                    }}
                  >
                    <Swords className="w-3.5 h-3.5" />
                    PLAY DUEL
                  </button>
                </>
              )}

              {mode === "complete" && (
                <>
                  <p
                    className="font-pixel text-xs tracking-widest text-center"
                    style={{
                      color:
                        saveStatus === "failed"
                          ? "var(--color-tajin-red, #ef4444)"
                          : saveStatus === "saved"
                          ? "var(--color-crown-amber, #f59e0b)"
                          : "#6b7280",
                    }}
                  >
                    {saveStatus === "failed"
                      ? "RESULT NOT RECORDED"
                      : saveStatus === "saved"
                      ? "YOUR RESULT HAS BEEN RECORDED"
                      : "SAVING RESULT..."}
                  </p>
                  <p className="font-code text-xs text-gray-500 text-center leading-snug">
                    {saveStatus === "failed"
                      ? "There was a problem saving your result. Please let the host know."
                      : saveStatus === "saved"
                      ? "The winner will be announced once both players have finished."
                      : "Please wait while your result is being recorded."}
                  </p>

                  <div
                    className="p-3 flex items-center gap-3"
                    style={{
                      background: "rgba(80,0,170,0.08)",
                      border: "1px solid rgba(80,0,170,0.25)",
                    }}
                  >
                    {saveStatus === "saving" && (
                      <>
                        <Loader className="w-4 h-4 text-gray-400 animate-spin flex-shrink-0" />
                        <p className="font-code text-xs text-gray-400">
                          Saving results...
                        </p>
                      </>
                    )}
                    {saveStatus === "saved" && (
                      <p className="font-code text-xs text-tajin-lime">
                        Results saved successfully.
                      </p>
                    )}
                    {saveStatus === "failed" && (
                      <p className="font-code text-xs text-tajin-red leading-snug">
                        Failed to save results after 3 attempts. Your result was
                        not recorded.
                      </p>
                    )}
                    {saveStatus === "idle" && (
                      <p className="font-code text-xs text-gray-500">
                        Preparing to save results...
                      </p>
                    )}
                  </div>

                  {!isActivityMode && (
                    <button
                      onClick={onReturn}
                      disabled={
                        saveStatus === "saving" || saveStatus === "idle"
                      }
                      className="w-full py-3 font-pixel text-xs tracking-widest flex items-center justify-center gap-2 transition-all"
                      style={{
                        background:
                          saveStatus === "saving" || saveStatus === "idle"
                            ? "rgba(255,255,255,0.02)"
                            : "rgba(255,255,255,0.04)",
                        border: "2px solid rgba(255,255,255,0.12)",
                        color:
                          saveStatus === "saving" || saveStatus === "idle"
                            ? "#4b5563"
                            : "#9ca3af",
                        cursor:
                          saveStatus === "saving" || saveStatus === "idle"
                            ? "not-allowed"
                            : "pointer",
                      }}
                      onMouseEnter={(e) => {
                        if (saveStatus === "saving" || saveStatus === "idle")
                          return;
                        e.currentTarget.style.filter = "brightness(1.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.filter = "brightness(1)";
                      }}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      RETURN TO NORMAL GAME
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </Transition.Child>
      </div>
    </Transition.Root>
  );
};
