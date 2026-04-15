type Props = {
  settingName: string;
  flag: boolean;
  handleFlag: Function;
  description?: string;
};

export const SettingsToggle = ({
  settingName,
  flag,
  handleFlag,
  description,
}: Props) => {
  return (
    <div className="flex justify-between gap-4 py-3">
      <div className="text-left mt-1">
        <p className="font-pixel text-xs text-crown-amber tracking-widest leading-none">
          {settingName.toUpperCase()}
        </p>
        {description && (
          <p className="font-code text-xs mt-1.5 text-gray-500 leading-snug">
            {description}
          </p>
        )}
      </div>
      <button
        onClick={() => handleFlag(!flag)}
        className="flex-shrink-0 w-14 h-8 transition-all duration-300 ease-in-out pixel-border-sm"
        style={{
          background: flag
            ? "linear-gradient(180deg, #5000aa 0%, #28007c 100%)"
            : "rgba(255,255,255,0.05)",
          border: `2px solid ${flag ? "#5000aa" : "#3a3a4a"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: flag ? "flex-end" : "flex-start",
          padding: "0 4px",
        }}
        aria-pressed={flag}
      >
        <span
          className="w-5 h-5 flex-shrink-0 transition-colors duration-300"
          style={{ background: flag ? "#d4af37" : "#555570" }}
        />
      </button>
    </div>
  );
};
