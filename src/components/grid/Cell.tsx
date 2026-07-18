import { type CharStatus, describeLetterStatus } from "../../lib/statuses";
import classnames from "classnames";
import { REVEAL_TIME_MS } from "../../constants/settings";

type Props = {
  value?: string;
  status?: CharStatus;
  isRevealing?: boolean;
  isCompleted?: boolean;
  position?: number;
  cellSize?: number;
  dataRow?: number;
  dataCell?: number;
};

export const Cell = ({
  value,
  status,
  isRevealing,
  isCompleted,
  position = 0,
  cellSize = 56,
  dataRow,
  dataCell,
}: Props) => {
  const isFilled = value && !isCompleted;
  const shouldReveal = isRevealing && isCompleted;
  const animationDelay = `${position * REVEAL_TIME_MS}ms`;
  const fontSize = Math.max(12, Math.round(cellSize * 0.6));

  const classes = classnames(
    "border-solid border-2 flex items-center justify-center font-bold rounded dark:text-white flex-shrink-0",
    {
      "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600":
        !status,
      "border-black dark:border-slate-100": value && !status,
      "absent shadowed bg-slate-400 dark:bg-slate-700 text-white border-slate-400 dark:border-slate-700":
        status === "absent" || status === "auto-absent",
      "correct shadowed bg-green-500 text-white border-green-500":
        status === "correct",
      "present shadowed bg-yellow-500 text-white border-yellow-500":
        status === "present",
      "cell-fill-animation": isFilled,
      "cell-reveal": shouldReveal,
    }
  );

  return (
    <div
      className={classes}
      role="img"
      aria-label={describeLetterStatus(value, status)}
      data-row={dataRow}
      data-cell={dataCell}
      style={{
        animationDelay,
        width: `${cellSize}px`,
        height: `${cellSize}px`,
        margin: "0 2px",
        fontSize: `${fontSize}px`,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div
        className="letter-container"
        aria-hidden="true"
        style={{ animationDelay }}
      >
        {value}
      </div>
    </div>
  );
};
