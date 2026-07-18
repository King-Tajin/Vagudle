import { type CharStatus } from "../../lib/statuses";
import { Key } from "./Key";
import React, { useEffect, useEffectEvent } from "react";
import { ENTER_TEXT, DELETE_TEXT } from "../../constants/strings";
import { localeAwareUpperCase } from "../../lib/words";

type Props = {
  onChar: (value: string) => void;
  onDelete: () => void;
  onEnter: () => void;
  solution: string;
  userStatuses: { [key: string]: CharStatus };
  isRevealing?: boolean;
  containerRef?: React.RefObject<HTMLDivElement | null>;
};

export const Keyboard = ({
  onChar,
  onDelete,
  onEnter,
  solution,
  userStatuses,
  isRevealing,
  containerRef,
}: Props) => {
  const charStatuses = userStatuses;

  const onClick = (value: string) => {
    if (value === "ENTER") {
      onEnter();
    } else if (value === "DELETE") {
      onDelete();
    } else {
      onChar(value);
    }
  };

  const onKeyup = useEffectEvent((e: KeyboardEvent) => {
    const active = document.activeElement;
    const isTyping =
      active instanceof HTMLInputElement ||
      active instanceof HTMLTextAreaElement ||
      active instanceof HTMLSelectElement;

    if (isTyping) return;

    if (e.code === "Enter") {
      onEnter();
    } else if (e.code === "Backspace") {
      onDelete();
    } else {
      const key = localeAwareUpperCase(e.key);
      if (key.length === 1 && key >= "A" && key <= "Z") {
        onChar(key);
      }
    }
  });

  useEffect(() => {
    const listener = (e: KeyboardEvent) => onKeyup(e);
    window.addEventListener("keyup", listener);
    return () => {
      window.removeEventListener("keyup", listener);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-0 left-0 right-0 z-50 pb-2 pt-1"
    >
      <div className="flex justify-center mb-1">
        {["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"].map((key) => (
          <Key
            value={key}
            key={key}
            onClick={onClick}
            status={charStatuses[key]}
            isRevealing={isRevealing}
            solutionLength={solution.length}
          />
        ))}
      </div>
      <div className="flex justify-center mb-1">
        {["A", "S", "D", "F", "G", "H", "J", "K", "L"].map((key) => (
          <Key
            value={key}
            key={key}
            onClick={onClick}
            status={charStatuses[key]}
            isRevealing={isRevealing}
            solutionLength={solution.length}
          />
        ))}
      </div>
      <div className="flex justify-center">
        <Key
          width={65.4}
          value="ENTER"
          onClick={onClick}
          solutionLength={solution.length}
        >
          {ENTER_TEXT}
        </Key>
        {["Z", "X", "C", "V", "B", "N", "M"].map((key) => (
          <Key
            value={key}
            key={key}
            onClick={onClick}
            status={charStatuses[key]}
            isRevealing={isRevealing}
            solutionLength={solution.length}
          />
        ))}
        <Key
          width={65.4}
          value="DELETE"
          onClick={onClick}
          solutionLength={solution.length}
        >
          {DELETE_TEXT}
        </Key>
      </div>
    </div>
  );
};
