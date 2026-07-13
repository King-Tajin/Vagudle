import { ExternalLink } from "lucide-react";
import { BaseModal } from "./BaseModal";
import type { BackgroundAttribution } from "../../lib/backgrounds";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  attribution: BackgroundAttribution;
  isHidden: boolean;
  onHideForeverChange: (hidden: boolean) => void;
};

export const AttributionModal = ({
  isOpen,
  handleClose,
  attribution,
  isHidden,
  onHideForeverChange,
}: Props) => {
  return (
    <BaseModal
      title="Video Attribution"
      isOpen={isOpen}
      handleClose={handleClose}
    >
      <div className="space-y-4">
        <div className="space-y-3">
          {attribution.credits.map((credit) => (
            <div key={`${credit.role}-${credit.title}`}>
              <p className="font-pixel text-[10px] text-gray-500 tracking-widest mb-1">
                {credit.role.toUpperCase()}
              </p>
              <p className="font-code text-sm text-gray-200 leading-snug">
                {credit.title}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <p className="font-code text-xs text-gray-500">
                  by {credit.creator}
                </p>
                {credit.sourceUrl && (
                  <a
                    href={credit.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-crown-amber hover:text-crown-gold transition-colors"
                    aria-label={`View source for ${credit.title}`}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="font-code text-xs text-gray-600 italic">
          License: {attribution.license}
        </p>

        <div className="flex justify-between items-center gap-4 pt-3 border-t-2 border-obsidian-700">
          <p className="font-pixel text-xs text-crown-amber tracking-widest leading-snug">
            HIDE ATTRIBUTION FOR THIS BACKGROUND
          </p>
          <button
            onClick={() => onHideForeverChange(!isHidden)}
            aria-label="Hide attribution for this background"
            className="flex-shrink-0 w-14 h-8 transition-all duration-300 ease-in-out pixel-border-sm"
            style={{
              background: isHidden
                ? "linear-gradient(180deg, #5000aa 0%, #28007c 100%)"
                : "rgba(255,255,255,0.05)",
              border: `2px solid ${isHidden ? "#5000aa" : "#3a3a4a"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: isHidden ? "flex-end" : "flex-start",
              padding: "0 4px",
            }}
            aria-pressed={isHidden}
          >
            <span
              className="w-5 h-5 flex-shrink-0 transition-colors duration-300"
              style={{ background: isHidden ? "#d4af37" : "#555570" }}
            />
          </button>
        </div>

        <button
          onClick={handleClose}
          className="w-full py-3 font-pixel text-xs tracking-widest flex items-center justify-center gap-2 transition-all"
          style={{
            background: "linear-gradient(180deg, #d4af37 0%, #b8860b 100%)",
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
          GOT IT
        </button>
      </div>
    </BaseModal>
  );
};
