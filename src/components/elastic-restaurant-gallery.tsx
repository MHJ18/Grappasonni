"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
  type PanInfo,
} from "motion/react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowsOutIcon,
  HandSwipeLeftIcon,
} from "@phosphor-icons/react";

type Photo = { src: string; alt: string; caption: string };
/** Project-owned elastic gallery. The licensed React Bits registry is optional. */
export function ElasticRestaurantGallery({
  photos,
  onOpen,
  locale,
}: {
  photos: Photo[];
  onOpen: (index: number) => void;
  locale: "it" | "en";
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const dragEnded = useRef(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const x = useMotionValue(0);
  const velocity = useVelocity(x);
  const skew = useSpring(
    useTransform(velocity, [-1100, 0, 1100], [2.2, 0, -2.2]),
    { stiffness: 120, damping: 23 },
  );
  const [bounds, setBounds] = useState({ step: 360, max: 0 });
  const [active, setActive] = useState(0);
  const it = locale === "it";
  useEffect(() => {
    const view = viewport.current,
      row = track.current;
    if (!view || !row) return;
    const measure = () => {
      const card = row.querySelector<HTMLElement>(".elastic-photo");
      if (!card) return;
      const step = card.offsetWidth + 22;
      const max = Math.max(0, row.scrollWidth - view.clientWidth);
      setBounds({ step, max });
      x.set(Math.max(-max, Math.min(0, x.get())));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(view);
    return () => {
      observer.disconnect();
      x.stop();
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, [photos.length, x]);
  const go = (index: number) => {
    const next = Math.max(0, Math.min(photos.length - 1, index));
    setActive(next);
    animate(x, -Math.min(bounds.max, next * bounds.step), {
      type: "spring",
      stiffness: 210,
      damping: 28,
      mass: 0.8,
    });
  };
  const endDrag = (_: unknown, info: PanInfo) => {
    const projected = -x.get() - info.velocity.x * 0.08;
    go(Math.round(projected / bounds.step));
    dragEnded.current = true;
    resetTimer.current = setTimeout(() => {
      dragEnded.current = false;
    }, 100);
  };
  return (
    <div
      className="elastic-gallery"
      role="region"
      aria-roledescription="carousel"
      aria-label={it ? "Immagini del ristorante" : "Restaurant images"}
    >
      <div
        className="elastic-gallery-viewport"
        ref={viewport}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === "ArrowRight") {
            event.preventDefault();
            go(active + 1);
          } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            go(active - 1);
          } else if (event.key === "Home") {
            event.preventDefault();
            go(0);
          } else if (event.key === "End") {
            event.preventDefault();
            go(photos.length - 1);
          }
        }}
      >
        <motion.div
          ref={track}
          className="elastic-gallery-track"
          style={{ x }}
          drag="x"
          dragConstraints={{ left: -bounds.max, right: 0 }}
          dragElastic={0.14}
          dragMomentum={false}
          onDragStart={() => {
            dragEnded.current = true;
          }}
          onDragEnd={endDrag}
        >
          {photos.map((photo, index) => (
            <motion.figure
              className="elastic-photo"
              key={photo.src}
              style={{ skewX: skew }}
            >
              <button
                type="button"
                className="gitem elastic-photo-button"
                onClick={() => {
                  if (!dragEnded.current) onOpen(index);
                }}
                onFocus={() => go(index)}
                aria-label={`${it ? "Apri la fotografia" : "Open photo"}: ${photo.caption}`}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  loading="eager"
                  sizes="(max-width:639px) 85vw, 440px"
                  draggable={false}
                />
                <span className="elastic-photo-open">
                  <ArrowsOutIcon size={20} />
                </span>
                <span className="elastic-photo-number">0{index + 1}</span>
              </button>
              <figcaption>
                <span>{photo.caption}</span>
                <span aria-hidden>↗</span>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
      <div className="elastic-gallery-controls">
        <span className="elastic-gallery-hint">
          <HandSwipeLeftIcon size={19} />
          {it ? "Trascina per esplorare" : "Drag to explore"}
        </span>
        <div>
          <button
            type="button"
            aria-label={it ? "Immagine precedente" : "Previous image"}
            disabled={active === 0}
            onClick={() => go(active - 1)}
          >
            <ArrowLeftIcon size={20} />
          </button>
          <span aria-live="polite">
            {String(active + 1).padStart(2, "0")}
            <i> / {String(photos.length).padStart(2, "0")}</i>
          </span>
          <button
            type="button"
            aria-label={it ? "Immagine successiva" : "Next image"}
            disabled={active === photos.length - 1}
            onClick={() => go(active + 1)}
          >
            <ArrowRightIcon size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
