import { type CharStatus } from "../../lib/statuses";
import { Key } from "./Key";
import React, { useEffect, useEffectEvent, useRef } from "react";
import { localeAwareUpperCase } from "../../lib/words";
import { isNativeApp } from "../../lib/browser";
import strings from "../../constants/strings";
import {
  isActivatableControl,
  isGameplayKey,
  isTextEntryElement,
  releaseStrayControlFocus,
} from "../../lib/keyboardFocus";

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

  const enterHandledByControl = useRef(false);

  const onKeydown = useEffectEvent((e: KeyboardEvent) => {
    const active = document.activeElement;

    if (e.key === "Enter") {
      enterHandledByControl.current = isActivatableControl(active);
      return;
    }

    if (isTextEntryElement(active)) return;

    if (isGameplayKey(e)) releaseStrayControlFocus(active);
  });

  const onKeyup = useEffectEvent((e: KeyboardEvent) => {
    if (isTextEntryElement(document.activeElement)) return;

    if (e.code === "Enter") {
      if (enterHandledByControl.current) {
        enterHandledByControl.current = false;
        return;
      }
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
    const keydownListener = (e: KeyboardEvent) => onKeydown(e);
    const keyupListener = (e: KeyboardEvent) => onKeyup(e);
    window.addEventListener("keydown", keydownListener, true);
    window.addEventListener("keyup", keyupListener);
    return () => {
      window.removeEventListener("keydown", keydownListener, true);
      window.removeEventListener("keyup", keyupListener);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`fixed bottom-0 left-0 right-0 z-50 pt-1 ${
        isNativeApp() ? "pb-[calc(0.5rem+env(safe-area-inset-bottom))]" : "pb-2"
      }`}
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
          {strings.ENTER_TEXT}
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
          {strings.DELETE_TEXT}
        </Key>
      </div>
    </div>
  );
};
