import { useEffect, useEffectEvent, type RefObject } from "react";

export const useCloseOnOutsideClick = (
  ref: RefObject<HTMLElement | null>,
  isOpen: boolean,
  onClose: () => void
) => {
  const handleOutsideClick = useEffectEvent(onClose);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        handleOutsideClick();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, ref]);
};
