import type { CSSProperties } from "react";

const BADGE_STYLES: Record<"green" | "yellow" | "gray", CSSProperties> = {
  green: { background: "#22c55e", borderColor: "#22c55e" },
  yellow: { background: "#eab308", borderColor: "#eab308" },
  gray: { background: "#64748b", borderColor: "#64748b" },
};

export const Badge = ({
  color,
  n,
}: {
  color: "green" | "yellow" | "gray";
  n: number;
}) => {
  return (
    <div
      className="border-2 flex items-center justify-center font-bold rounded text-white text-xs"
      style={{ width: 22, height: 22, fontSize: 11, ...BADGE_STYLES[color] }}
    >
      {n}
    </div>
  );
};
