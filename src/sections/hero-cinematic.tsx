import Image from "next/image";
import {
  ArrowRightIcon,
  CalendarDotsIcon,
} from "@phosphor-icons/react/dist/ssr";
import { sarabCopy } from "@/data/sarab";
import type { Locale } from "@/i18n/routing";
import { FoodSteam } from "@/components/food-steam";
export function CinematicHero({ locale }: { locale: Locale }) {
  const c = sarabCopy[locale];
  const it = locale === "it";
  return (
    <section id="hero" className="nocturne-hero" aria-labelledby="hero-title">
      <div className="hero-photo">
        <Image
          src="/images/hero-carbonara.webp"
          alt={
            it
              ? "Rigatoni alla carbonara, immagine editoriale della cucina romana"
              : "Rigatoni carbonara, editorial Roman food imagery"
          }
          fill
          loading="eager"
          fetchPriority="high"
          sizes="(max-width:767px) 100vw, 78vw"
        />
      </div>
      <div className="hero-ambient" aria-hidden />
      <span className="hero-year" aria-hidden="true">
        1908
      </span>
      <div className="hero-heritage-artifacts" aria-hidden="true">
        <i className="hero-archive-orbit" />
        <i className="hero-archive-line" />
      </div>
      <FoodSteam className="cinematic-steam" />
      <div className="container nocturne-hero-content">
        <p className="hero-origin">
          <span aria-hidden />
          Grappasonni · Roma · Dal 1908
        </p>
        <h1 id="hero-title" className="hero-headline">
          <span className="hero-line">{it ? "Roma ha" : "Rome has"}</span>
          <span className="hero-line hero-line-accent">
            {it ? "un altro sapore." : "a flavour of its own."}
          </span>
        </h1>
        <p className="hero-description">
          {it
            ? "La cucina romana, il piacere di stare insieme. Il tuo prossimo tavolo è qui."
            : "Roman cooking, good company. Your next favourite table is right here."}
        </p>
        <div className="hero-actions">
          <a href="#menu" className="hero-menu-link">
            {c.explore}
            <ArrowRightIcon size={21} />
          </a>
          <a href="#reservation" className="hero-book-link">
            <CalendarDotsIcon size={19} />
            {c.book}
          </a>
        </div>
        <a href="#gallery" className="hero-location">
          Via Appia Nuova 858–860 <ArrowRightIcon size={15} />
        </a>
      </div>
    </section>
  );
}
