"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import {
  XIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react";
import { galleryImages, sectionCopy } from "@/data/sections";
import { restaurant } from "@/data/content";
import { SectionHeading } from "@/components/section-heading";
import type { Locale } from "@/i18n/routing";
// Preserve source indices so captions, alt text and provenance stay paired.
const curated = [1, 0] as const;

export function Gallery({ locale }: { locale: Locale }) {
  const c = sectionCopy[locale];
  const [active, setActive] = useState<number | null>(null);
  useEffect(() => {
    if (active === null) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") e.preventDefault();
      if (e.key === "ArrowRight")
        setActive((n) => ((n ?? 0) + 1) % curated.length);
      if (e.key === "ArrowLeft")
        setActive((n) => ((n ?? 0) - 1 + curated.length) % curated.length);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [active]);
  return (
    <section className="section gallery-section" id="atmosfera">
      <SectionHeading number="04" title={c.galleryTitle} />
      <div className="gallery-lead">
        <h3>{c.galleryIntro}</h3>
        <p>{c.galleryBody}</p>
      </div>
      <div className="gallery-grid">
        {curated.map((sourceIndex, i) => (
          <figure
            className={`gallery-figure gallery-figure${i + 1} gallery-figure-${i + 1}`}
            key={galleryImages[sourceIndex]}
          >
            <button
              className="gallery-photo"
              onClick={() => setActive(i)}
              aria-label={`${c.openPhoto}: ${c.galleryCaptions[sourceIndex]}`}
              data-cursor="view"
              data-preview={galleryImages[sourceIndex]}
            >
              <Image
                src={galleryImages[sourceIndex]}
                alt={c.galleryAlts[sourceIndex]}
                fill
                sizes={
                  i === 0
                    ? "(max-width:767px) 100vw, 65vw"
                    : "(max-width:767px) 80vw, 32vw"
                }
              />
              <span className="gallery-open" aria-hidden>
                <ArrowUpRightIcon size={24} weight="light" />
              </span>
            </button>
            <figcaption>{c.galleryCaptions[sourceIndex]}</figcaption>
          </figure>
        ))}
      </div>
      <a
        href={restaurant.theFork}
        className="text-link"
        target="_blank"
        rel="noreferrer"
      >
        {c.photoSource}
        <ArrowUpRightIcon size={18} />
      </a>
      <Dialog
        open={active !== null}
        onClose={() => setActive(null)}
        maxWidth="lg"
        fullWidth
        aria-label={c.galleryTitle}
      >
        <DialogContent sx={{ p: { xs: 1, md: 3 } }}>
          {active !== null && (
            <>
              <div className="lightbox-toolbar">
                <span>{c.galleryCaptions[curated[active]]}</span>
                <IconButton
                  onClick={() => setActive(null)}
                  aria-label={c.close}
                >
                  <XIcon size={24} />
                </IconButton>
              </div>
              <div className="lightbox-photo">
                <Image
                  src={galleryImages[curated[active]]}
                  alt={c.galleryAlts[curated[active]]}
                  fill
                  sizes="95vw"
                  style={{ objectFit: "contain" }}
                />
              </div>
              <div className="lightbox-actions">
                <IconButton
                  onClick={() =>
                    setActive((active - 1 + curated.length) % curated.length)
                  }
                  aria-label={c.previous}
                >
                  <ArrowLeftIcon size={25} />
                </IconButton>
                <a href={restaurant.theFork} target="_blank" rel="noreferrer">
                  TheFork ↗
                </a>
                <IconButton
                  onClick={() => setActive((active + 1) % curated.length)}
                  aria-label={c.next}
                >
                  <ArrowRightIcon size={25} />
                </IconButton>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
