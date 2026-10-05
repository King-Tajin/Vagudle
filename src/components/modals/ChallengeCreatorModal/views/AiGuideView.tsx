import { useEffect, useRef, useState } from "react";
import { Check, Copy, Info } from "lucide-react";
import { ActivityLink } from "../../../ActivityLink";
import { BackButton } from "../Controls";
import strings from "../../../../constants/strings";

const MCP_SERVER_URL = "https://vagudle.king-tajin.dev/mcp";
const MCP_SETUP_GUIDE_URL = "https://vagudle.king-tajin.dev/docs/?doc=mcp";
const CLAUDE_CODE_COMMAND = `claude mcp add --transport http vagudle ${MCP_SERVER_URL}`;

const CopyButton = ({
  text,
  fullWidth,
}: {
  text: string;
  fullWidth?: boolean;
}) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className={`py-2 font-pixel text-xs tracking-widest flex items-center justify-center gap-1.5 transition-colors shrink-0 ${
        fullWidth ? "w-full" : "px-3"
      }`}
      style={{
        background: copied ? "rgba(74,124,63,0.2)" : "rgba(255,215,0,0.1)",
        border: `2px solid ${copied ? "#4a7c3f" : "#d4af37"}`,
        color: copied ? "#4ade80" : "#d4af37",
      }}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3" />
          {strings.CHALLENGE_CREATOR_COPIED_BUTTON_TEXT}
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          {strings.CHALLENGE_CREATOR_COPY_BUTTON_TEXT}
        </>
      )}
    </button>
  );
};

const CopyLine = ({ text }: { text: string }) => {
  return (
    <div
      className="flex items-center gap-2 p-2"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <p className="font-code text-xs text-gray-300 break-all flex-1 min-w-0">
        {text}
      </p>
      <CopyButton text={text} />
    </div>
  );
};

const SubLabel = ({ children }: { children: string }) => {
  return (
    <p className="font-pixel text-[9px] text-gray-500 tracking-widest mb-1">
      {children}
    </p>
  );
};

export const AiGuideView = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="space-y-4">
      <BackButton
        onClick={onBack}
        label={strings.CHALLENGE_AI_BACK_BUTTON_TEXT}
      />
      <p className="font-pixel text-xs text-crown-amber tracking-widest">
        {strings.CHALLENGE_AI_HEADING}
      </p>
      <p className="font-code text-sm text-gray-400 leading-relaxed">
        {strings.CHALLENGE_AI_INTRO_TEXT}
      </p>
      <div
        className="flex gap-2 p-2.5"
        style={{
          background: "rgba(255,215,0,0.04)",
          border: "1px solid rgba(255,215,0,0.18)",
        }}
      >
        <Info className="w-3.5 h-3.5 text-crown-amber shrink-0 mt-0.5" />
        <p className="font-code text-xs text-gray-400 leading-relaxed">
          {strings.CHALLENGE_AI_NOTE_TEXT}
        </p>
      </div>

      <div className="border-t border-obsidian-700" />

      <p className="font-pixel text-xs text-crown-amber tracking-widest">
        {strings.CHALLENGE_AI_CONNECT_HEADING}
      </p>
      <div>
        <SubLabel>{strings.CHALLENGE_AI_SERVER_URL_LABEL}</SubLabel>
        <CopyLine text={MCP_SERVER_URL} />
      </div>
      <div>
        <SubLabel>{strings.CHALLENGE_AI_CLAUDE_LABEL}</SubLabel>
        <p className="font-code text-xs text-gray-400 leading-relaxed">
          {strings.CHALLENGE_AI_CLAUDE_STEPS_TEXT}
        </p>
      </div>
      <div>
        <SubLabel>{strings.CHALLENGE_AI_CLAUDE_CODE_LABEL}</SubLabel>
        <CopyLine text={CLAUDE_CODE_COMMAND} />
      </div>
      <div>
        <SubLabel>{strings.CHALLENGE_AI_OTHER_LABEL}</SubLabel>
        <p className="font-code text-xs text-gray-400 leading-relaxed">
          {strings.CHALLENGE_AI_OTHER_TEXT}
        </p>
      </div>
      <p className="font-code text-xs text-gray-500 leading-relaxed">
        {strings.CHALLENGE_AI_NO_INSTALL_TEXT}{" "}
        <ActivityLink
          href={MCP_SETUP_GUIDE_URL}
          className="text-crown-gold underline hover:text-crown-amber transition-colors"
        >
          {strings.CHALLENGE_AI_SETUP_GUIDE_LINK_TEXT}
        </ActivityLink>
      </p>

      <div className="border-t border-obsidian-700" />

      <p className="font-pixel text-xs text-crown-amber tracking-widest">
        {strings.CHALLENGE_AI_PROMPT_HEADING}
      </p>
      <p className="font-code text-sm text-gray-400 leading-relaxed">
        {strings.CHALLENGE_AI_PROMPT_INTRO_TEXT}
      </p>
      <div
        className="p-2 space-y-2"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <pre className="font-code text-xs text-gray-300 whitespace-pre-wrap wrap-break-word max-h-48 overflow-y-auto leading-relaxed">
          {strings.CHALLENGE_AI_PROMPT_TEXT}
        </pre>
        <CopyButton text={strings.CHALLENGE_AI_PROMPT_TEXT} fullWidth />
      </div>
    </div>
  );
};
