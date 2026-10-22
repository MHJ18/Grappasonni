"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import { XIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { gsap } from "gsap";
import { motionTokens } from "@/lib/motion";
import { menu, categories, menuCopy, type MenuCategory } from "@/data/menu";
import { restaurant } from "@/data/content";
import { SectionHeading } from "@/components/section-heading";
import type { Locale } from "@/i18n/routing";
// Underline/overflow interaction informed by SmoothUI's Animated Tabs on 21st.dev.
// Rebuilt with MUI semantics and this site's motion tokens; no raw component copied.
export function Menu({ locale }: { locale: Locale }) {
  const [category, setCategory] = useState<MenuCategory>("primi");
  const [scan, setScan] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const c = menuCopy[locale];
  useEffect(() => {
    if (
      !panel.current ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.matchMedia('(max-width:1023px)').matches
    )
      return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".menu-item",
        { opacity: 0, clipPath: "inset(0 0 100% 0)", y: 12 },
        {
          opacity: 1,
          clipPath: "inset(0 0 0% 0)",
          y: 0,
          duration: 0.55,
          ease: motionTokens.smooth,
          stagger: motionTokens.stagger,
        },
      );
      gsap.utils.toArray<HTMLElement>("[data-price]").forEach((el) => {
        const target = Number(el.dataset.price);
        const counter = { value: target * 0.8 };
        gsap.to(counter, {
          value: target,
          duration: 0.6,
          ease: motionTokens.smooth,
          onUpdate: () => {
            el.textContent = new Intl.NumberFormat(
              locale === "it" ? "it-IT" : "en-GB",
              { style: "currency", currency: "EUR" },
            ).format(counter.value);
          },
        });
      });
    }, panel);
    return () => ctx.revert();
  }, [category, locale]);
  return (
    <section id="menu" className="section menu-section">
      <SectionHeading number="02" title={c.title} />
      <div className="menu-top">
        <p className="menu-subtitle">{c.subtitle}</p>
        <button className="text-link" onClick={() => setScan(true)}>
          {c.scan}
          <ArrowUpRightIcon size={17} />
        </button>
      </div>
      <Tabs
        value={category}
        onChange={(_, v: MenuCategory) => setCategory(v)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        aria-label={c.title}
        className="menu-tabs"
      >
        {categories.map((cat) => (
          <Tab
            key={cat.id}
            label={cat[locale]}
            value={cat.id}
            id={`tab-${cat.id}`}
            aria-controls={`panel-${cat.id}`}
          />
        ))}
      </Tabs>
      <div className="menu-composition">
        <div
          className="menu-panel"
          ref={panel}
          role="tabpanel"
          id={`panel-${category}`}
          aria-labelledby={`tab-${category}`}
          tabIndex={0}
        >
          {category === "vini" ? (
            <div className="wine-placeholder">
              <h3>{c.wine}</h3>
              <p>{c.wineNote}</p>
            </div>
          ) : (
            menu
              .filter((item) => item.category === category)
              .map((item) => (
                <div className="menu-item" key={item.id}>
                  <div>
                    <h3>{item.name[locale]}</h3>
                    {item.description && <p>{item.description[locale]}</p>}
                  </div>
                  <span
                    className="menu-price"
                    data-price={item.price}
                    aria-label={`${c.priceLabel}: ${item.price} euro`}
                  >
                    {new Intl.NumberFormat(
                      locale === "it" ? "it-IT" : "en-GB",
                      { style: "currency", currency: "EUR" },
                    ).format(item.price ?? 0)}
                  </span>
                </div>
              ))
          )}
          <p className="verification-note menu-note">{c.note}</p>
          <p className="menu-allergen-note">{c.allergens}</p>
        </div>
        <figure className="menu-aside">
          <div className="menu-aside-photo" data-reveal>
            <Image
              src="/images/guest-dish-04.webp"
              alt={c.photo}
              fill
              sizes="(max-width:767px) 100vw, 30vw"
            />
          </div>
          <figcaption>
            <span className="small-label">{c.sideLabel}</span>
            <a
              className="nav-link"
              href={restaurant.menuSource}
              target="_blank"
              rel="noreferrer"
            >
              TheFork ↗
            </a>
          </figcaption>
        </figure>
      </div>
      <Dialog
        open={scan}
        onClose={() => setScan(false)}
        maxWidth="md"
        fullWidth
        aria-labelledby="menu-scan-title"
      >
        <DialogTitle
          id="menu-scan-title"
          sx={{ fontFamily: "var(--font-cormorant)", fontSize: 34, pr: 8 }}
        >
          {c.scanTitle}
          <IconButton
            aria-label={c.close}
            onClick={() => setScan(false)}
            sx={{ position: "absolute", right: 10, top: 12 }}
          >
            <XIcon size={23} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <p className="dialog-note">{c.scanCredit}</p>
          <Image
            src="/images/menu-02.webp"
            alt={
              locale === "it"
                ? "Fotografia del menù: antipasti, primi e secondi"
                : "Menu photograph: starters, pasta and main courses"
            }
            width={1127}
            height={1400}
            sizes="90vw"
            style={{ width: "100%", height: "auto", marginBottom: 20 }}
          />
          <Image
            src="/images/menu-01.webp"
            alt={
              locale === "it"
                ? "Fotografia del menù: contorni, dolci e bevande"
                : "Menu photograph: sides, desserts and drinks"
            }
            width={1127}
            height={1400}
            sizes="90vw"
            style={{ width: "100%", height: "auto" }}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}
