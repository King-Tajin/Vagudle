import { useEffect, useRef, useState } from "react";

const VIDEO_SRC = "/backgrounds/flying-mudskipper.webm";
const MUD_TEXTURE_SRC = "/backgrounds/mud-texture.webp";
const MUD_ZOOM_PERCENT = 180;

const SPRITE_HEIGHT_RATIO = 0.36;
const VERTICAL_POSITION_RATIO = 0.325;
const OFFSCREEN_MARGIN_PX = 50;

const CROSS_DURATION_SEC_MIN = 12;
const CROSS_DURATION_SEC_MAX = 18;
const WAIT_OFFSCREEN_MS_MIN = 5000;
const WAIT_OFFSCREEN_MS_MAX = 14000;
const MAX_DELTA_SECONDS = 0.05;

type Direction = 1 | -1;
type Phase = "flying" | "waiting";

const randomMudPosition = () =>
  `${Math.random() * 100}% ${Math.random() * 100}%`;

const randomCrossDuration = () =>
  CROSS_DURATION_SEC_MIN +
  Math.random() * (CROSS_DURATION_SEC_MAX - CROSS_DURATION_SEC_MIN);

const randomWaitMs = () =>
  WAIT_OFFSCREEN_MS_MIN +
  Math.random() * (WAIT_OFFSCREEN_MS_MAX - WAIT_OFFSCREEN_MS_MIN);

const MudBackground = ({ position }: { position: string }) => (
  <div
    className="absolute inset-0"
    style={{
      backgroundImage: `url(${MUD_TEXTURE_SRC})`,
      backgroundSize: `${MUD_ZOOM_PERCENT}%`,
      backgroundPosition: position,
      backgroundRepeat: "no-repeat",
    }}
  />
);

export const FlyingMudskipper = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mudPosition] = useState<string>(randomMudPosition);
  const [widthPerHeight, setWidthPerHeight] = useState(1.6);
  const [x, setX] = useState(0);
  const [direction, setDirection] = useState<Direction>(-1);

  const directionRef = useRef<Direction>(-1);
  const phaseRef = useRef<Phase>("flying");
  const speedRef = useRef(0);
  const waitUntilRef = useRef(0);
  const rafRef = useRef<number | undefined>(undefined);
  const lastTimestampRef = useRef<number | null>(null);
  const xRef = useRef(0);

  useEffect(() => {
    const measureSpriteWidth = () =>
      videoRef.current?.getBoundingClientRect().width ??
      window.innerHeight * SPRITE_HEIGHT_RATIO * widthPerHeight;

    const spriteWidth = measureSpriteWidth();
    const width = containerRef.current?.clientWidth ?? window.innerWidth;

    directionRef.current = -1;
    phaseRef.current = "flying";
    xRef.current = width + OFFSCREEN_MARGIN_PX;
    // Runs once per mount/widthPerHeight change, not every render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDirection(-1);
    setX(width + OFFSCREEN_MARGIN_PX);

    const distance = width + spriteWidth + OFFSCREEN_MARGIN_PX * 2;
    speedRef.current = distance / randomCrossDuration();

    const tick = (timestamp: number) => {
      if (lastTimestampRef.current === null)
        lastTimestampRef.current = timestamp;
      const dt = Math.min(
        MAX_DELTA_SECONDS,
        (timestamp - lastTimestampRef.current) / 1000
      );
      lastTimestampRef.current = timestamp;

      const currentSpriteWidth = measureSpriteWidth();

      if (phaseRef.current === "waiting") {
        if (timestamp >= waitUntilRef.current) {
          const nextDirection: Direction = directionRef.current === 1 ? -1 : 1;
          directionRef.current = nextDirection;
          setDirection(nextDirection);
          const currentWidth =
            containerRef.current?.clientWidth ?? window.innerWidth;
          const resetX =
            nextDirection === 1
              ? -(currentSpriteWidth + OFFSCREEN_MARGIN_PX)
              : currentWidth + OFFSCREEN_MARGIN_PX;
          xRef.current = resetX;
          setX(resetX);
          speedRef.current =
            (currentWidth + currentSpriteWidth + OFFSCREEN_MARGIN_PX * 2) /
            randomCrossDuration();
          phaseRef.current = "flying";
        }
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const currentWidth =
        containerRef.current?.clientWidth ?? window.innerWidth;
      const next = xRef.current + speedRef.current * dt * directionRef.current;

      const exitedRight = directionRef.current === 1 && next > currentWidth;
      const exitedLeft =
        directionRef.current === -1 && next < -currentSpriteWidth;

      if (exitedRight || exitedLeft) {
        phaseRef.current = "waiting";
        waitUntilRef.current = timestamp + randomWaitMs();
        xRef.current = exitedRight
          ? currentWidth + OFFSCREEN_MARGIN_PX
          : -(currentSpriteWidth + OFFSCREEN_MARGIN_PX);
        setX(xRef.current);
        rafRef.current = requestAnimationFrame(tick);
        return;
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
  }, [widthPerHeight]);

  const spriteHeight = window.innerHeight * SPRITE_HEIGHT_RATIO;
  const spriteWidth = spriteHeight * widthPerHeight;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <MudBackground position={mudPosition} />
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        autoPlay
        loop
        muted
        playsInline
        onLoadedMetadata={(e) => {
          const video = e.currentTarget;
          if (video.videoWidth && video.videoHeight)
            setWidthPerHeight(video.videoWidth / video.videoHeight);
        }}
        style={{
          position: "absolute",
          left: x,
          bottom: `${VERTICAL_POSITION_RATIO * 100}%`,
          width: spriteWidth,
          height: spriteHeight,
          transform: `scaleX(${-direction})`,
          transformOrigin: "center",
        }}
      />
    </div>
  );
};
