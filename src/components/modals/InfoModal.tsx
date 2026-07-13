import { Fragment, useState, type ReactNode, type CSSProperties } from "react";
import { Transition, TransitionChild } from "@headlessui/react";
import {
  X,
  Gamepad2,
  Info,
  Sparkles,
  Code2,
  Send,
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Swords,
  Maximize2,
  Minimize2,
  RotateCcw,
  Trash2,
} from "lucide-react";
import CrownIcon from "@/assets/icons/crown.svg?react";

import { ActivityLink } from "../ActivityLink";
import { Cell } from "../grid/Cell";
import GreenBrushIcon from "@/assets/icons/green-brush.svg?react";
import YellowBrushIcon from "@/assets/icons/yellow-brush.svg?react";
import GrayBrushIcon from "@/assets/icons/gray-brush.svg?react";
import RecycleIcon from "@/assets/icons/recycle.svg?react";
import { ResetDataModal } from "./ResetDataModal";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  hasHiddenAttributions: boolean;
  onRestoreHiddenAttributions: () => void;
};

type Tab =
  | "howto"
  | "features"
  | "challenges"
  | "about"
  | "opensource"
  | "feedback";

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: "howto", label: "HOW TO", icon: <Gamepad2 className="w-3.5 h-3.5" /> },
  {
    id: "features",
    label: "FEATURES",
    icon: <Sparkles className="w-3.5 h-3.5" />,
  },
  {
    id: "challenges",
    label: "CHALLENGES",
    icon: <Swords className="w-3.5 h-3.5" />,
  },
  { id: "about", label: "ABOUT", icon: <Info className="w-3.5 h-3.5" /> },
  {
    id: "opensource",
    label: "SOURCE",
    icon: <Code2 className="w-3.5 h-3.5" />,
  },
  { id: "feedback", label: "FEEDBACK", icon: <Send className="w-3.5 h-3.5" /> },
];

const EMAIL_MAX = 254;
const MESSAGE_MAX = 15000;

const Badge = ({
  color,
  n,
}: {
  color: "green" | "yellow" | "gray";
  n: number;
}) => {
  const styles: Record<string, CSSProperties> = {
    green: { background: "#22c55e", borderColor: "#22c55e" },
    yellow: { background: "#eab308", borderColor: "#eab308" },
    gray: { background: "#64748b", borderColor: "#64748b" },
  };
  return (
    <div
      className="border-2 flex items-center justify-center font-bold rounded text-white text-xs"
      style={{ width: 22, height: 22, fontSize: 11, ...styles[color] }}
    >
      {n}
    </div>
  );
};

const FeedbackTab = () => {
  const [formData, setFormData] = useState({
    sentiment: "",
    category: "",
    email: "",
    message: "",
    article: "Vagudle",
  });
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const messageRemaining = MESSAGE_MAX - formData.message.length;
  const messageNearLimit = messageRemaining <= 500;
  const messageAtLimit = messageRemaining <= 0;

  const handleSubmit = async () => {
    if (!formData.sentiment || !formData.category || !formData.message) {
      setStatus("error");
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        setStatus("error");
        setErrorMessage("Failed to send feedback. Please try again.");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Failed to send feedback. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center">
        <CheckCircle className="w-14 h-14 text-tajin-lime mb-4" />
        <h2 className="font-pixel text-sm text-crown-gold mb-2 tracking-widest">
          FEEDBACK RECEIVED!
        </h2>
        <p className="font-code text-sm text-gray-400">
          Thanks for helping improve Vagudle.
        </p>
        <button
          onClick={() => {
            setStatus("idle");
            setFormData({
              sentiment: "",
              category: "",
              email: "",
              message: "",
              article: "Vagudle",
            });
          }}
          className="mt-6 font-pixel text-xs text-crown-amber underline tracking-widest"
        >
          SEND ANOTHER
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <span
          id="feedback-type-label"
          className="block font-pixel text-xs text-crown-amber mb-2 tracking-widest"
        >
          FEEDBACK TYPE *
        </span>
        <div
          role="group"
          aria-labelledby="feedback-type-label"
          className="grid grid-cols-2 gap-3"
        >
          <button
            onClick={() => setFormData({ ...formData, sentiment: "positive" })}
            className="p-3 border-2 transition-all flex flex-col items-center gap-1"
            style={{
              background:
                formData.sentiment === "positive"
                  ? "rgba(34,197,94,0.15)"
                  : "transparent",
              borderColor:
                formData.sentiment === "positive"
                  ? "#22c55e"
                  : "rgba(255,255,255,0.1)",
            }}
          >
            <ThumbsUp
              className="w-6 h-6"
              style={{
                color:
                  formData.sentiment === "positive" ? "#22c55e" : "#6b7280",
              }}
            />
            <span
              className="font-code text-xs"
              style={{
                color:
                  formData.sentiment === "positive" ? "#22c55e" : "#9ca3af",
              }}
            >
              Positive
            </span>
          </button>
          <button
            onClick={() => setFormData({ ...formData, sentiment: "negative" })}
            className="p-3 border-2 transition-all flex flex-col items-center gap-1"
            style={{
              background:
                formData.sentiment === "negative"
                  ? "rgba(220,50,50,0.15)"
                  : "transparent",
              borderColor:
                formData.sentiment === "negative"
                  ? "#dc3232"
                  : "rgba(255,255,255,0.1)",
            }}
          >
            <ThumbsDown
              className="w-6 h-6"
              style={{
                color:
                  formData.sentiment === "negative" ? "#f87171" : "#6b7280",
              }}
            />
            <span
              className="font-code text-xs"
              style={{
                color:
                  formData.sentiment === "negative" ? "#f87171" : "#9ca3af",
              }}
            >
              Negative
            </span>
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="feedback-category"
          className="block font-pixel text-xs text-crown-amber mb-2 tracking-widest"
        >
          CATEGORY *
        </label>
        <select
          id="feedback-category"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          className="w-full border-2 font-code text-sm p-2 outline-none focus-visible:ring-2 focus-visible:ring-crown-amber transition-colors"
          style={{
            background: "#0a0014",
            borderColor: formData.category
              ? "#d4af37"
              : "rgba(255,255,255,0.1)",
            color: formData.category ? "#d1d5db" : "#6b7280",
          }}
        >
          <option value="">Select a category...</option>
          <option value="bug-report">Bug Report</option>
          <option value="feature-request">Feature Request</option>
          <option value="general">General Feedback</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="feedback-email"
          className="block font-pixel text-xs text-crown-amber mb-2 tracking-widest"
        >
          EMAIL (OPTIONAL)
        </label>
        <input
          id="feedback-email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder="your.email@example.com"
          maxLength={EMAIL_MAX}
          className="w-full border-2 font-code text-sm p-2 outline-none focus-visible:ring-2 focus-visible:ring-crown-amber transition-colors"
          style={{
            background: "#0a0014",
            borderColor: "rgba(255,255,255,0.1)",
            color: "#d1d5db",
          }}
        />
        <p className="font-code text-xs text-gray-600 mt-1">
          Only if you want a response
        </p>
      </div>

      <div>
        <div className="flex justify-between items-baseline mb-2">
          <label
            htmlFor="feedback-message"
            className="font-pixel text-xs text-crown-amber tracking-widest"
          >
            YOUR FEEDBACK *
          </label>
          <span
            className="font-code text-xs tabular-nums"
            style={{
              color: messageAtLimit
                ? "#f87171"
                : messageNearLimit
                ? "#fbbf24"
                : "#4b5563",
            }}
          >
            {(MESSAGE_MAX - formData.message.length).toLocaleString()}{" "}
            characters left
          </span>
        </div>
        <div className="relative">
          <textarea
            id="feedback-message"
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Tell us what's on your mind..."
            rows={5}
            maxLength={MESSAGE_MAX}
            className="w-full border-2 font-code text-sm p-2 pb-7 outline-none focus-visible:ring-2 focus-visible:ring-crown-amber transition-colors resize-none"
            style={{
              background: "#0a0014",
              borderColor: formData.message
                ? "#d4af37"
                : "rgba(255,255,255,0.1)",
              color: "#d1d5db",
            }}
          />
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            title="Expand"
            aria-label="Expand"
            className="absolute bottom-2 right-2 p-1 transition-opacity opacity-40 hover:opacity-100"
            style={{ color: "#d4af37" }}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {isFullscreen && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={() => setIsFullscreen(false)}
          >
            <div
              className="flex flex-col"
              style={{
                width: "90vw",
                height: "90vh",
                background: "#0a0014",
                border: "2px solid rgba(212,175,55,0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: "rgba(255,255,255,0.1)" }}
              >
                <span className="font-pixel text-xs text-crown-amber tracking-widest">
                  YOUR FEEDBACK
                </span>
                <div className="flex items-center gap-3">
                  <span
                    className="font-code text-xs tabular-nums"
                    style={{
                      color: messageAtLimit
                        ? "#f87171"
                        : messageNearLimit
                        ? "#fbbf24"
                        : "#4b5563",
                    }}
                  >
                    {(MESSAGE_MAX - formData.message.length).toLocaleString()}{" "}
                    characters left
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(false)}
                    title="Collapse"
                    aria-label="Collapse"
                    className="p-1 transition-opacity opacity-60 hover:opacity-100"
                    style={{ color: "#d4af37" }}
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Tell us what's on your mind..."
                maxLength={MESSAGE_MAX}
                autoFocus
                className="flex-1 w-full font-code text-sm p-4 outline-none focus-visible:ring-2 focus-visible:ring-crown-amber resize-none"
                style={{
                  background: "#0a0014",
                  color: "#d1d5db",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {status === "error" && (
        <div
          className="p-3 border-l-4 flex items-start gap-2"
          style={{ background: "rgba(220,50,50,0.08)", borderColor: "#dc3232" }}
        >
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="font-code text-xs text-gray-300">{errorMessage}</p>
        </div>
      )}

      <button
        disabled={status === "submitting"}
        onClick={handleSubmit}
        className="w-full py-3 font-pixel text-xs tracking-widest flex items-center justify-center gap-2 transition-all"
        style={{
          background:
            status === "submitting"
              ? "rgba(255,215,0,0.05)"
              : "rgba(255,215,0,0.12)",
          border: "2px solid",
          borderColor:
            status === "submitting" ? "rgba(255,215,0,0.2)" : "#d4af37",
          color: status === "submitting" ? "#6b7280" : "#d4af37",
          cursor: status === "submitting" ? "not-allowed" : "pointer",
        }}
      >
        <Send className="w-4 h-4" />
        {status === "submitting" ? "SENDING..." : "SEND FEEDBACK"}
      </button>
    </div>
  );
};

export const InfoModal = ({
  isOpen,
  handleClose,
  hasHiddenAttributions,
  onRestoreHiddenAttributions,
}: Props) => {
  const [activeTab, setActiveTab] = useState<Tab>("howto");
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  return (
    <>
      <Transition show={isOpen} as={Fragment}>
        <div className="fixed inset-0 z-[60] overflow-hidden">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              role="button"
              tabIndex={0}
              aria-label="Close"
              className="absolute inset-0 transition-opacity"
              style={{ background: "rgba(0,0,0,0.75)" }}
              onClick={handleClose}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleClose();
              }}
            />
          </TransitionChild>

          <div className="absolute inset-y-0 right-0 flex max-w-full">
            <TransitionChild
              as={Fragment}
              enter="transform transition ease-out duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in duration-250"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div
                className="relative w-screen max-w-sm flex flex-col h-full shadow-2xl"
                style={{
                  background: "#0a0014",
                  borderLeft: "4px solid",
                  borderImageSlice: 1,
                  borderImageSource:
                    "linear-gradient(180deg, #5000aa 0%, #28007c 100%)",
                }}
              >
                <div
                  className="flex items-center justify-between px-5 py-4 border-b-2 border-obsidian-700 shrink-0"
                  style={{ background: "rgba(10,0,20,0.97)" }}
                >
                  <div className="flex items-center gap-3">
                    <CrownIcon className="w-10 h-10 text-crown-gold" />
                    <h3 className="font-pixel text-sm text-crown-amber tracking-widest">
                      INFORMATION
                    </h3>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 bg-obsidian-700 hover:bg-obsidian-600 text-gray-400 hover:text-white transition-colors pixel-border-sm"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div
                  className="flex shrink-0 border-b-2 border-obsidian-700"
                  style={{ background: "rgba(10,0,20,0.97)" }}
                >
                  {TABS.map((tab) => {
                    const active = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="flex-1 flex flex-col items-center gap-1 py-3 px-1 transition-colors"
                        style={{
                          color: active ? "#d4af37" : "#6b7280",
                          background: active
                            ? "rgba(255,215,0,0.06)"
                            : "transparent",
                          borderBottom: active
                            ? "2px solid #d4af37"
                            : "2px solid transparent",
                          marginBottom: "-2px",
                        }}
                      >
                        {tab.icon}
                        <span className="font-pixel text-[9px] tracking-widest">
                          {tab.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {activeTab === "howto" && (
                    <div className="space-y-3">
                      <p className="font-code text-sm text-gray-400 leading-relaxed">
                        Type a word and press{" "}
                        <span className="text-crown-gold">Enter</span> to submit
                        a guess. You have 11 tries to find the hidden word.
                      </p>

                      <div className="border-t border-obsidian-700" />

                      <p className="font-pixel text-xs text-crown-amber tracking-widest">
                        PAINT THE RESULT
                      </p>
                      <p className="font-code text-sm text-gray-400 leading-relaxed">
                        Cells don't color automatically. Select a brush, then
                        click or drag cells to mark what you can figure out with
                        the limited clues you have.
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <GreenBrushIcon className="w-8 h-8 shrink-0" />
                          <Cell
                            isCompleted={true}
                            value="A"
                            status="correct"
                            cellSize={32}
                          />
                          <span className="font-code text-xs text-gray-400">
                            Right letter, right spot
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <YellowBrushIcon className="w-8 h-8 shrink-0" />
                          <Cell
                            isCompleted={true}
                            value="B"
                            status="present"
                            cellSize={32}
                          />
                          <span className="font-code text-xs text-gray-400">
                            Right letter, wrong spot
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <GrayBrushIcon className="w-8 h-8 shrink-0" />
                          <Cell
                            isCompleted={true}
                            value="C"
                            status="absent"
                            cellSize={32}
                          />
                          <span className="font-code text-xs text-gray-400">
                            Letter not in the word
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-obsidian-700" />

                      <p className="font-pixel text-xs text-crown-amber tracking-widest">
                        ROW TOOLS
                      </p>

                      <div className="flex items-center gap-3">
                        <RecycleIcon className="w-8 h-8 shrink-0 text-gray-400" />
                        <span className="font-code text-xs text-gray-400">
                          Clears that row's painted colors
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex gap-1 shrink-0">
                          <Badge color="green" n={2} />
                          <Badge color="yellow" n={1} />
                          <Badge color="gray" n={2} />
                        </div>
                        <span className="font-code text-xs text-gray-400">
                          Count of correct, present, and absent letters per row
                        </span>
                      </div>

                      <div className="border-t border-obsidian-700" />

                      <p className="font-pixel text-xs text-crown-amber tracking-widest">
                        KEYBOARD
                      </p>
                      <p className="font-code text-xs text-gray-400">
                        Key colors update as you paint — confirmed, present, and
                        eliminated letters are always visible at a glance.
                      </p>
                    </div>
                  )}

                  {activeTab === "features" && (
                    <ul className="space-y-4">
                      {[
                        [
                          "Variable word length",
                          "Play with anywhere between 4 and 7-letter words via Settings.",
                        ],
                        [
                          "Hard mode",
                          "Solutions are selected from uncommon words and the player is limited to 9 guesses.",
                        ],
                        [
                          "Cell painting",
                          "Select a brush and click or drag across cells to color them.",
                        ],
                        [
                          "Auto-Gray",
                          "Automatically grays out letters from fully-gray rows.",
                        ],
                        [
                          "Auto-Green",
                          "Fills in user marked correct letters across all rows automatically.",
                        ],
                        [
                          "Gray count",
                          "Shows how many absent letters are in a row.",
                        ],
                      ].map(([feature, desc]) => (
                        <li
                          key={feature}
                          className="flex flex-col gap-1 pb-4 border-b border-obsidian-700 last:border-0 last:pb-0"
                        >
                          <span className="font-pixel text-xs text-crown-gold tracking-wide">
                            {feature}
                          </span>
                          <span className="font-code text-sm text-gray-400">
                            {desc}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {activeTab === "challenges" && (
                    <div className="space-y-4">
                      <p className="font-pixel text-xs text-crown-amber tracking-widest">
                        IN THE GAME
                      </p>
                      <p className="font-code text-sm text-gray-400 leading-relaxed">
                        Open <span className="text-crown-gold">Settings</span>{" "}
                        and go to the{" "}
                        <span className="text-crown-gold">Challenge</span> tab.
                        Pick a dictionary, choose how many guesses to allow,
                        type your secret word, and hit Generate Link. Share the
                        link to let others play your custom word with exactly
                        the settings you chose.
                      </p>
                      <p className="font-code text-sm text-gray-400 leading-relaxed">
                        Results never count toward the recipient's stats, and
                        their progress is saved to the link so they can come
                        back to it any time.
                      </p>

                      <div className="border-t border-obsidian-700" />

                      <p className="font-pixel text-xs text-crown-amber tracking-widest">
                        VIA DISCORD
                      </p>
                      <p className="font-code text-sm text-gray-400 leading-relaxed">
                        In the{" "}
                        <ActivityLink
                          href="https://discord.gg/sU2XRxK8EB"
                          className="text-crown-gold underline hover:text-crown-amber transition-colors"
                        >
                          King-Tajin Discord server
                        </ActivityLink>
                        , use the{" "}
                        <span className="text-crown-gold">
                          /vagudle_challenge
                        </span>{" "}
                        slash command to generate a challenge link directly from
                        Discord.
                      </p>
                    </div>
                  )}

                  {activeTab === "about" && (
                    <div className="space-y-4">
                      <p className="font-code text-sm text-gray-400 leading-relaxed">
                        Vagudle is a word-guessing game inspired by{" "}
                        <ActivityLink
                          href="https://hardle.org"
                          className="text-crown-gold underline hover:text-crown-amber transition-colors"
                        >
                          Hardle
                        </ActivityLink>
                        , with extra tools to help you solve the puzzle and no
                        pesky daily limit to get in your way.
                      </p>

                      <div className="border-t border-obsidian-700" />

                      <p className="font-code text-sm text-gray-400 leading-relaxed">
                        The{" "}
                        <ActivityLink
                          href="https://discord.gg/sU2XRxK8EB"
                          className="text-crown-gold underline hover:text-crown-amber transition-colors"
                        >
                          Discord server
                        </ActivityLink>{" "}
                        has an exclusive Duel feature where you can challenge
                        other members head-to-head and compete on a live
                        leaderboard to see who can crack the word in the fewest
                        guesses.
                      </p>

                      <div className="border-t border-obsidian-700" />

                      <div className="flex gap-4 justify-center pt-1 pb-2">
                        <img
                          src="/icon.png"
                          alt="Vagudle icon"
                          width={48}
                          height={48}
                          style={{
                            width: "calc(50% - 8px)",
                            height: "auto",
                            aspectRatio: "1 / 1",
                            imageRendering: "pixelated",
                          }}
                        />
                        <img
                          src="/icon.svg"
                          alt="Vagudle icon"
                          width={48}
                          height={48}
                          style={{
                            width: "calc(50% - 8px)",
                            height: "auto",
                            aspectRatio: "1 / 1",
                            imageRendering: "pixelated",
                          }}
                        />
                      </div>

                      <div className="flex justify-between gap-3">
                        <button
                          onClick={() => setIsResetModalOpen(true)}
                          title="Erases all saved progress, stats, achievements, and settings."
                          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 font-pixel text-[10px] tracking-widest transition-all"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "2px solid rgba(255,255,255,0.12)",
                            color: "#9ca3af",
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                          RESET ALL DATA
                        </button>

                        <button
                          onClick={onRestoreHiddenAttributions}
                          disabled={!hasHiddenAttributions}
                          title="Hid a video background's attribution button? Bring it back here."
                          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 font-pixel text-[10px] tracking-widest transition-all"
                          style={{
                            background: hasHiddenAttributions
                              ? "rgba(255,255,255,0.04)"
                              : "transparent",
                            border: `2px solid ${
                              hasHiddenAttributions
                                ? "rgba(255,255,255,0.12)"
                                : "rgba(255,255,255,0.05)"
                            }`,
                            color: hasHiddenAttributions
                              ? "#9ca3af"
                              : "#4b5563",
                            cursor: hasHiddenAttributions
                              ? "pointer"
                              : "default",
                          }}
                        >
                          <RotateCcw className="w-3 h-3" />
                          {hasHiddenAttributions
                            ? "RESTORE ATTRIBUTIONS"
                            : "ATTRIBUTIONS VISIBLE"}
                        </button>
                      </div>

                      <ActivityLink
                        href="https://store.king-tajin.dev/"
                        className="shiny-btn block w-full relative overflow-hidden"
                      >
                        <div className="shiny-btn-shimmer absolute inset-y-0" />
                        <div className="relative z-10 flex flex-col items-center gap-2 py-5 px-4">
                          <CrownIcon className="shiny-btn-crown w-10 h-10 text-crown-gold" />
                          <span
                            className="font-pixel text-2xl tracking-widest crown-glow"
                            style={{ color: "#FFD700" }}
                          >
                            VISIT THE STORE
                          </span>
                          <span
                            className="font-code text-xs tracking-wide"
                            style={{ color: "#FFBF00", opacity: 0.65 }}
                          >
                            store.king-tajin.dev →
                          </span>
                        </div>
                      </ActivityLink>
                    </div>
                  )}

                  {activeTab === "opensource" && (
                    <div className="space-y-4">
                      <p className="font-code text-sm text-gray-400 leading-relaxed">
                        <ActivityLink
                          href="https://github.com/King-Tajin/Vagudle"
                          className="text-crown-gold underline hover:text-crown-amber transition-colors"
                        >
                          Vagudle
                        </ActivityLink>{" "}
                        is open source and based on{" "}
                        <ActivityLink
                          href="https://github.com/markzither/react-wordle"
                          className="text-crown-gold underline hover:text-crown-amber transition-colors"
                        >
                          react-wordle
                        </ActivityLink>
                        . Contributions and feedback are welcome.
                      </p>
                    </div>
                  )}

                  {activeTab === "feedback" && <FeedbackTab />}
                </div>

                <div
                  className="shrink-0 px-5 py-3 border-t border-obsidian-700"
                  style={{ background: "rgba(10,0,20,0.97)" }}
                >
                  <p className="font-pixel text-xs text-obsidian-500 tracking-widest text-center">
                    <ActivityLink
                      href="https://vagudle.king-tajin.dev/terms.html"
                      className="hover:text-crown-amber transition-colors underline"
                    >
                      TOS
                    </ActivityLink>{" "}
                    · KING TAJIN ·{" "}
                    <ActivityLink
                      href="https://vagudle.king-tajin.dev/privacy.html"
                      className="hover:text-crown-amber transition-colors underline"
                    >
                      PRIVACY POLICY
                    </ActivityLink>
                  </p>
                </div>
              </div>
            </TransitionChild>
          </div>
        </div>
      </Transition>
      <ResetDataModal
        isOpen={isResetModalOpen}
        handleClose={() => setIsResetModalOpen(false)}
      />
    </>
  );
};
