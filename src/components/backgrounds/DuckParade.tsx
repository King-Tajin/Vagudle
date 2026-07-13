import React, { useEffect, useMemo, useRef, useState } from "react";
import lottie from "lottie-web";
import { drawDirtTexture, drawGrassTexture } from "../../lib/dirtTexture";

const DUCK_JSON_SRC = "/backgrounds/walking_duck.json";
const SKY_COLOR = "#8fd3f4";

const DUCK_COUNT = 3;
const DUCK_SIZE_MIN = 172;
const DUCK_SIZE_MAX = 528;
const DUCK_SPACING_PX = 315;

const WALK_SPEED_PX_PER_SEC = 90;
const MAX_DELTA_SECONDS = 0.05;

const DUCK_ANIM_SPEED_MIN = 0.65;
const DUCK_ANIM_SPEED_MAX = 1.1;

const WAIT_OFFSCREEN_MS_MIN = 1800;
const WAIT_OFFSCREEN_MS_MAX = 3600;

const DUCK_FOOT_ANCHOR_RATIO = 0.81575;

const DUCK_REFERENCE_DARK = [0.12004032509, 0.29257145302, 0.462178308824];
const DUCK_REFERENCE_LIGHT = [0.385278582573, 0.615253984928, 0.843964457512];
const DUCK_COLOR_MATCH_TOLERANCE = 0.03;

const DUCK_COLOR_PALETTES: { dark: string; light: string }[] = [
  { dark: "#1E4A75", light: "#629DD7" },
  { dark: "#14524A", light: "#4FB3A0" },
  { dark: "#1F4A2E", light: "#5FAE78" },
  { dark: "#4A1F4A", light: "#B36FC2" },
  { dark: "#5C1F22", light: "#D97575" },
  { dark: "#5C3B1F", light: "#D9A05C" },
  { dark: "#262F5C", light: "#7A86D9" },
  { dark: "#402736", light: "#D97AA0" },
  { dark: "#1F5C56", light: "#6FC2B8" },
  { dark: "#3D5C1F", light: "#A3D96A" },
  { dark: "#5C1F4E", light: "#D96FBE" },
  { dark: "#5C2A1F", light: "#D9926F" },
  { dark: "#1F2E5C", light: "#8C9AD9" },
  { dark: "#4A2E5C", light: "#BE8CD9" },
  { dark: "#333333", light: "#A6A6A6" },
  { dark: "#5C1F1F", light: "#D9827A" },
  { dark: "#1F4A4A", light: "#7ACBD9" },
  { dark: "#4E5C1F", light: "#C4D982" },
];

const CLOUD_COUNT = 5;
const CLOUD_MIN_PUFFS = 4;
const CLOUD_MAX_PUFFS = 7;
const CLOUD_WIDTH_MIN = 140;
const CLOUD_WIDTH_MAX = 340;
const CLOUD_HEIGHT_RATIO_MIN = 0.45;
const CLOUD_HEIGHT_RATIO_MAX = 0.65;
const CLOUD_Y_MIN_RATIO = 0.04;
const CLOUD_Y_MAX_RATIO = 0.4;
const CLOUD_OPACITY_MIN = 0.75;
const CLOUD_OPACITY_MAX = 0.95;
const CLOUD_COLOR = "#FFFFFF";
const CLOUD_MIN_OVERLAP_RATIO = 0.35;

type Direction = 1 | -1;
type Phase = "walking" | "waiting";

interface DuckDef {
  id: number;
  size: number;
  offsetX: number;
  animSpeed: number;
  darkColor: string;
  lightColor: string;
}

const randomPalette = () =>
  DUCK_COLOR_PALETTES[Math.floor(Math.random() * DUCK_COLOR_PALETTES.length)];

const buildDucks = (): DuckDef[] =>
  Array.from({ length: DUCK_COUNT }, (_, i) => {
    const palette = randomPalette();
    return {
      id: i,
      size: DUCK_SIZE_MIN + Math.random() * (DUCK_SIZE_MAX - DUCK_SIZE_MIN),
      offsetX: i * DUCK_SPACING_PX,
      animSpeed:
        DUCK_ANIM_SPEED_MIN +
        Math.random() * (DUCK_ANIM_SPEED_MAX - DUCK_ANIM_SPEED_MIN),
      darkColor: palette.dark,
      lightColor: palette.light,
    };
  });

const hexToNormalizedRgb = (hex: string): [number, number, number] => {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return [r, g, b];
};

const isCloseColor = (
  k: number[],
  ref: number[],
  tolerance = DUCK_COLOR_MATCH_TOLERANCE
) =>
  Math.abs(k[0] - ref[0]) < tolerance &&
  Math.abs(k[1] - ref[1]) < tolerance &&
  Math.abs(k[2] - ref[2]) < tolerance;

const recolorNode = (
  node: unknown,
  darkRgb: [number, number, number],
  lightRgb: [number, number, number]
) => {
  if (Array.isArray(node)) {
    node.forEach((item) => recolorNode(item, darkRgb, lightRgb));
    return;
  }
  if (node && typeof node === "object") {
    const obj = node as Record<string, unknown>;
    if (
      obj.a === 0 &&
      Array.isArray(obj.k) &&
      obj.k.length === 4 &&
      typeof obj.k[0] === "number"
    ) {
      const k = obj.k as number[];
      if (isCloseColor(k, DUCK_REFERENCE_DARK)) {
        obj.k = [darkRgb[0], darkRgb[1], darkRgb[2], k[3]];
      } else if (isCloseColor(k, DUCK_REFERENCE_LIGHT)) {
        obj.k = [lightRgb[0], lightRgb[1], lightRgb[2], k[3]];
      }
    }
    Object.values(obj).forEach((value) =>
      recolorNode(value, darkRgb, lightRgb)
    );
  }
};

const recolorAnimationData = (
  data: object,
  darkHex: string,
  lightHex: string
): object => {
  const clone = structuredClone(data);
  recolorNode(clone, hexToNormalizedRgb(darkHex), hexToNormalizedRgb(lightHex));
  return clone;
};

const DuckInstance = ({
  duck,
  x,
  direction,
  groundY,
  aspectRatio,
  animationData,
}: {
  duck: DuckDef;
  x: number;
  direction: Direction;
  groundY: number;
  aspectRatio: number;
  animationData: object;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const anim = lottie.loadAnimation({
      container,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData,
    });
    anim.setSpeed(duck.animSpeed);

    return () => {
      anim.destroy();
    };
  }, [animationData, duck.animSpeed]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        left: x + duck.offsetX,
        top: groundY,
        width: duck.size,
        height: duck.size * aspectRatio,
        transform: `translateY(-${
          DUCK_FOOT_ANCHOR_RATIO * 100
        }%) scaleX(${direction})`,
      }}
    />
  );
};

interface CloudPuff {
  cx: number;
  cy: number;
  r: number;
}

interface CloudDef {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  puffs: CloudPuff[];
  opacity: number;
}

const generateCloudPuffs = (
  puffCount: number,
  targetWidth: number,
  targetHeight: number
): { puffs: CloudPuff[]; width: number; height: number } => {
  const spacing = targetWidth / (puffCount + 1);
  const minR = spacing * 0.55;
  const maxR = spacing * 0.85;
  const radii = Array.from(
    { length: puffCount },
    () => minR + Math.random() * (maxR - minR)
  );

  const puffs: CloudPuff[] = [
    {
      cx: radii[0],
      cy: targetHeight * 0.6 + (Math.random() - 0.5) * targetHeight * 0.15,
      r: radii[0],
    },
  ];

  for (let i = 1; i < puffCount; i++) {
    const r = radii[i];
    const prev = puffs[i - 1];
    const maxDistance = (prev.r + r) * (1 - CLOUD_MIN_OVERLAP_RATIO);
    const distance = maxDistance * (0.4 + Math.random() * 0.6);
    const cx = prev.cx + distance;
    const cy =
      targetHeight * 0.6 + (Math.random() - 0.5) * targetHeight * 0.2 - r * 0.1;
    puffs.push({ cx, cy, r });
  }

  const mainMinX = Math.min(...puffs.map((p) => p.cx - p.r));
  const mainMaxX = Math.max(...puffs.map((p) => p.cx + p.r));
  const centerX = (mainMinX + mainMaxX) / 2;
  const fluffR = (mainMaxX - mainMinX) * (0.18 + Math.random() * 0.08);

  let nearest = puffs[0];
  let nearestDist = Infinity;
  puffs.forEach((p) => {
    const dist = Math.abs(p.cx - centerX);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = p;
    }
  });

  const maxFluffDistance = (nearest.r + fluffR) * (1 - CLOUD_MIN_OVERLAP_RATIO);
  let fluffCx = centerX;
  let fluffCy = nearest.cy - maxFluffDistance * 0.8;
  const dx = fluffCx - nearest.cx;
  const dy = fluffCy - nearest.cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > maxFluffDistance && dist > 0) {
    const scale = maxFluffDistance / dist;
    fluffCx = nearest.cx + dx * scale;
    fluffCy = nearest.cy + dy * scale;
  }
  puffs.push({ cx: fluffCx, cy: fluffCy, r: fluffR });

  const minX = Math.min(...puffs.map((p) => p.cx - p.r));
  const minY = Math.min(...puffs.map((p) => p.cy - p.r));
  const maxX = Math.max(...puffs.map((p) => p.cx + p.r));
  const maxY = Math.max(...puffs.map((p) => p.cy + p.r));

  const normalizedPuffs = puffs.map((p) => ({
    cx: p.cx - minX,
    cy: p.cy - minY,
    r: p.r,
  }));

  return {
    puffs: normalizedPuffs,
    width: maxX - minX,
    height: maxY - minY,
  };
};

const buildCloud = (id: number, x: number): CloudDef => {
  const targetWidth =
    CLOUD_WIDTH_MIN + Math.random() * (CLOUD_WIDTH_MAX - CLOUD_WIDTH_MIN);
  const targetHeight =
    targetWidth *
    (CLOUD_HEIGHT_RATIO_MIN +
      Math.random() * (CLOUD_HEIGHT_RATIO_MAX - CLOUD_HEIGHT_RATIO_MIN));
  const puffCount = Math.floor(
    CLOUD_MIN_PUFFS + Math.random() * (CLOUD_MAX_PUFFS - CLOUD_MIN_PUFFS + 1)
  );
  const { puffs, width, height } = generateCloudPuffs(
    puffCount,
    targetWidth,
    targetHeight
  );
  const opacity =
    CLOUD_OPACITY_MIN + Math.random() * (CLOUD_OPACITY_MAX - CLOUD_OPACITY_MIN);
  const y =
    (CLOUD_Y_MIN_RATIO +
      Math.random() * (CLOUD_Y_MAX_RATIO - CLOUD_Y_MIN_RATIO)) *
    window.innerHeight;

  return { id, x, y, width, height, puffs, opacity };
};

const buildClouds = (): CloudDef[] =>
  Array.from({ length: CLOUD_COUNT }, (_, i) =>
    buildCloud(i, Math.random() * window.innerWidth)
  );

const CloudInstance = ({ cloud }: { cloud: CloudDef }) => (
  <svg
    style={{
      position: "absolute",
      left: cloud.x,
      top: cloud.y,
      width: cloud.width,
      height: cloud.height,
      overflow: "visible",
    }}
    viewBox={`0 0 ${cloud.width} ${cloud.height}`}
  >
    <g fill={CLOUD_COLOR} opacity={cloud.opacity}>
      {cloud.puffs.map((puff, i) => (
        <circle key={i} cx={puff.cx} cy={puff.cy} r={puff.r} />
      ))}
    </g>
  </svg>
);

export const DuckParade = ({
  keyboardRef,
}: {
  keyboardRef: React.RefObject<HTMLDivElement>;
}) => {
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [hasError, setHasError] = useState(false);
  const [groundHeight, setGroundHeight] = useState(0);
  const [ducks, setDucks] = useState<DuckDef[]>(buildDucks);
  const clouds = useMemo<CloudDef[]>(buildClouds, []);
  const containerRef = useRef<HTMLDivElement>(null);
  const groundCanvasRef = useRef<HTMLCanvasElement>(null);
  const [x, setX] = useState(0);
  const [direction, setDirection] = useState<Direction>(1);
  const directionRef = useRef<Direction>(1);
  const phaseRef = useRef<Phase>("walking");
  const waitUntilRef = useRef<number>(0);
  const rafRef = useRef<number>();
  const lastTimestampRef = useRef<number | null>(null);
  const xRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    fetch(DUCK_JSON_SRC)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load duck animation");
        return res.json() as Promise<object>;
      })
      .then((data) => {
        if (cancelled) return;
        setAnimationData(data);
        const meta = data as { w?: number; h?: number };
        if (meta.w && meta.h) setAspectRatio(meta.h / meta.w);
      })
      .catch(() => {
        if (!cancelled) setHasError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const measure = () => {
      const el = keyboardRef.current;
      if (!el) return;
      const height = el.getBoundingClientRect().height;
      setGroundHeight((prev) => (Math.abs(prev - height) < 1 ? prev : height));
    };

    requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [keyboardRef]);

  useEffect(() => {
    const canvas = groundCanvasRef.current;
    if (!canvas || groundHeight <= 0) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = groundHeight;
      drawDirtTexture(canvas);
      drawGrassTexture(canvas);
    };

    resize();

    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(resize, 150);
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [groundHeight]);

  const duckAnimationData = useMemo(() => {
    if (!animationData) return {};
    return ducks.reduce<Record<number, object>>((acc, duck) => {
      acc[duck.id] = recolorAnimationData(
        animationData,
        duck.darkColor,
        duck.lightColor
      );
      return acc;
    }, {});
  }, [animationData, ducks]);

  const formationSpan = DUCK_SPACING_PX * (DUCK_COUNT - 1) + DUCK_SIZE_MAX;

  useEffect(() => {
    if (!animationData) return;

    directionRef.current = 1;
    phaseRef.current = "walking";
    xRef.current = -formationSpan;
    setDirection(1);
    setX(-formationSpan);

    const tick = (timestamp: number) => {
      if (lastTimestampRef.current === null)
        lastTimestampRef.current = timestamp;
      const dt = Math.min(
        MAX_DELTA_SECONDS,
        (timestamp - lastTimestampRef.current) / 1000
      );
      lastTimestampRef.current = timestamp;

      if (phaseRef.current === "waiting") {
        if (timestamp >= waitUntilRef.current) {
          const nextDirection: Direction = directionRef.current === 1 ? -1 : 1;
          directionRef.current = nextDirection;
          setDirection(nextDirection);
          const width = containerRef.current?.clientWidth ?? window.innerWidth;
          const resetX = nextDirection === 1 ? -formationSpan : width;
          xRef.current = resetX;
          setX(resetX);
          phaseRef.current = "walking";
        }
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const width = containerRef.current?.clientWidth ?? window.innerWidth;
      const next =
        xRef.current + WALK_SPEED_PX_PER_SEC * dt * directionRef.current;

      const exitedRight = directionRef.current === 1 && next > width;
      const exitedLeft = directionRef.current === -1 && next < -formationSpan;

      if (exitedRight || exitedLeft) {
        phaseRef.current = "waiting";
        waitUntilRef.current =
          timestamp +
          WAIT_OFFSCREEN_MS_MIN +
          Math.random() * (WAIT_OFFSCREEN_MS_MAX - WAIT_OFFSCREEN_MS_MIN);
        setDucks((prev) =>
          prev.map((duck) => {
            const palette = randomPalette();
            return {
              ...duck,
              darkColor: palette.dark,
              lightColor: palette.light,
            };
          })
        );
      }

      xRef.current = next;
      setX(next);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimestampRef.current = null;
    };
  }, [animationData, formationSpan]);

  const groundY = window.innerHeight - groundHeight;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ background: SKY_COLOR, zIndex: 0 }}
    >
      {clouds.map((cloud) => (
        <CloudInstance key={cloud.id} cloud={cloud} />
      ))}
      <canvas
        ref={groundCanvasRef}
        style={{ position: "absolute", left: 0, bottom: 0, width: "100%" }}
      />
      {animationData &&
        !hasError &&
        ducks.map((duck) => (
          <DuckInstance
            key={duck.id}
            duck={duck}
            x={x}
            direction={direction}
            groundY={groundY}
            aspectRatio={aspectRatio}
            animationData={duckAnimationData[duck.id]}
          />
        ))}
    </div>
  );
};
