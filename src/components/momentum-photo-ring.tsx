"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
  type PanInfo,
} from "motion/react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowsOutIcon,
  ArrowsClockwiseIcon,
} from "@phosphor-icons/react";
type Photo = { src: string; alt: string; caption: string };
function RingPhoto({
  photo,
  index,
  step,
  rotation,
  speedBlur,
  active,
  select,
  open,
  dragged,
  locale,
}: {
  photo: Photo;
  index: number;
  step: number;
  rotation: MotionValue<number>;
  speedBlur: MotionValue<number>;
  active: number;
  select: (index: number) => void;
  open: (index: number) => void;
  dragged: () => boolean;
  locale: "it" | "en";
}) {
  const count = 360 / step;
  const offset = useTransform(rotation, (value) => {
    const n = index + value / step;
    return ((((n + count / 2) % count) + count) % count) - count / 2;
  });
  const opacity = useTransform(offset, (value) => {
    const distance = Math.abs(value);
    const rearFade = Math.min(1, Math.max(0, (count / 2 - distance) / 0.5));
    return Math.max(0.18, 1 - distance * 0.22) * rearFade;
  });
  const transform = useTransform(offset, (value) => {
    // A curved rail keeps the photographs upright while its sides recede.
    const distance = Math.abs(value);
    const horizontal = value * (1.08 - distance * 0.05);
    const depth = -(distance * 0.2 + distance * distance * 0.24);
    const yaw = Math.sign(value) * Math.min(distance * 24, 58);
    return `translate3d(calc(${horizontal.toFixed(5)} * var(--ring-width)), 0, calc(${depth.toFixed(5)} * var(--ring-width))) rotateY(${yaw.toFixed(3)}deg)`;
  });
  const filter = useTransform(() => {
    const distance = Math.abs(offset.get());
    const defocus = Math.min(5, distance * distance * 1.3);
    const brightness = Math.max(0.72, 1 - distance * 0.1);
    return `blur(${Math.min(8, defocus + speedBlur.get()).toFixed(2)}px) brightness(${brightness.toFixed(3)})`;
  });
  return (
    <motion.div
      className="momentum-ring-card"
      style={{
        transform,
        opacity,
      }}
    >
      <button
        className="gitem momentum-photo-button"
        type="button"
        tabIndex={active === index ? 0 : -1}
        aria-label={`${locale === "it" ? "Apri la fotografia" : "Open photo"}: ${photo.caption}`}
        onClick={() => {
          if (dragged()) return;
          if (active === index) open(index);
          else select(index);
        }}
        onFocus={() => select(index)}
      >
        <motion.span className="momentum-photo-media" style={{ filter }}>
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            loading="eager"
            sizes="(max-width:639px) 80vw, 390px"
            draggable={false}
          />
        </motion.span>
        <span className="momentum-photo-open">
          <ArrowsOutIcon size={20} />
        </span>
      </button>
    </motion.div>
  );
}
/** Original project implementation inspired by a public interaction brief. */
export function MomentumPhotoRing({
  photos,
  onOpen,
  locale,
}: {
  photos: Photo[];
  onOpen: (index: number) => void;
  locale: "it" | "en";
}) {
  const rotation = useMotionValue(0);
  const velocity = useVelocity(rotation);
  const blurred = useSpring(
    useTransform(velocity, (value) => Math.min(4.5, Math.abs(value) / 150)),
    { stiffness: 140, damping: 25 },
  );
  const [active, setActive] = useState(0);
  const [moving, setMoving] = useState(false);
  const indexRef = useRef(0);
  const angleStart = useRef(0);
  const dragging = useRef(false);
  const animation = useRef<ReturnType<typeof animate> | null>(null);
  const reset = useRef<ReturnType<typeof setTimeout> | null>(null);
  const step = 360 / photos.length;
  const it = locale === "it";
  useEffect(
    () => () => {
      animation.current?.stop();
      if (reset.current) clearTimeout(reset.current);
    },
    [],
  );
  const settle = (index: number) => {
    animation.current?.stop();
    indexRef.current = index;
    setActive(((index % photos.length) + photos.length) % photos.length);
    setMoving(true);
    animation.current = animate(rotation, -index * step, {
      type: "spring",
      stiffness: 83,
      damping: 17,
      mass: 0.95,
      restDelta: 0.02,
      restSpeed: 0.1,
      onComplete: () => setMoving(false),
    });
  };
  const goTo = (index: number) => {
    let delta = (index - active + photos.length) % photos.length;
    if (delta > photos.length / 2) delta -= photos.length;
    if (delta) settle(indexRef.current + delta);
  };
  const onPanStart = () => {
    animation.current?.stop();
    angleStart.current = rotation.get();
    dragging.current = true;
    setMoving(true);
  };
  const onPan = (_: unknown, info: PanInfo) =>
    rotation.set(angleStart.current + info.offset.x * 0.24);
  const onPanEnd = (_: unknown, info: PanInfo) => {
    const target = rotation.get() + info.velocity.x * 0.1;
    settle(Math.round(-target / step));
    reset.current = setTimeout(() => {
      dragging.current = false;
    }, 100);
  };
  return (
    <div
      className={`momentum-ring${moving ? " is-spinning" : ""}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={
        it ? "Anello di immagini del ristorante" : "Restaurant photo ring"
      }
    >
      <motion.div
        className="momentum-ring-stage"
        tabIndex={0}
        onPanStart={onPanStart}
        onPan={onPan}
        onPanEnd={onPanEnd}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (["ArrowRight", "ArrowDown"].includes(event.key)) {
            event.preventDefault();
            settle(indexRef.current + 1);
          } else if (["ArrowLeft", "ArrowUp"].includes(event.key)) {
            event.preventDefault();
            settle(indexRef.current - 1);
          } else if (event.key === "Enter") {
            event.preventDefault();
            onOpen(active);
          }
        }}
      >
        <div className="momentum-ring-camera">
          <motion.div className="momentum-ring-rotor">
            {photos.map((photo, index) => (
              <RingPhoto
                key={photo.src}
                photo={photo}
                index={index}
                step={step}
                rotation={rotation}
                speedBlur={blurred}
                active={active}
                select={goTo}
                open={onOpen}
                dragged={() => dragging.current}
                locale={locale}
              />
            ))}
          </motion.div>
        </div>
        <span className="momentum-ring-aura" aria-hidden />
      </motion.div>
      <div className="momentum-ring-caption" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 7 }}
            animate={{ opacity: moving ? 0.45 : 1, y: 0 }}
            exit={{ opacity: 0, y: -7 }}
            transition={{ duration: 0.2 }}
          >
            <span>
              {String(active + 1).padStart(2, "0")} /{" "}
              {String(photos.length).padStart(2, "0")}
            </span>
            <h3>{photos[active].caption}</h3>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="momentum-ring-controls">
        <button
          type="button"
          aria-label={
            it ? "Foto precedente nell’anello" : "Previous ring photo"
          }
          onClick={() => settle(indexRef.current - 1)}
        >
          <ArrowLeftIcon size={20} />
        </button>
        <button
          type="button"
          className="momentum-spin-button"
          onClick={() => settle(indexRef.current + photos.length + 2)}
        >
          <ArrowsClockwiseIcon size={18} />
          {it ? "Fai un giro" : "Take a spin"}
        </button>
        <button
          type="button"
          aria-label={it ? "Foto successiva nell’anello" : "Next ring photo"}
          onClick={() => settle(indexRef.current + 1)}
        >
          <ArrowRightIcon size={20} />
        </button>
      </div>
    </div>
  );
}
