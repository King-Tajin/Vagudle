export const attachResizableAnimationLoop = (
  rafIdRef: { current: number },
  tick: FrameRequestCallback,
  onResize: () => void,
  resizeDelayMs = 150
): (() => void) => {
  rafIdRef.current = requestAnimationFrame(tick);

  let resizeTimeout: ReturnType<typeof setTimeout>;
  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(onResize, resizeDelayMs);
  };
  window.addEventListener("resize", handleResize);

  return () => {
    cancelAnimationFrame(rafIdRef.current);
    window.removeEventListener("resize", handleResize);
    clearTimeout(resizeTimeout);
  };
};

export const attachDebouncedResize = (
  onResize: () => void,
  resizeDelayMs = 150
): (() => void) => {
  onResize();

  let resizeTimeout: ReturnType<typeof setTimeout>;
  const debouncedResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(onResize, resizeDelayMs);
  };
  window.addEventListener("resize", debouncedResize);

  return () => {
    window.removeEventListener("resize", debouncedResize);
    clearTimeout(resizeTimeout);
  };
};
