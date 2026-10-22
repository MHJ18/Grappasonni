"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import { useAppearance } from "./appearance-provider";

gsap.registerPlugin(ScrollTrigger);

type Point = { x: number; y: number; width: number };
const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
const mix = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

function center(element: Element, xFraction = 0.5, yFraction = 0.5): Point {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width * xFraction,
    y: rect.top + window.scrollY + rect.height * yFraction,
    width: rect.width,
  };
}

/** Scroll-linked pasta cutouts travel from the hero plate through the category rail to the featured dish. */
export function PastaFlight() {
  const { ready, hero, motion } = useAppearance();
  const reduced = useReducedMotion();
  const pieces = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    if (!ready || !motion || reduced) return;
    const source = document.querySelector(
      hero === "classic" ? ".hero-dish-anchor" : ".hero-photo",
    );
    const category = document.querySelector(
      '[data-food-category="primi"] .food-category-image',
    );
    const destination = document.querySelector("#special .signature-visual");
    const heroSection = document.querySelector("#hero");
    if (!source || !category || !destination || !heroSection) return;

    let frame = 0;
    let desired = 0;
    let displayed = 0;
    const render = () => {
      frame = 0;
      displayed += (desired - displayed) * 0.19;
      if (Math.abs(desired - displayed) < 0.0004) displayed = desired;

      const first =
        hero === "classic"
          ? center(source)
          : center(
              source,
              window.innerWidth < 768 ? 0.58 : 0.77,
              window.innerWidth < 768 ? 0.6 : 0.47,
            );
      const middle = center(category);
      const last = center(destination);
      // The category rail can be scrolled independently on a narrow screen.
      if (middle.x < 0 || middle.x > window.innerWidth) {
        middle.x = window.innerWidth * 0.5;
      }

      pieces.current.forEach((piece, index) => {
        if (!piece) return;
        const delay = index * 0.044;
        const progress = clamp((displayed - delay) / (1 - delay));
        const firstLeg = progress < 0.46;
        const leg = firstLeg
          ? clamp(progress / 0.46)
          : clamp((progress - 0.46) / 0.54);
        const start = firstLeg ? first : middle;
        const end = firstLeg ? middle : last;
        const spread = index - 1;
        const startWidth = Math.min(
          start.width,
          hero === "cinematic" ? (window.innerWidth < 768 ? 360 : 650) : start.width,
        );
        const startX =
          start.x + spread * startWidth * (firstLeg ? 0.13 : 0.23);
        const startY = start.y + (index % 2 ? -22 : 22);
        const endX = end.x + spread * end.width * (firstLeg ? 0.16 : 0.1);
        const endY = end.y + (index % 2 ? 12 : -16);
        const lift = Math.sin(Math.PI * leg) * (68 + index * 20);
        const visibility = clamp(leg / 0.09) * clamp((1 - leg) / 0.13);
        gsap.set(piece, {
          x:
            mix(startX, endX, leg) -
            41 +
            Math.sin(leg * Math.PI * 2) * (9 + index * 5),
          y: mix(startY, endY, leg) - window.scrollY - 41 - lift,
          rotation: (firstLeg ? 0 : 245) + leg * (205 + index * 75),
          scale: mix(firstLeg ? 0.85 : 0.38, firstLeg ? 0.38 : 0.8, leg),
          opacity: visibility * clamp((displayed - 0.007) / 0.018),
        });
      });
      if (displayed !== desired) frame = requestAnimationFrame(render);
    };
    const onProgress = (progress: number) => {
      desired = progress;
      if (!frame) frame = requestAnimationFrame(render);
    };
    const trigger = ScrollTrigger.create({
      trigger: heroSection,
      start: "top top",
      endTrigger: destination,
      end: "center center",
      invalidateOnRefresh: true,
      onUpdate: (self) => onProgress(self.progress),
      onRefresh: (self) => onProgress(self.progress),
    });
    const categoryTrack = document.querySelector(".food-category-track");
    const onRailScroll = () => onProgress(trigger.progress);
    categoryTrack?.addEventListener("scroll", onRailScroll, { passive: true });
    onProgress(trigger.progress);
    return () => {
      trigger.kill();
      categoryTrack?.removeEventListener("scroll", onRailScroll);
      cancelAnimationFrame(frame);
      pieces.current.forEach(
        (piece) => piece && gsap.set(piece, { opacity: 0 }),
      );
    };
  }, [ready, motion, reduced, hero]);

  if (!ready || !motion || reduced) return null;
  return (
    <div className="pasta-flight" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="pasta-flight-piece"
          ref={(element) => {
            pieces.current[index] = element;
          }}
        >
          <Image
            src={
              hero === "classic"
                ? "/images/rigatoni-piece.webp"
                : "/images/rigatoni-carbonara-piece.webp"
            }
            alt=""
            width={128}
            height={128}
            loading="eager"
            unoptimized
            draggable={false}
          />
        </span>
      ))}
    </div>
  );
}
