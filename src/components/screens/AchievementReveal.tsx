import React, { useEffect, useEffectEvent, useMemo, useState } from "react";
import { motion } from "framer-motion";
import ChestBase from "@/assets/icons/chest-base.svg";
import ChestDoorLeft from "@/assets/icons/chest-door-left.svg";
import ChestDoorRight from "@/assets/icons/chest-door-right.svg";
import RibbonIcon from "@/assets/icons/ribon.svg?react";

const TIME_SCALE = 1.6;

const OVERLAY_FADE_MS = 300 * TIME_SCALE;
const IDLE_BEFORE_SHAKE_MS = 500 * TIME_SCALE;

const SHAKE_STEP_COUNT = 14;
const SHAKE_MIN_INTERVAL_MS = 35 * TIME_SCALE;
const SHAKE_BASE_INTERVAL_MS = 105 * TIME_SCALE;
const SHAKE_INTERVAL_DECAY_MS = 5 * TIME_SCALE;
const SHAKE_MIN_ANGLE_DEG = 1.5;
const SHAKE_MAX_EXTRA_ANGLE_DEG = 9.5;
const SHAKE_SCALE_PULSE = 0.04;
const SHAKE_JITTER_PX = 6;
const SHAKE_SETTLE_SCALE = 1.06;
const SHAKE_SETTLE_MS = 100 * TIME_SCALE;
const SHAKE_TO_OPEN_DELAY_MS = 220 * TIME_SCALE;

const FLASH_PEAK_OPACITY = 0.85;
const FLASH_IN_MS = 80 * TIME_SCALE;
const FLASH_OUT_MS = 350 * TIME_SCALE;

const DOOR_OPEN_ANGLE_DEG = 70;
const DOOR_TRANSITION_MS = 600 * TIME_SCALE;

const GLOW_SCALE = 14;
const GLOW_IN_MS = 200 * TIME_SCALE;
const GLOW_SCALE_MS = 700 * TIME_SCALE;
const GLOW_FADE_OUT_AT_MS = 750 * TIME_SCALE;
const GLOW_FADE_OUT_MS = 600 * TIME_SCALE;

const RAY_COUNT = 12;
const RAY_LENGTH_PX = 260;
const RAY_STAGGER_MS = 20 * TIME_SCALE;
const RAY_IN_MS = 1100 * TIME_SCALE;
const RAY_FADE_OUT_AT_MS = 500 * TIME_SCALE;
const RAY_FADE_OUT_MS = 600 * TIME_SCALE;

const PARTICLE_COUNT = 46;
const PARTICLE_SPAWN_DELAY_MS = 80 * TIME_SCALE;
const PARTICLE_MIN_DIST = 90;
const PARTICLE_MAX_DIST = 160;
const PARTICLE_MIN_SIZE = 4;
const PARTICLE_MAX_SIZE = 11;
const PARTICLE_RISE_PX = 60;
const PARTICLE_TRAVEL_MS = 1100 * TIME_SCALE;
const PARTICLE_FADE_START_MS = 600 * TIME_SCALE;

const DUST_INTERVAL_MS = 90 * TIME_SCALE;
const DUST_TRAVEL_MS = 500 * TIME_SCALE;

const RIBBON_RISE_DELAY_MS = 180 * TIME_SCALE;
const RIBBON_RISE_MS = 700 * TIME_SCALE;
const RIBBON_SETTLE_DELAY_MS = 500 * TIME_SCALE;
const RIBBON_SETTLE_MS = 400 * TIME_SCALE;
const RIBBON_RISE_SCALE = 2.6;
const RIBBON_SETTLED_SCALE = 2.2;

const HOLD_BEFORE_CLOSE_MS = 2900 * TIME_SCALE;
const TEXT_REVEAL_DELAY_MS = RIBBON_RISE_DELAY_MS + RIBBON_SETTLE_DELAY_MS;
const TEXT_FADE_IN_MS = 500;
const OVERLAY_FADE_OUT_MS = 400 * TIME_SCALE;
const DONE_AFTER_FADE_MS = 420 * TIME_SCALE;

const CHEST_WRAP_SIZE = "clamp(190px, 46vw, 260px)";

type Particle = {
  id: string;
  angle: number;
  distance: number;
  size: number;
  color: string;
};

type Dust = {
  id: string;
  dx: number;
  dy: number;
};

const GOLD = "#FFD700";
const AMBER = "#FFBF00";

function playRattle(progress: number) {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const t = ctx.currentTime;

    const bufferSize = Math.floor(ctx.sampleRate * 0.06);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 700 + progress * 1400;
    noiseFilter.Q.value = 1.1;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, t);
    noiseGain.gain.linearRampToValueAtTime(0.1 + progress * 0.12, t + 0.006);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);
    noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
    noise.start(t);
    noise.stop(t + 0.06);

    const knock = ctx.createOscillator();
    const knockGain = ctx.createGain();
    knock.type = "triangle";
    knock.frequency.setValueAtTime(85 + progress * 35, t);
    knock.frequency.exponentialRampToValueAtTime(55, t + 0.05);
    knockGain.gain.setValueAtTime(0.0001, t);
    knockGain.gain.linearRampToValueAtTime(0.09 + progress * 0.06, t + 0.008);
    knockGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    knock.connect(knockGain).connect(ctx.destination);
    knock.start(t);
    knock.stop(t + 0.07);

    setTimeout(() => {
      try {
        void ctx.close();
      } catch {}
    }, 200);
  } catch {}
}

function playBurstSound() {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const t = ctx.currentTime;

    const boom = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boom.type = "sine";
    boom.frequency.setValueAtTime(110, t);
    boom.frequency.exponentialRampToValueAtTime(35, t + 0.35);
    boomGain.gain.setValueAtTime(0.0001, t);
    boomGain.gain.linearRampToValueAtTime(0.45, t + 0.03);
    boomGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    boom.connect(boomGain).connect(ctx.destination);
    boom.start(t);
    boom.stop(t + 0.42);

    const creak = ctx.createOscillator();
    const creakGain = ctx.createGain();
    creak.type = "sawtooth";
    creak.frequency.setValueAtTime(180, t);
    creak.frequency.exponentialRampToValueAtTime(90, t + 0.22);
    creakGain.gain.setValueAtTime(0.0001, t);
    creakGain.gain.linearRampToValueAtTime(0.1, t + 0.02);
    creakGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    creak.connect(creakGain).connect(ctx.destination);
    creak.start(t);
    creak.stop(t + 0.27);

    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((freq, i) => {
      const start = t + 0.28 + i * 0.08;
      const dur = i === notes.length - 1 ? 0.6 : 0.14;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(6000, start);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.17, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.connect(gain).connect(filter).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur);
    });

    setTimeout(() => {
      try {
        void ctx.close();
      } catch {}
    }, 1200);
  } catch {}
}

const buildShakeSteps = () => {
  const rotate: number[] = [0];
  const x: number[] = [0];
  const scale: number[] = [1];
  const times: number[] = [0];
  const stepDelaysMs: number[] = [];

  let elapsed = 0;
  for (let step = 1; step <= SHAKE_STEP_COUNT; step++) {
    const progress = step / SHAKE_STEP_COUNT;
    const amp = SHAKE_MIN_ANGLE_DEG + progress * SHAKE_MAX_EXTRA_ANGLE_DEG;
    const angle = (step % 2 === 0 ? -1 : 1) * amp;
    const scalePulse =
      1 + progress * SHAKE_SCALE_PULSE * (step % 2 === 0 ? 1 : -1);
    const jitterX = (Math.random() - 0.5) * progress * SHAKE_JITTER_PX;

    const interval = Math.max(
      SHAKE_MIN_INTERVAL_MS,
      SHAKE_BASE_INTERVAL_MS - step * SHAKE_INTERVAL_DECAY_MS
    );
    elapsed += interval;
    stepDelaysMs.push(elapsed);

    rotate.push(angle);
    x.push(jitterX);
    scale.push(scalePulse);
    times.push(elapsed);
  }

  rotate.push(0);
  x.push(0);
  scale.push(SHAKE_SETTLE_SCALE);
  const totalMs = elapsed + SHAKE_SETTLE_MS;
  times.push(totalMs);

  return {
    rotate,
    x,
    scale,
    times: times.map((tMs) => tMs / totalMs),
    totalMs,
    stepDelaysMs,
  };
};

type Props = {
  onDone: () => void;
};

export function AchievementReveal({ onDone }: Props) {
  const [visible, setVisible] = useState(true);
  const [overlayOn, setOverlayOn] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [opened, setOpened] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [glowOn, setGlowOn] = useState(false);
  const [glowFading, setGlowFading] = useState(false);
  const [raysOn, setRaysOn] = useState(false);
  const [raysFadingOut, setRaysFadingOut] = useState(false);
  const [ribbonPhase, setRibbonPhase] = useState<
    "hidden" | "rising" | "settled"
  >("hidden");
  const [showText, setShowText] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [dust, setDust] = useState<Dust[]>([]);

  const shakeData = useMemo(() => buildShakeSteps(), []);

  const rays = useMemo(
    () => Array.from({ length: RAY_COUNT }, (_, i) => (i / RAY_COUNT) * 360),
    []
  );

  const notifyDone = useEffectEvent(() => {
    onDone();
  });

  useEffect(() => {
    setOverlayOn(true);

    const timers: ReturnType<typeof setTimeout>[] = [];
    const intervals: ReturnType<typeof setInterval>[] = [];

    timers.push(
      setTimeout(() => {
        setShaking(true);
        let dustCounter = 0;
        const dustInterval = setInterval(() => {
          const newDust: Dust[] = Array.from({ length: 3 }, () => {
            dustCounter += 1;
            return {
              id: `dust-${dustCounter}`,
              dx: (Math.random() - 0.5) * 70,
              dy: -20 - Math.random() * 30,
            };
          });
          setDust((prev) => [...prev, ...newDust]);
        }, DUST_INTERVAL_MS);
        intervals.push(dustInterval);

        shakeData.stepDelaysMs.forEach((delayMs, i) => {
          timers.push(
            setTimeout(() => {
              playRattle((i + 1) / SHAKE_STEP_COUNT);
            }, delayMs)
          );
        });

        timers.push(
          setTimeout(() => {
            clearInterval(dustInterval);
            setShaking(false);

            timers.push(
              setTimeout(() => {
                openChest();
              }, SHAKE_TO_OPEN_DELAY_MS)
            );
          }, shakeData.totalMs)
        );
      }, IDLE_BEFORE_SHAKE_MS)
    );

    const openChest = () => {
      playBurstSound();
      setOpened(true);

      setFlashOn(true);
      timers.push(setTimeout(() => setFlashOn(false), FLASH_IN_MS));

      setGlowOn(true);
      setRaysOn(true);
      timers.push(setTimeout(() => setRaysFadingOut(true), RAY_FADE_OUT_AT_MS));

      timers.push(
        setTimeout(() => {
          setParticles(
            Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
              id: `particle-${i}`,
              angle:
                (i / PARTICLE_COUNT) * Math.PI * 2 +
                (Math.random() - 0.5) * 0.5,
              distance:
                PARTICLE_MIN_DIST +
                Math.random() * (PARTICLE_MAX_DIST - PARTICLE_MIN_DIST),
              size:
                PARTICLE_MIN_SIZE +
                Math.random() * (PARTICLE_MAX_SIZE - PARTICLE_MIN_SIZE),
              color: Math.random() > 0.5 ? GOLD : AMBER,
            }))
          );
        }, PARTICLE_SPAWN_DELAY_MS)
      );

      timers.push(
        setTimeout(() => {
          setRibbonPhase("rising");
          timers.push(
            setTimeout(() => setRibbonPhase("settled"), RIBBON_SETTLE_DELAY_MS)
          );
        }, RIBBON_RISE_DELAY_MS)
      );

      timers.push(setTimeout(() => setShowText(true), TEXT_REVEAL_DELAY_MS));

      timers.push(setTimeout(() => setGlowFading(true), GLOW_FADE_OUT_AT_MS));

      timers.push(
        setTimeout(() => {
          setVisible(false);
          timers.push(setTimeout(notifyDone, DONE_AFTER_FADE_MS));
        }, HOLD_BEFORE_CLOSE_MS)
      );
    };

    return () => {
      timers.forEach(clearTimeout);
      intervals.forEach(clearInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shakeData]);

  return (
    <motion.div
      className="fixed inset-0"
      style={{ zIndex: 200, pointerEvents: "none" }}
      initial={{ opacity: 1 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: OVERLAY_FADE_OUT_MS / 1000, ease: "easeInOut" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "#0A0A0A",
          backgroundImage: `
            linear-gradient(90deg, rgba(255,215,0,0.03) 1px, transparent 1px),
            linear-gradient(rgba(255,215,0,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "16px 16px",
        }}
      />

      <motion.div
        className="absolute inset-0"
        style={{ background: "#fff" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: flashOn ? FLASH_PEAK_OPACITY : 0 }}
        transition={{
          duration: (flashOn ? FLASH_IN_MS : FLASH_OUT_MS) / 1000,
          ease: "easeOut",
        }}
      />

      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: overlayOn ? 1 : 0 }}
        transition={{ duration: OVERLAY_FADE_MS / 1000, ease: "easeInOut" }}
      >
        <motion.div
          className="absolute rounded-full"
          style={{
            left: "50%",
            top: "44%",
            width: 40,
            height: 40,
            translateX: "-50%",
            translateY: "-50%",
            background: `radial-gradient(circle, rgba(255,215,0,0.95) 0%, rgba(255,191,0,0.45) 35%, transparent 70%)`,
          }}
          initial={{ opacity: 0, scale: 1 }}
          animate={{
            opacity: glowOn ? (glowFading ? 0 : 1) : 0,
            scale: glowOn ? GLOW_SCALE : 1,
          }}
          transition={{
            opacity: {
              duration: (glowFading ? GLOW_FADE_OUT_MS : GLOW_IN_MS) / 1000,
              ease: "easeOut",
            },
            scale: { duration: GLOW_SCALE_MS / 1000, ease: "easeOut" },
          }}
        />

        {rays.map((angle, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: "50%",
              top: "44%",
              width: 5,
              height: RAY_LENGTH_PX,
              background:
                "linear-gradient(to bottom, rgba(255,215,0,0.9), transparent 80%)",
              transformOrigin: "50% 0%",
              rotate: angle,
            }}
            initial={{ opacity: 0, scaleY: 1 }}
            animate={{
              opacity: raysOn ? (raysFadingOut ? 0 : 0.9) : 0,
              scaleY: raysOn ? 1.3 : 1,
            }}
            transition={{
              opacity: {
                duration: (raysFadingOut ? RAY_FADE_OUT_MS : 150) / 1000,
                delay: raysFadingOut ? 0 : (i * RAY_STAGGER_MS) / 1000,
                ease: "easeOut",
              },
              scaleY: {
                duration: RAY_IN_MS / 1000,
                delay: (i * RAY_STAGGER_MS) / 1000,
                ease: "easeOut",
              },
            }}
          />
        ))}

        <div
          className="relative flex flex-col items-center"
          style={{ zIndex: 3 }}
        >
          <motion.div
            style={{
              position: "relative",
              width: CHEST_WRAP_SIZE,
              height: CHEST_WRAP_SIZE,
            }}
            initial={{ rotate: 0, x: 0, scale: 1 }}
            animate={
              shaking
                ? {
                    rotate: shakeData.rotate,
                    x: shakeData.x,
                    scale: shakeData.scale,
                  }
                : opened
                ? { rotate: 0, x: 0, scale: 1 }
                : { rotate: 0, x: 0, scale: 1 }
            }
            transition={
              shaking
                ? {
                    duration: shakeData.totalMs / 1000,
                    times: shakeData.times,
                    ease: "linear",
                  }
                : { duration: 0.3, ease: [0.2, 1.6, 0.3, 1] }
            }
          >
            <motion.div
              className="absolute"
              style={{
                left: "50%",
                top: "48%",
                width: "24%",
                translateX: "-50%",
                translateY: "-50%",
                zIndex: 2,
              }}
              initial={{ opacity: 0, scale: 0.15, rotate: -25, y: 0 }}
              animate={
                ribbonPhase === "hidden"
                  ? { opacity: 0, scale: 0.15, rotate: -25, y: 0 }
                  : ribbonPhase === "rising"
                  ? {
                      opacity: 1,
                      scale: RIBBON_RISE_SCALE,
                      rotate: 6,
                      y: "-220%",
                    }
                  : {
                      opacity: 1,
                      scale: RIBBON_SETTLED_SCALE,
                      rotate: 0,
                      y: "-200%",
                    }
              }
              transition={
                ribbonPhase === "rising"
                  ? {
                      duration: RIBBON_RISE_MS / 1000,
                      ease: [0.15, 1.5, 0.3, 1],
                    }
                  : { duration: RIBBON_SETTLE_MS / 1000, ease: "easeInOut" }
              }
            >
              <RibbonIcon style={{ width: "100%", height: "auto" }} />
            </motion.div>

            <div
              className="absolute"
              style={{
                left: "50%",
                top: "58%",
                width: "84%",
                aspectRatio: "200 / 172",
                transform: "translate(-50%, -50%)",
              }}
            >
              <img
                src={ChestBase}
                alt=""
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                }}
              />
              <motion.img
                src={ChestDoorLeft}
                alt=""
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  transformOrigin: "4% 51.16%",
                }}
                initial={{ rotate: 0 }}
                animate={{ rotate: opened ? -DOOR_OPEN_ANGLE_DEG : 0 }}
                transition={{
                  duration: DOOR_TRANSITION_MS / 1000,
                  ease: [0.3, 1.35, 0.35, 1],
                }}
              />
              <motion.img
                src={ChestDoorRight}
                alt=""
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  transformOrigin: "96% 51.16%",
                }}
                initial={{ rotate: 0 }}
                animate={{ rotate: opened ? DOOR_OPEN_ANGLE_DEG : 0 }}
                transition={{
                  duration: DOOR_TRANSITION_MS / 1000,
                  ease: [0.3, 1.35, 0.35, 1],
                }}
              />
            </div>

            {dust.map((d) => (
              <motion.div
                key={d.id}
                className="absolute rounded-full"
                style={{
                  left: "50%",
                  top: "62%",
                  width: 4,
                  height: 4,
                  background: "#d6a86a",
                }}
                initial={{ opacity: 0, x: 0, y: 0 }}
                animate={{ opacity: [0, 0.7, 0], x: d.dx, y: d.dy }}
                transition={{
                  duration: DUST_TRAVEL_MS / 1000,
                  ease: "easeOut",
                }}
              />
            ))}
          </motion.div>

          <motion.p
            className="font-royal font-bold text-crown-gold crown-glow tracking-wider text-center"
            style={{
              marginTop: 20,
              fontSize: "clamp(20px, 5vw, 32px)",
              whiteSpace: "nowrap",
            }}
            initial={{ opacity: 0, y: -8 }}
            animate={{
              opacity: showText ? 1 : 0,
              y: showText ? 0 : -8,
            }}
            transition={{ duration: TEXT_FADE_IN_MS / 1000, ease: "easeOut" }}
          >
            Achievement Unlocked!
          </motion.p>
        </div>

        {particles.map((p) => {
          const dx = Math.cos(p.angle) * p.distance;
          const dy = Math.sin(p.angle) * p.distance - PARTICLE_RISE_PX;
          return (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: "50%",
                top: "42%",
                width: p.size,
                height: p.size,
                background: p.color,
              }}
              initial={{ opacity: 0, x: 0, y: 0, scale: 1 }}
              animate={{
                opacity: [0, 1, 0],
                x: dx,
                y: dy,
                scale: 0.4,
              }}
              transition={{
                duration: PARTICLE_TRAVEL_MS / 1000,
                ease: [0.15, 0.8, 0.3, 1],
                times: [0, PARTICLE_FADE_START_MS / PARTICLE_TRAVEL_MS, 1],
              }}
            />
          );
        })}
      </motion.div>
    </motion.div>
  );
}
