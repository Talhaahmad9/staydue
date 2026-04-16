"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface CardShuffleProps {
  children: React.ReactNode[];
  interval?: number;
  className?: string;
}

export default function CardShuffle({
  children,
  interval = 4000,
  className = "",
}: CardShuffleProps): React.ReactElement {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = children.length;

  const next = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  useEffect(() => {
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [next, interval]);

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="popLayout">
        {children.map((child, i) => {
          const position = (i - activeIndex + total) % total;
          if (position >= 3 && total > 3) return null;

          const isFront = position === 0;
          const offset = Math.min(position, 2);

          return (
            <motion.div
              key={i}
              layout
              initial={{ scale: 0.92, y: 20, opacity: 0 }}
              animate={{
                scale: 1 - offset * 0.05,
                y: offset * 12,
                opacity: 1 - offset * 0.25,
                zIndex: total - position,
              }}
              exit={{ scale: 0.88, y: -30, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className={position === 0 ? "relative" : "absolute inset-x-0 top-0"}
              style={{ pointerEvents: isFront ? "auto" : "none" }}
            >
              {child}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
