import { ArrowLeft } from "lucide-react";

type ButtonGroupProps<T extends string | number> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
};

export function ButtonGroup<T extends string | number>({
  options,
  value,
  onChange,
}: ButtonGroupProps<T>) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            type="button"
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className="flex items-center justify-center px-3 py-2 font-pixel text-xs tracking-widest transition-colors flex-1"
            style={{
              background: active
                ? "linear-gradient(180deg, #5000aa 0%, #28007c 100%)"
                : "rgba(255,255,255,0.04)",
              border: `2px solid ${
                active ? "#7020cc" : "rgba(255,255,255,0.1)"
              }`,
              color: active ? "#fff" : "#6b7280",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export const BackButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 font-pixel text-xs tracking-widest transition-colors"
      style={{ color: "#6b7280" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "#9ca3af";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "#6b7280";
      }}
    >
      <ArrowLeft className="w-3 h-3" />
      BACK TO STATS
    </button>
  );
};
