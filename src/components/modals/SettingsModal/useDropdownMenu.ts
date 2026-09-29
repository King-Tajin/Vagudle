import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type CSSProperties,
} from "react";

const MENU_MAX_HEIGHT = 416;
const VIEWPORT_GAP = 8;

export const useDropdownMenu = (isOpen: boolean, onClose: () => void) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<CSSProperties | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceAbove = rect.top - VIEWPORT_GAP;
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_GAP;
    const openUp = spaceAbove >= MENU_MAX_HEIGHT || spaceAbove >= spaceBelow;
    const right = Math.max(window.innerWidth - rect.right, VIEWPORT_GAP);

    setMenuStyle({
      right,
      minWidth: rect.width,
      maxWidth: `calc(100vw - ${VIEWPORT_GAP * 2}px)`,
      maxHeight: Math.min(MENU_MAX_HEIGHT, openUp ? spaceAbove : spaceBelow),
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      )
        return;
      onCloseRef.current();
    };
    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  return { triggerRef, menuRef, menuStyle };
};
