import { localeAwareUpperCase } from "./words";

const CONTROL_SELECTOR =
  'button, a[href], summary, [role="button"], [role="link"]';
const DIALOG_SELECTOR = '[role="dialog"], [aria-modal="true"]';

export const isTextEntryElement = (element: Element | null): boolean =>
  element instanceof HTMLInputElement ||
  element instanceof HTMLTextAreaElement ||
  element instanceof HTMLSelectElement ||
  (element instanceof HTMLElement && element.isContentEditable);

export const isActivatableControl = (
  element: Element | null
): element is HTMLElement =>
  element instanceof HTMLElement && element.matches(CONTROL_SELECTOR);

export const isGameplayKey = (event: KeyboardEvent): boolean => {
  if (event.ctrlKey || event.metaKey || event.altKey) return false;
  if (event.key === "Backspace") return true;
  const key = localeAwareUpperCase(event.key);
  return key.length === 1 && key >= "A" && key <= "Z";
};

export const releaseStrayControlFocus = (element: Element | null): boolean => {
  if (!isActivatableControl(element)) return false;
  if (element.closest(DIALOG_SELECTOR)) return false;
  element.blur();
  return true;
};
