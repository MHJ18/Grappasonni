"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRightIcon } from "@phosphor-icons/react";

type Photo = { src: string; alt: string; caption: string };

export function MobileGalleryLoop({
  photos,
  onOpen,
  locale,
  paused,
}: {
  photos: Photo[];
  onOpen: (index: number) => void;
  locale: "it" | "en";
  paused: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!root.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={root}
      className={`mobile-gallery-loop${paused || !visible ? " is-paused" : ""}`}
      role="region"
      aria-label={
        locale === "it" ? "Fotografie del ristorante" : "Restaurant photographs"
      }
    >
      <div className="mobile-gallery-loop-track">
        {[0, 1].map((copy) => (
          <div
            className="mobile-gallery-loop-set"
            key={copy}
            aria-hidden={copy === 1 ? true : undefined}
          >
            {photos.map((photo, index) => (
              <figure
                className="mobile-gallery-loop-card"
                key={`${copy}-${photo.src}`}
              >
                <button
                  type="button"
                  onClick={() => onOpen(index)}
                  aria-label={`${locale === "it" ? "Apri la fotografia" : "Open photo"}: ${photo.caption}`}
                  tabIndex={copy === 1 ? -1 : undefined}
                >
                  <Image
                    src={photo.src}
                    alt={copy === 1 ? "" : photo.alt}
                    fill
                    sizes="(max-width: 767px) 76vw, 1px"
                    draggable={false}
                  />
                  <span className="mobile-gallery-loop-open" aria-hidden="true">
                    <ArrowUpRightIcon size={20} />
                  </span>
                </button>
                <figcaption>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {photo.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
