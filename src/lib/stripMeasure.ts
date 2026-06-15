export interface StripMeasure {
  leftWidth: number;
  rightStart: number;
  rightWidth: number;
}

export const measureKeyboardStrips = (
  el: HTMLDivElement
): StripMeasure | null => {
  const buttons = el.querySelectorAll("button");
  if (buttons.length === 0) return null;

  let minLeft = Infinity;
  let maxRight = -Infinity;
  buttons.forEach((btn) => {
    const label = btn.getAttribute("aria-label") ?? "";
    if (
      label.toLowerCase().startsWith("enter") ||
      label.toLowerCase().startsWith("delete")
    )
      return;
    const r = btn.getBoundingClientRect();
    if (r.left < minLeft) minLeft = r.left;
    if (r.right > maxRight) maxRight = r.right;
  });

  if (minLeft === Infinity || maxRight === -Infinity) return null;

  const vw = window.innerWidth;
  const rightStart = maxRight + 8;
  return {
    leftWidth: Math.max(0, minLeft - 8),
    rightStart,
    rightWidth: Math.max(0, vw - rightStart),
  };
};
