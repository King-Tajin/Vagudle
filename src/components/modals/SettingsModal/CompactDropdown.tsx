import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useCloseOnOutsideClick } from "../../../hooks/useCloseOnOutsideClick";

export type DropdownOption = { value: string; label: string };

export const CompactDropdown = ({
  value,
  options,
  disabled = false,
  onChange,
  ariaLabel,
}: {
  value: string;
  options: DropdownOption[];
  disabled?: boolean;
  onChange: (value: string) => void;
  ariaLabel: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useCloseOnOutsideClick(ref, isOpen, () => setIsOpen(false));

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={ariaLabel}
        className="flex items-center gap-1.5 font-pixel text-xs tracking-widest px-2.5 py-2"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "2px solid #3a3a4a",
          color: disabled ? "#4b5563" : "#d4af37",
          cursor: disabled ? "not-allowed" : "pointer",
          minWidth: 0,
        }}
      >
        {current?.label ?? value}
        <ChevronDown className="w-3 h-3 shrink-0 text-gray-500" />
      </button>
      {isOpen && !disabled && (
        <div
          className="absolute left-0 bottom-full mb-1 z-50"
          style={{
            background: "#0d1322",
            border: "2px solid #3a3a4a",
            whiteSpace: "nowrap",
            minWidth: "100%",
            maxHeight: "12rem",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className="w-full text-left font-pixel text-xs tracking-widest px-3 py-2 flex items-center gap-2"
                style={{
                  color: isSelected ? "#d4af37" : "#9ca3af",
                  cursor: "pointer",
                  background: isSelected ? "rgba(80,0,170,0.2)" : "transparent",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
