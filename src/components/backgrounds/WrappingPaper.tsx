import React, { useEffect, useRef } from "react";
import LollipopUrl from "../../assets/icons/lollipop.svg";
import PropellerHatUrl from "../../assets/icons/propeller-hat.svg";
import MudskipperUrl from "../../assets/icons/mudskipper.svg";
import { attachResizableAnimationLoop } from "../../lib/animationLoop";

type SpriteKind = "lollipop" | "hat" | "mudskipper";

interface SpriteSpec {
  kind: SpriteKind;
  x: number;
  y: number;
  heightRatio: number;
  rotationDeg: number;
  opacity: number;
  flipX: boolean;
}

const BG_COLOR = "#111a30";

const TILE_SIZE_VIEWPORT_RATIO = 0.3;
const TILE_SIZE_MIN_PX = 220;
const TILE_SIZE_MAX_PX = 400;

const MOBILE_BREAKPOINT_PX = 640;
const MOBILE_TILE_SIZE_VIEWPORT_RATIO = 0.5;
const MOBILE_TILE_SIZE_MIN_PX = 150;
const MOBILE_TILE_SIZE_MAX_PX = 260;
const MOBILE_SCROLL_SPEED_MULTIPLIER = 0.8;

const PATTERN_ANGLE_DEG = -18;
const ANGLE_SWAY_DEG = 1.5;
const ANGLE_SWAY_PERIOD_SEC = 22;

const SCROLL_SPEED_PX_PER_SEC = 26;
const ALTERNATE_ROW_DIRECTION = true;
const ROW_SPEED_VARIATION = 0.3;
const ROW_SPEED_VARIATION_FREQUENCY = 2.4;
const ROW_STAGGER_RATIO = 0.5;

const SPRITES: SpriteSpec[] = [
  {
    kind: "lollipop",
    x: 0.25,
    y: 0.25,
    heightRatio: 0.3,
    rotationDeg: -14,
    opacity: 0.92,
    flipX: false,
  },
  {
    kind: "hat",
    x: 0.75,
    y: 0.25,
    heightRatio: 0.2,
    rotationDeg: 9,
    opacity: 0.92,
    flipX: false,
  },
  {
    kind: "mudskipper",
    x: 0.5,
    y: 0.5,
    heightRatio: 0.32,
    rotationDeg: -8,
    opacity: 0.92,
    flipX: false,
  },
  {
    kind: "lollipop",
    x: 0.75,
    y: 0.75,
    heightRatio: 0.27,
    rotationDeg: 22,
    opacity: 0.85,
    flipX: true,
  },
  {
    kind: "hat",
    x: 0.25,
    y: 0.75,
    heightRatio: 0.2,
    rotationDeg: -12,
    opacity: 0.85,
    flipX: true,
  },
];

const MAX_DEVICE_PIXEL_RATIO = 2;
const MAX_DELTA_SECONDS = 0.05;
const RESPECT_REDUCED_MOTION = true;
const REDUCED_MOTION_SPEED_MULTIPLIER = 0;

const mod = (value: number, divisor: number) =>
  ((value % divisor) + divisor) % divisor;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });

const computeTileSize = (viewportWidth: number, viewportHeight: number) => {
  const isMobile = viewportWidth < MOBILE_BREAKPOINT_PX;
  const ratio = isMobile
    ? MOBILE_TILE_SIZE_VIEWPORT_RATIO
    : TILE_SIZE_VIEWPORT_RATIO;
  const min = isMobile ? MOBILE_TILE_SIZE_MIN_PX : TILE_SIZE_MIN_PX;
  const max = isMobile ? MOBILE_TILE_SIZE_MAX_PX : TILE_SIZE_MAX_PX;
  return clamp(Math.min(viewportWidth, viewportHeight) * ratio, min, max);
};

export const WrappingPaper = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafIdRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tileCanvas = document.createElement("canvas");
    const tileCtx = tileCanvas.getContext("2d");
    if (!tileCtx) return;

    const images: Partial<Record<SpriteKind, HTMLImageElement>> = {};
    const reducedMotion =
      RESPECT_REDUCED_MOTION &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cancelled = false;
    let ready = false;
    let lastTimestamp: number | null = null;
    let elapsedSeconds = 0;
    let scroll = 0;
    let viewportWidth = 0;
    let viewportHeight = 0;
    let tileSize = 0;
    let dpr = 1;

    const drawSprite = (spec: SpriteSpec) => {
      const img = images[spec.kind];
      if (!img || img.naturalHeight <= 0) return;
      const height = spec.heightRatio * tileSize;
      const width = height * (img.naturalWidth / img.naturalHeight);
      const rotation = (spec.rotationDeg * Math.PI) / 180;
      const cos = Math.abs(Math.cos(rotation));
      const sin = Math.abs(Math.sin(rotation));
      const halfExtentX = (width * cos + height * sin) / 2;
      const halfExtentY = (width * sin + height * cos) / 2;
      const centerX = clamp(
        spec.x * tileSize,
        halfExtentX,
        tileSize - halfExtentX
      );
      const centerY = clamp(
        spec.y * tileSize,
        halfExtentY,
        tileSize - halfExtentY
      );
      tileCtx.save();
      tileCtx.globalAlpha = spec.opacity;
      tileCtx.translate(centerX, centerY);
      tileCtx.rotate(rotation);
      if (spec.flipX) tileCtx.scale(-1, 1);
      tileCtx.drawImage(img, -width / 2, -height / 2, width, height);
      tileCtx.restore();
    };

    const buildTile = () => {
      if (!ready || tileSize <= 0) return;
      const pixelSize = Math.round(tileSize * dpr);
      tileCanvas.width = pixelSize;
      tileCanvas.height = pixelSize;
      tileCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      tileCtx.clearRect(0, 0, tileSize, tileSize);
      SPRITES.forEach(drawSprite);
    };

    const setupSize = () => {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
      canvas.width = Math.round(viewportWidth * dpr);
      canvas.height = Math.round(viewportHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      tileSize = computeTileSize(viewportWidth, viewportHeight);
      buildTile();
    };

    const speedMultiplier = () => {
      let multiplier =
        viewportWidth < MOBILE_BREAKPOINT_PX
          ? MOBILE_SCROLL_SPEED_MULTIPLIER
          : 1;
      if (reducedMotion) multiplier *= REDUCED_MOTION_SPEED_MULTIPLIER;
      return multiplier;
    };

    const drawField = () => {
      const reach = Math.hypot(viewportWidth, viewportHeight) / 2 + tileSize;
      const swayDeg =
        ANGLE_SWAY_PERIOD_SEC > 0
          ? ANGLE_SWAY_DEG *
            Math.sin((elapsedSeconds / ANGLE_SWAY_PERIOD_SEC) * Math.PI * 2)
          : 0;
      const angle = ((PATTERN_ANGLE_DEG + swayDeg) * Math.PI) / 180;
      const firstRow = Math.floor(-reach / tileSize);
      const lastRow = Math.ceil(reach / tileSize);

      ctx.save();
      ctx.translate(viewportWidth / 2, viewportHeight / 2);
      ctx.rotate(angle);

      for (let row = firstRow; row <= lastRow; row++) {
        const oddRow = mod(row, 2) === 1;
        const direction = ALTERNATE_ROW_DIRECTION && oddRow ? -1 : 1;
        const rowSpeed =
          1 +
          ROW_SPEED_VARIATION * Math.sin(row * ROW_SPEED_VARIATION_FREQUENCY);
        const stagger = oddRow ? ROW_STAGGER_RATIO * tileSize : 0;
        const shift = mod(scroll * direction * rowSpeed + stagger, tileSize);
        const y = row * tileSize;
        for (let x = -reach - tileSize + shift; x < reach; x += tileSize) {
          ctx.drawImage(tileCanvas, x, y, tileSize, tileSize);
        }
      }

      ctx.restore();
    };

    const tick = (timestamp: number) => {
      if (lastTimestamp === null) lastTimestamp = timestamp;
      const dt = Math.min(
        MAX_DELTA_SECONDS,
        (timestamp - lastTimestamp) / 1000
      );
      lastTimestamp = timestamp;

      if (!reducedMotion) elapsedSeconds += dt;
      scroll += SCROLL_SPEED_PX_PER_SEC * speedMultiplier() * dt;

      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, viewportWidth, viewportHeight);
      if (ready) drawField();

      rafIdRef.current = requestAnimationFrame(tick);
    };

    setupSize();

    Promise.all([
      loadImage(LollipopUrl),
      loadImage(PropellerHatUrl),
      loadImage(MudskipperUrl),
    ])
      .then(([lollipop, hat, mudskipper]) => {
        if (cancelled) return;
        images.lollipop = lollipop;
        images.hat = hat;
        images.mudskipper = mudskipper;
        ready = true;
        buildTile();
      })
      .catch(() => {});

    const detach = attachResizableAnimationLoop(rafIdRef, tick, setupSize);

    return () => {
      cancelled = true;
      detach();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0, background: BG_COLOR }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};
