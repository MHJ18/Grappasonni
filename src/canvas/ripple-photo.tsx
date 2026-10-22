"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import {
  useElementActive,
  useVisualCapability,
  VisualBoundary,
} from "./visual-capability";

const RippleCanvas = dynamic(() => import("./ripple-scene"), { ssr: false });
let currentRipple: string | null = null;
const subscribers = new Set<() => void>();
function activateRipple(id: string | null) {
  currentRipple = id;
  subscribers.forEach((update) => update());
}

type RipplePhotoProps = {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
};

/** Fill a parent with a defined height/aspect-ratio; the Next image always remains underneath. */
export function RipplePhoto({
  src,
  alt,
  sizes = "(max-width: 767px) 100vw, 50vw",
  className,
}: RipplePhotoProps) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0.5, y: 0.5 });
  const { enabled } = useVisualCapability();
  const visible = useElementActive(ref);
  const [hovered, setHovered] = useState(false);
  const [ready, setReady] = useState(false);
  const markReady = useCallback(() => setReady(true), []);
  useEffect(() => {
    const update = () => {
      setHovered(currentRipple === id);
      setReady(false);
    };
    subscribers.add(update);
    return () => {
      subscribers.delete(update);
      if (currentRipple === id) activateRipple(null);
    };
  }, [id]);
  useEffect(() => {
    if ((!enabled || !visible) && currentRipple === id) activateRipple(null);
  }, [enabled, visible, id]);
  const move = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    pointer.current.x = (event.clientX - bounds.left) / bounds.width;
    pointer.current.y = 1 - (event.clientY - bounds.top) / bounds.height;
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "100%",
      }}
      onPointerEnter={(event) => {
        if (enabled) {
          move(event);
          activateRipple(id);
        }
      }}
      onPointerMove={move}
      onPointerLeave={() => {
        if (currentRipple === id) activateRipple(null);
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        style={{ objectFit: "cover" }}
      />
      {enabled && hovered && visible && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: ready ? 1 : 0,
            transition: "opacity 200ms ease",
          }}
        >
          <VisualBoundary>
            <RippleCanvas src={src} pointer={pointer} onReady={markReady} />
          </VisualBoundary>
        </div>
      )}
    </div>
  );
}
