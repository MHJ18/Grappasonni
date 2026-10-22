import Image from "next/image";
import { copy, restaurant } from "@/data/content";
import type { Locale } from "@/i18n/routing";
export function Hero({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-stage">
        <Image
          className="hero-photo"
          src="/images/hero-interior.webp"
          alt={
            locale === "it"
              ? "La sala del ristorante Grappasonni a Roma"
              : "The dining room at Grappasonni in Rome"
          }
          fill
          loading="eager"
          fetchPriority="high"
          sizes="(max-width:767px) 100vw, 65vw"
        />
      </div>
      <div className="hero-editorial-copy">
        <div className="hero-eyebrow">
          <span className="hero-line" />
          <span>{c.since}</span>
        </div>
        <h1 id="hero-title" className="hero-title" data-hero-title>
          {c.hero[0]}
          <br />
          <em>{c.hero[1]}</em>
        </h1>
        <p className="hero-description">{c.heroDescription}</p>
        <div className="hero-buttons">
          <a href="#prenota" className="button hero-reserve">
            {c.reserve}
            <span aria-hidden>↗</span>
          </a>
          <a href="#menu" className="text-link">
            {c.nav[1]}
            <span aria-hidden>↗</span>
          </a>
        </div>
        <div className="hero-location">
          <span className="hero-location-number">858–860</span>
          <span>
            Via Appia Nuova
            <br />
            {c.city}
          </span>
        </div>
      </div>
      <div className="hero-food">
        <div className="hero-food-image">
          <Image
            src="/images/guest-dish-04.webp"
            fill
            alt={c.heroFoodAlt}
            sizes="(max-width:767px) 120px, 200px"
          />
        </div>
        <span>{c.heroFoodCaption}</span>
      </div>
      <div className="hero-year">
        1908<span>ROMA</span>
      </div>
      <a
        className="hero-photo-credit"
        href={restaurant.theFork}
        target="_blank"
        rel="noreferrer"
      >
        {c.photoSource} ↗
      </a>
    </section>
  );
}
