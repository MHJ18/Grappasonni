"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { motionTokens } from "@/lib/motion";
import type { Locale } from "@/i18n/routing";
gsap.registerPlugin(ScrollTrigger);

export function SiteMotion({ locale }: { locale: Locale }) {
  const path = usePathname();
  const loader = useRef<HTMLDivElement>(null);
  const year = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches || window.matchMedia('(max-width:1023px)').matches) return;
    const root = document.querySelector(".page-shell");
    if (!root) return;
    let disposed = false;
    let lenis: Lenis | undefined;
    let split: { revert: () => void } | undefined;
    let tick: ((time: number) => void) | undefined;
    const cleanups: (() => void)[] = [];
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      if (
        loader.current &&
        year.current &&
        !sessionStorage.getItem("grappasonni-visited")
      ) {
        sessionStorage.setItem("grappasonni-visited", "1");
        gsap.set(loader.current, { autoAlpha: 1, yPercent: 0 });
        const counter = { year: 1908 };
        gsap
          .timeline()
          .to(counter, {
            year: new Date().getFullYear(),
            duration: 1.05,
            ease: motionTokens.snap,
            onUpdate: () => {
              if (year.current)
                year.current.textContent = String(Math.round(counter.year));
            },
          })
          .to(loader.current, {
            yPercent: -100,
            duration: 0.7,
            ease: motionTokens.smooth,
          })
          .set(loader.current, { autoAlpha: 0 });
      }
      mm.add("(min-width:1024px)", () => {
        lenis = new Lenis({
          duration: 1.1,
          anchors: true,
          easing: gsap.parseEase(motionTokens.smooth),
          prevent: (node) => Boolean(node.closest('[role="dialog"]')),
        });
        lenis.on("scroll", ScrollTrigger.update);
        tick = (time) => lenis?.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
        gsap.to(".hero-photo", {
          yPercent: 9,
          scale: 1.12,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero-stage",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
        return () => {
          if (tick) gsap.ticker.remove(tick);
          lenis?.destroy();
          lenis = undefined;
        };
      });
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) =>
        gsap.from(el, {
          clipPath: "inset(12% 0 12% 0)",
          y: 30,
          duration: 1,
          ease: motionTokens.smooth,
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        }),
      );
      const strip = document.querySelector<HTMLElement>(".marquee-track");
      if (strip) {
        const proxy = { x: 0 };
        let velocity = 0;
        const loop = gsap.to(proxy, {
          x: 1,
          duration: 60,
          repeat: -1,
          ease: "none",
          onUpdate: () => {
            gsap.set(strip, { xPercent: -(proxy.x * 25) });
          },
        });
        const trigger = ScrollTrigger.create({
          trigger: ".marquee",
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            velocity = Math.min(Math.abs(self.getVelocity()) / 600, 3);
            gsap.to(loop, {
              timeScale: 1 + velocity,
              duration: 0.5,
              ease: motionTokens.smooth,
              overwrite: true,
            });
          },
          onLeave: () => loop.pause(),
          onEnter: () => loop.play(),
          onEnterBack: () => loop.play(),
          onLeaveBack: () => loop.pause(),
        });
        cleanups.push(() => {
          loop.kill();
          trigger.kill();
        });
      }
    }, root);
    document.fonts.ready.then(async () => {
      if (disposed) return;
      const { SplitText } = await import("gsap/SplitText");
      if (disposed) return;
      gsap.registerPlugin(SplitText);
      ctx.add(() => {
        split = SplitText.create("[data-hero-title]", {
          type: "chars",
          mask: "chars",
          aria: "auto",
          onSplit: (self) =>
            gsap.from(self.chars, {
              yPercent: 115,
              rotation: 3,
              duration: 1.1,
              stagger: motionTokens.stagger / 2,
              ease: motionTokens.smooth,
              delay: 0.15,
            }),
        });
        ScrollTrigger.refresh();
      });
    });
    if (window.matchMedia("(pointer:fine) and (min-width:1024px)").matches) {
      document.querySelectorAll<HTMLElement>(".button").forEach((button) => {
        let bounds: DOMRect;
        const enter = () => {
          bounds = button.getBoundingClientRect();
        };
        const magnetic = (event: PointerEvent) => {
          if (!bounds) return;
          gsap.to(button, {
            x: (event.clientX - bounds.left - bounds.width / 2) * 0.09,
            y: (event.clientY - bounds.top - bounds.height / 2) * 0.12,
            duration: 0.3,
            ease: motionTokens.smooth,
            overwrite: true,
          });
        };
        const reset = () =>
          gsap.to(button, {
            x: 0,
            y: 0,
            duration: 0.45,
            ease: motionTokens.smooth,
          });
        button.addEventListener("pointerenter", enter);
        button.addEventListener("pointermove", magnetic);
        button.addEventListener("pointerleave", reset);
        cleanups.push(() => {
          button.removeEventListener("pointerenter", enter);
          button.removeEventListener("pointermove", magnetic);
          button.removeEventListener("pointerleave", reset);
          gsap.killTweensOf(button);
          gsap.set(button, { clearProps: "transform" });
        });
      });
    }
    return () => {
      disposed = true;
      cleanups.forEach((fn) => fn());
      split?.revert();
      mm.revert();
      ctx.revert();
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
    };
  }, [path]);
  return (
    <>
      <div ref={loader} className="preloader" aria-hidden>
        <div>
          <span className="small-label">GRAPPASONNI · ROMA</span>
          <span className="preloader-year" ref={year}>
            1908
          </span>
          <span className="small-label">
            {locale === "it"
              ? "UNA STORIA DA RITROVARE"
              : "A STORY TO REDISCOVER"}
          </span>
        </div>
      </div>
    </>
  );
}
