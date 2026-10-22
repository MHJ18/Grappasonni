"use client";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAppearance } from "./appearance-provider";
gsap.registerPlugin(ScrollTrigger);

export function VisualJourney() {
  const { ready, hero, motion, colorMode, designMode } = useAppearance();
  useEffect(() => {
    if (!ready || !motion) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const anchor = document.querySelector<HTMLElement>(".hero-dish-anchor");
      const dish = document.querySelector<HTMLElement>(".hero-dish-object");
      const destination = document.querySelector<HTMLElement>(
        '[data-food-category="primi"] .food-category-image',
      );
      if (hero === "classic" && anchor && dish && destination) {
        const geometry = () => {
          const from = anchor.getBoundingClientRect();
          const to = destination.getBoundingClientRect();
          return {
            x: to.left + to.width / 2 - from.left - from.width / 2,
            y: to.top + to.height / 2 - from.top - from.height / 2,
            scale: to.width / from.width,
          };
        };
        gsap
          .timeline({
            scrollTrigger: {
              trigger: "#hero",
              start: "top top",
              endTrigger: "#category",
              end: "top 16%",
              scrub: 0.55,
              invalidateOnRefresh: true,
            },
          })
          .to(
            dish,
            {
              x: () => geometry().x * 0.48,
              y: () => geometry().y * (window.innerWidth < 768 ? 0.03 : 0.2),
              scale: () => 1 - (1 - geometry().scale) * 0.68,
              rotation: 6,
              duration: 0.5,
              ease: "none",
            },
            0,
          )
          .to(
            dish,
            {
              x: () => geometry().x,
              y: () => geometry().y,
              scale: () => geometry().scale,
              rotation: 0,
              duration: 0.5,
              ease: "none",
            },
            0.5,
          )
          .to(dish, { opacity: 0, duration: 0.07, ease: "none" }, 0.93)
          .to("#hero .fcard", { opacity: 0, duration: 0.17 }, 0);
      } else if (hero === "cinematic") {
        gsap.to(".hero-photo img", {
          yPercent: 12,
          scale: 1.07,
          ease: "none",
          scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      }
      gsap.utils
        .toArray<HTMLElement>(
          ".signature-motion-scene,.kitchen-food-art,.newsletter-dish-art",
        )
        .forEach((image, index) => {
          gsap.fromTo(
            image,
            { y: 32, rotate: index === 0 ? -3 : 3 },
            {
              y: -24,
              rotate: index === 0 ? 2 : -3,
              ease: "none",
              scrollTrigger: {
                trigger: image.closest("section"),
                start: "top 85%",
                end: "bottom 15%",
                scrub: 0.75,
              },
            },
          );
        });
      gsap.utils
        .toArray<HTMLElement>("#gallery .gitem")
        .forEach((image, index) =>
          gsap.from(image, {
            opacity: 0,
            y: 28,
            duration: 0.65,
            delay: (index % 3) * 0.07,
            ease: "power2.out",
            scrollTrigger: { trigger: image, start: "top 94%", once: true },
          }),
        );
      return () => {};
    });
    let cancelled = false;
    let refreshFrame = 0;
    const refresh = () => {
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => {
        if (!cancelled) ScrollTrigger.refresh();
      });
    };
    const categoryTrack = document.querySelector(".food-category-track");
    const observer = new MutationObserver(refresh);
    if (categoryTrack) {
      observer.observe(categoryTrack, { childList: true });
      categoryTrack.addEventListener("scrollend", refresh);
    }
    document.fonts.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
      media.revert();
      observer.disconnect();
      categoryTrack?.removeEventListener("scrollend", refresh);
      cancelAnimationFrame(refreshFrame);
    };
  }, [ready, hero, motion, colorMode, designMode]);
  return null;
}
