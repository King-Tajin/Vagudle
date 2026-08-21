import React from "react";

type Props = {
  settingName: string;
  flag: boolean;
  handleFlag: (value: boolean) => void;
  description?: string;
  disabled?: boolean;
  labelExtra?: React.ReactNode;
  dimLabelWhenOff?: boolean;
  children?: React.ReactNode;
};

export const SettingsToggle = ({
  settingName,
  flag,
  handleFlag,
  description,
  disabled = false,
  labelExtra,
  dimLabelWhenOff = false,
  children,
}: Props) => {
  const isLabelDimmed = disabled || (dimLabelWhenOff && !flag);

  return (
    <div className="flex justify-between gap-4 py-3">
      <div className="text-left mt-1">
        <div className="flex items-center gap-1.5">
          <p
            className="font-pixel text-xs tracking-widest leading-none"
            style={{ color: isLabelDimmed ? "#6b7280" : "#d4af37" }}
          >
            {settingName.toUpperCase()}
          </p>
          {labelExtra}
        </div>
        {description && (
          <p className="font-code text-xs mt-1.5 text-gray-500 leading-snug">
            {description}
          </p>
        )}
        {children && <div className="mt-2.5">{children}</div>}
      </div>
      <button
        type="button"
        onClick={() => {
          if (disabled) return;
          handleFlag(!flag);
        }}
        aria-label={settingName}
        aria-disabled={disabled}
        disabled={disabled}
        className="shrink-0 w-14 h-8 transition-colors duration-300 ease-in-out pixel-border-sm"
        style={{
          background: flag
            ? "linear-gradient(180deg, #5000aa 0%, #28007c 100%)"
            : "rgba(255,255,255,0.05)",
          border: `2px solid ${flag ? "#5000aa" : "#3a3a4a"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: flag ? "flex-end" : "flex-start",
          padding: "0 4px",
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
        aria-pressed={flag}
      >
        <span
          className="w-5 h-5 shrink-0 transition-colors duration-300"
          style={{ background: flag ? "#d4af37" : "#555570" }}
        />
      </button>
    </div>
  );
};
