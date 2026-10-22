"use client";
import { useEffect } from "react";
import { motion, useReducedMotion, useAnimationControls } from "motion/react";
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const controls = useAnimationControls();
  useEffect(() => {
    if (reduce || window.matchMedia('(max-width:1023px)').matches) return;
    void controls.start({
      opacity: [0.75, 1],
      y: [8, 0],
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    });
  }, [controls, reduce]);
  return (
    <motion.div className="route-transition" initial={false} animate={controls}>
      {children}
    </motion.div>
  );
}
