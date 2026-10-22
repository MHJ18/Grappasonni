"use client";
import { useEffect, useId, useRef, useState } from "react";
export function FoodSteam({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const element = useRef<SVGSVGElement>(null);
  const [active, setActive] = useState(true);
  useEffect(() => {
    const node = element.current;
    if (!node) return;
    let visible = true;
    const update = () =>
      setActive(visible && document.visibilityState === "visible");
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        update();
      },
      { rootMargin: "80px" },
    );
    observer.observe(node);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  return (
    <svg
      className={`food-steam ${className}`}
      ref={element}
      data-active={active}
      viewBox="0 0 300 250"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fff3d9" stopOpacity="0" />
          <stop offset=".35" stopColor="#fff3d9" stopOpacity=".5" />
          <stop offset="1" stopColor="#fff3d9" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[
        "M70 245 C30 210 110 170 68 130 S90 58 62 10",
        "M125 250 C170 210 80 172 130 125 S104 65 139 4",
        "M185 250 C140 210 220 174 180 133 S210 68 181 5",
        "M234 245 C277 210 204 179 238 144 S218 80 246 22",
      ].map((d, index) => (
        <path
          key={d}
          className={`steam-wisp steam-wisp-${index}`}
          d={d}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={index % 2 ? 11 : 7}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
