"use client";
import { useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionTokens } from "@/lib/motion";
import { CaretUpIcon, BasketIcon } from "@phosphor-icons/react";
import { useDining } from "./sarab-experience";
import { sarabCopy } from "@/data/sarab";
import type { Locale } from "@/i18n/routing";
import { useAppearance } from "./appearance-provider";
gsap.registerPlugin(ScrollTrigger);
export function SarabMotion({ locale }: { locale: Locale }) {
  const appearance = useAppearance();
  const c = sarabCopy[locale];
  const d = useDining();
  const [show, setShow] = useState(false);
  const count = Object.values(d.selection).reduce((sum, n) => sum + n, 0);
  useEffect(() => {
    const hero = document.querySelector("#hero");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [appearance.hero]);
  useEffect(() => {
    if (
      !appearance.motion ||
      window.matchMedia("(prefers-reduced-motion:reduce)").matches
    )
      return;
    const ctx = gsap.matchMedia();
    ctx.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray<HTMLElement>("[data-sarab-reveal]").forEach((el) =>
        gsap.from(el, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: motionTokens.smooth,
          scrollTrigger: { trigger: el, start: "top 93%", once: true },
        }),
      );
    });
    return () => ctx.revert();
  }, [locale, appearance.motion]);
  return (
    <div>
      {count > 0 && (
        <button
          className="cartfl sarab-selection-floating"
          onClick={d.openSelection}
          aria-label={`${c.selection}: ${count}`}
        >
          <BasketIcon size={19} />
          <span>{c.selection}</span>
          <span className="ccount">{count}</span>
        </button>
      )}
      <button
        id="btt"
        className={show ? "show" : ""}
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior:
              !appearance.motion ||
              window.matchMedia("(prefers-reduced-motion:reduce)").matches
                ? "auto"
                : "smooth",
          })
        }
        aria-label={c.backTop}
      >
        <CaretUpIcon size={21} weight="bold" />
      </button>
    </div>
  );
}
