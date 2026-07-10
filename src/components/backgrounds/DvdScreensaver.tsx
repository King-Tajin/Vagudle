import React, { useEffect, useRef } from "react";
import DvdLogoUrl from "../../assets/icons/dvd.svg";

const BG_COLOR = "#000000";
const LOGO_WIDTH_RATIO = 0.12;
const SPEED_PX_PER_SEC = 260;
const MAX_DELTA_SECONDS = 0.05;

const DVD_COLORS = [
  "#ff3b30",
  "#ff2d95",
  "#af52de",
  "#5e5ce6",
  "#007aff",
  "#00c7be",
  "#34c759",
  "#ffcc00",
  "#ff9500",
  "#ffffff",
];

const pickNextColor = (current: string): string => {
  const options = DVD_COLORS.filter((c) => c !== current);
  return options[Math.floor(Math.random() * options.length)];
};

export const DvdScreensaver = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tintCanvas = document.createElement("canvas");
    const tintCtx = tintCanvas.getContext("2d");
    if (!tintCtx) return;

    let rafId: number;
    let resizeTimeout: ReturnType<typeof setTimeout>;
    let cancelled = false;

    let logoAspectRatio = 1;
    let drawWidth = 0;
    let drawHeight = 0;
    let x = 0;
    let y = 0;
    let dx = 0;
    let dy = 0;
    let color = DVD_COLORS[Math.floor(Math.random() * DVD_COLORS.length)];
    let lastTimestamp: number | null = null;
    let ready = false;

    const retint = () => {
      if (drawWidth <= 0 || drawHeight <= 0) return;
      tintCanvas.width = drawWidth;
      tintCanvas.height = drawHeight;
      tintCtx.globalCompositeOperation = "source-over";
      tintCtx.clearRect(0, 0, drawWidth, drawHeight);
      tintCtx.drawImage(logoImg, 0, 0, drawWidth, drawHeight);
      tintCtx.globalCompositeOperation = "source-in";
      tintCtx.fillStyle = color;
      tintCtx.fillRect(0, 0, drawWidth, drawHeight);
      tintCtx.globalCompositeOperation = "source-over";
    };

    const setupSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawWidth = canvas.width * LOGO_WIDTH_RATIO;
      drawHeight = drawWidth / logoAspectRatio;
      x = Math.min(x, Math.max(0, canvas.width - drawWidth));
      y = Math.min(y, Math.max(0, canvas.height - drawHeight));
      retint();
    };

    const changeColor = () => {
      color = pickNextColor(color);
      retint();
    };

    const tick = (timestamp: number) => {
      if (lastTimestamp === null) lastTimestamp = timestamp;
      const dt = Math.min(
        MAX_DELTA_SECONDS,
        (timestamp - lastTimestamp) / 1000
      );
      lastTimestamp = timestamp;

      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (ready) {
        x += dx * dt;
        y += dy * dt;

        let bounced = false;

        if (x <= 0) {
          x = 0;
          dx = Math.abs(dx);
          bounced = true;
        } else if (x + drawWidth >= canvas.width) {
          x = canvas.width - drawWidth;
          dx = -Math.abs(dx);
          bounced = true;
        }

        if (y <= 0) {
          y = 0;
          dy = Math.abs(dy);
          bounced = true;
        } else if (y + drawHeight >= canvas.height) {
          y = canvas.height - drawHeight;
          dy = -Math.abs(dy);
          bounced = true;
        }

        if (bounced) changeColor();

        ctx.drawImage(tintCanvas, x, y, drawWidth, drawHeight);
      }

      rafId = requestAnimationFrame(tick);
    };

    const logoImg = new Image();
    logoImg.onload = () => {
      if (cancelled) return;
      logoAspectRatio = logoImg.naturalWidth / logoImg.naturalHeight || 1;
      setupSize();

      const angle = (Math.PI / 180) * (20 + Math.random() * 50);
      const signX = Math.random() < 0.5 ? -1 : 1;
      const signY = Math.random() < 0.5 ? -1 : 1;
      dx = signX * SPEED_PX_PER_SEC * Math.cos(angle);
      dy = signY * SPEED_PX_PER_SEC * Math.sin(angle);
      x = Math.random() * Math.max(0, canvas.width - drawWidth);
      y = Math.random() * Math.max(0, canvas.height - drawHeight);

      ready = true;
    };
    logoImg.src = DvdLogoUrl;

    rafId = requestAnimationFrame(tick);

    const onResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(setupSize, 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};
