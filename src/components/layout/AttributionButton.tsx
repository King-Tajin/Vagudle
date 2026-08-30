import React, { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { ATTRIBUTION_BUTTON_ARIA_LABEL } from "../../constants/strings";

type Props = {
  onClick: () => void;
  keyboardRef: React.RefObject<HTMLDivElement | null>;
  isMobile: boolean;
};

export const AttributionButton = ({
  onClick,
  keyboardRef,
  isMobile,
}: Props) => {
  const [measuredOffset, setMeasuredOffset] = useState(16);

  useEffect(() => {
    if (!isMobile) return;

    const measure = () => {
      const el = keyboardRef.current;
      if (!el) return;
      setMeasuredOffset(el.getBoundingClientRect().height + 8);
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (keyboardRef.current) ro.observe(keyboardRef.current);
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [isMobile, keyboardRef]);

  const bottomOffset = isMobile ? measuredOffset : 16;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ATTRIBUTION_BUTTON_ARIA_LABEL}
      className="fixed left-4 z-55 w-9 h-9 flex items-center justify-center rounded-full bg-obsidian-900/90 backdrop-blur-sm border-2 border-obsidian-600/50 hover:border-crown-gold/60 transition-colors"
      style={{ bottom: bottomOffset }}
    >
      <Info className="w-4 h-4 text-gray-400" />
    </button>
  );
};
