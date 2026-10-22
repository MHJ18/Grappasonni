"use client";
import { useState } from "react";
import Image from "next/image";
import { ArrowUpRightIcon, MapPinIcon } from "@phosphor-icons/react";
import { sectionCopy } from "@/data/sections";
import { SectionHeading } from "@/components/section-heading";
import type { Locale } from "@/i18n/routing";
export function Location({ locale }: { locale: Locale }) {
  const c = sectionCopy[locale];
  const [map, setMap] = useState(false);
  return (
    <section id="dove" className="section location-section">
      <SectionHeading number="07" title={c.locationTitle} />
      <div className="location-composition">
        <div className="location-copy">
          <h3>{c.locationHeadline}</h3>
          <address>
            {c.address}
            <br />
            {c.city}
          </address>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=Via+Appia+Nuova+858+Roma"
            className="text-link"
            target="_blank"
            rel="noreferrer"
          >
            {c.directions}
            <ArrowUpRightIcon size={19} />
          </a>
          <div className="location-details">
            <h4>{c.hoursLabel}</h4>
            <p>{c.hours}</p>
            <p>{c.practical}</p>
          </div>
        </div>
        <div className="location-map">
          {map ? (
            <iframe
              title={`${c.locationTitle} – Grappasonni`}
              src={`https://maps.google.com/maps?q=Via%20Appia%20Nuova%20858%20Roma&t=&z=15&ie=UTF8&iwloc=&output=embed&hl=${locale}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <>
              <Image
                src="/images/detail.webp"
                alt=""
                fill
                sizes="(max-width:767px) 100vw, 50vw"
              />
              <div className="map-prompt">
                <MapPinIcon size={38} weight="light" />
                <button className="button" onClick={() => setMap(true)}>
                  {c.mapLoad}
                  <ArrowUpRightIcon size={18} />
                </button>
                <p>{c.mapNote}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
