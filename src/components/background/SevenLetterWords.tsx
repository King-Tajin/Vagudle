import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const FONT_SIZE = 18;
const SPREAD = 125;
const MAX_ROTATION = 22;

const WORD_OPACITY = 1;

const toTitleCase = (w: string) =>
  w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

const pickWord = (pool: string[]) =>
  toTitleCase(pool[Math.floor(Math.random() * pool.length)]);

interface WordSlot {
  id: number;
  x: number;
  y: number;
  rotation: number;
  word: string;
  duration: number;
  initialDelay: number;
}

let slotId = 0;

const buildSlots = (W: number, H: number, pool: string[]): WordSlot[] => {
  const cols = Math.ceil(W / SPREAD);
  const rows = Math.ceil(H / SPREAD);
  const cellW = 100 / cols;
  const cellH = 100 / rows;
  const slots: WordSlot[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x =
        (col + 0.5) * cellW + (Math.random() - 0.5) * cellW * 0.6;
      const y =
        (row + 0.5) * cellH + (Math.random() - 0.5) * cellH * 0.6;

      slots.push({
        id: slotId++,
        x: Math.max(2, Math.min(98, x)),
        y: Math.max(2, Math.min(98, y)),
        rotation: (Math.random() - 0.5) * 2 * MAX_ROTATION,
        word: pickWord(pool),
        duration: 4 + Math.random() * 4,
        initialDelay: Math.random() * 7,
      });
    }
  }

  return slots;
};

interface FadingWordProps {
  slot: WordSlot;
  pool: string[];
}

const FadingWord = ({ slot, pool }: FadingWordProps) => {
  const [state, setState] = useState({ word: slot.word, cycle: 0 });

  const nextWord = () => {
    setState((prev) => ({ word: pickWord(pool), cycle: prev.cycle + 1 }));
  };

  return (
    <motion.span
      key={state.cycle}
      style={{
        position: "absolute",
        left: `${slot.x}%`,
        top: `${slot.y}%`,
        transform: `translate(-50%, -50%) rotate(${slot.rotation}deg)`,
        fontSize: FONT_SIZE,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 700,
        color: "#000000",
        whiteSpace: "nowrap",
        userSelect: "none",
        pointerEvents: "none",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, WORD_OPACITY, WORD_OPACITY, 0] }}
      transition={{
        duration: slot.duration,
        delay: state.cycle === 0 ? slot.initialDelay : 0,
        times: [0, 0.2, 0.8, 1],
        ease: "easeInOut",
      }}
      onAnimationComplete={nextWord}
    >
      {state.word}
    </motion.span>
  );
};

export const SevenLetterWords = () => {
  const [pool, setPool] = useState<string[]>([]);
  const [slots, setSlots] = useState<WordSlot[]>([]);
  const [size, setSize] = useState({
    W: window.innerWidth,
    H: window.innerHeight,
  });

  useEffect(() => {
    Promise.all([
      import("../../constants/normalWords"),
      import("../../constants/hardWords"),
    ]).then(([{ NORMAL_WORDS }, { HARD_WORDS }]) => {
      const merged = Array.from(
        new Set(
          [...NORMAL_WORDS, ...HARD_WORDS].filter((w) => w.length === 7)
        )
      );
      setPool(merged);
    });
  }, []);

  useEffect(() => {
    const onResize = () =>
      setSize({ W: window.innerWidth, H: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (pool.length === 0) return;
    setSlots(buildSlots(size.W, size.H, pool));
  }, [pool, size]);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ background: "#0d1322", zIndex: 0 }}
    >
      {slots.map((slot) => (
        <FadingWord key={slot.id} slot={slot} pool={pool} />
      ))}
    </div>
  );
};
