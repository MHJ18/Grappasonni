"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import {
  ArrowsOutIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  XIcon,
} from "@phosphor-icons/react";
import { getSarabGallery, sarabMediaCopy } from "@/data/sarab-media";
import { sectionCopy } from "@/data/sections";
import type { Locale } from "@/i18n/routing";
import { useAppearance } from "@/components/appearance-provider";
import { useReducedMotion } from "motion/react";
import { ElasticRestaurantGallery } from "@/components/elastic-restaurant-gallery";
import { MomentumPhotoRing } from "@/components/momentum-photo-ring";
import { MobileGalleryLoop } from "@/components/mobile-gallery-loop";

export function SarabGallery({ locale }: { locale: Locale }) {
  const appearance = useAppearance();
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const c = sectionCopy[locale];
  const m = sarabMediaCopy[locale];
  const images = getSarabGallery(locale);
  const [active, setActive] = useState<number | null>(null);
  const dialogTitle = useId();
  useEffect(() => {
    if (active === null) return;
    const key = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const step = event.key === "ArrowRight" ? 1 : -1;
        setActive((index) => ((index ?? 0) + step + 5) % 5);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [active]);
  const image = active === null ? null : images[active];

  return (
    <section id="gallery" className="sarab-gallery">
      <span id="atmosfera" className="sarab-anchor" aria-hidden="true" />
      <div className="container">
        <div className="text-center mb-5">
          <span className="slbl">{m.galleryLabel}</span>
          <h2 className="stitle">
            {m.galleryHeading[0]} <span>{m.galleryHeading[1]}</span>
          </h2>
          <div className="sline" />
          <p className="sdesc mx-auto" style={{ maxWidth: 580 }}>
            {m.galleryDescription}
          </p>
        </div>
        {mounted && appearance.motion && !reduced ? (
          <>
            <div className="mobile-gallery-only">
              <MobileGalleryLoop
                photos={images}
                onOpen={setActive}
                locale={locale}
                paused={active !== null}
              />
            </div>
            <div className="desktop-gallery-only">
              {appearance.gallery === "elastic" ? (
                <ElasticRestaurantGallery
                  photos={images}
                  onOpen={setActive}
                  locale={locale}
                />
              ) : (
                <MomentumPhotoRing
                  photos={images}
                  onOpen={setActive}
                  locale={locale}
                />
              )}
            </div>
          </>
        ) : (
          <div className="ggrid">
            {images.map((photo, index) => (
              <button
                key={photo.src}
                type="button"
                className="gitem"
                onClick={() => setActive(index)}
                aria-label={`${c.openPhoto}: ${photo.caption}`}
                style={{ border: 0, padding: 0, background: "transparent" }}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 991px) 50vw, 33vw"
                />
                <span className="gover">
                  <span>
                    <ArrowsOutIcon
                      size={18}
                      aria-hidden="true"
                      style={{ color: "var(--secondary)", marginRight: 5 }}
                    />{" "}
                    {photo.caption}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
        <p className="sarab-photo-credit">
          <a href={images[0].source} target="_blank" rel="noreferrer">
            {c.photoSource} <ArrowUpRightIcon size={15} aria-hidden="true" />
          </a>
        </p>
      </div>
      <Dialog
        open={active !== null}
        onClose={() => setActive(null)}
        fullWidth
        maxWidth="lg"
        aria-labelledby={dialogTitle}
        slotProps={{
          paper: {
            className: "sarab-gallery-dialog",
            sx: {
              background: "#1a1a1a",
              color: "#fff",
              border: 0,
              borderRadius: "18px",
            },
          },
        }}
      >
        <DialogContent sx={{ p: { xs: 1.5, md: 3 } }}>
          {image && (
            <>
              <div
                className="sarab-lightbox-toolbar"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  marginBottom: 12,
                }}
              >
                <div>
                  <h3 id={dialogTitle} style={{ color: "#fff", fontSize: 22 }}>
                    {image.caption}
                  </h3>
                  <span style={{ fontSize: 12, opacity: 0.7 }}>
                    {m.galleryCounter} {(active ?? 0) + 1} / {images.length}
                  </span>
                </div>
                <IconButton
                  onClick={() => setActive(null)}
                  aria-label={c.close}
                  sx={{ color: "#fff", minWidth: 44, minHeight: 44 }}
                >
                  <XIcon size={23} />
                </IconButton>
              </div>
              <div
                className="sarab-lightbox-image"
                style={{
                  position: "relative",
                  width: "100%",
                  height: "min(65vh, 650px)",
                }}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="95vw"
                  style={{ objectFit: "contain" }}
                />
              </div>
              <div
                className="sarab-lightbox-actions"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 14,
                }}
              >
                <IconButton
                  onClick={() =>
                    setActive(
                      ((active ?? 0) - 1 + images.length) % images.length,
                    )
                  }
                  aria-label={c.previous}
                  sx={{ color: "#fff", minWidth: 44, minHeight: 44 }}
                >
                  <ArrowLeftIcon size={23} />
                </IconButton>
                <a
                  href={image.source}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#fff", fontSize: 13 }}
                >
                  TheFork <ArrowUpRightIcon size={15} aria-hidden="true" />
                </a>
                <IconButton
                  onClick={() => setActive(((active ?? 0) + 1) % images.length)}
                  aria-label={c.next}
                  sx={{ color: "#fff", minWidth: 44, minHeight: 44 }}
                >
                  <ArrowRightIcon size={23} />
                </IconButton>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
