import React, { ReactNode } from "react";
import classnames from "classnames";
import { CharStatus } from "../../lib/statuses";
import { REVEAL_TIME_MS } from "../../constants/settings";

type Props = {
  children?: ReactNode;
  value: string;
  width?: number;
  status?: CharStatus;
  onClick: (value: string) => void;
  isRevealing?: boolean;
  solutionLength: number;
};

export const Key = ({
  children,
  status,
  width = 40,
  value,
  onClick,
  isRevealing,
  solutionLength,
}: Props) => {
  const keyDelayMs = REVEAL_TIME_MS * solutionLength;

  const classes = classnames(
    "flex items-center justify-center rounded mx-0.5 text-xs font-bold cursor-pointer select-none dark:text-white",
    {
      "transition ease-in-out": isRevealing,
      "bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 active:bg-slate-400":
        !status,
      "bg-slate-400 dark:bg-slate-800 text-white": status === "absent",
      "bg-green-500 hover:bg-green-600 active:bg-green-700 text-white":
        status === "correct",
      "bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white":
        status === "present",
    }
  );

  const isAbsent = status === "absent";
  const isAutoAbsent = status === "auto-absent";
  const isCorrect = status === "correct";

  const styles = {
    transitionDelay: isRevealing ? `${keyDelayMs}ms` : "unset",
    width: `${width}px`,
    height: "58px",
    fontFamily: "'Trebuchet MS', sans-serif",
    boxShadow:
      isAbsent || isCorrect || isAutoAbsent
        ? "none"
        : "0 0 18px rgba(255, 215, 0, 1.0)",
    border:
      isAbsent || isCorrect || isAutoAbsent
        ? "none"
        : "2.2px solid rgba(255, 215, 0, 0.95)",
  };

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    onClick(value);
    event.currentTarget.blur();
  };

  return (
    <button
      style={styles}
      aria-label={`${value} ${status}`}
      className={classes}
      onClick={handleClick}
    >
      {children || value}
    </button>
  );
};
