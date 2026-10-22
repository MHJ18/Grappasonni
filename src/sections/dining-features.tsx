"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenIcon,
  CalendarDotsIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  ForkKnifeIcon,
  BookmarkSimpleIcon,
} from "@phosphor-icons/react";
import { useDining } from "@/components/sarab-experience";
import { menu, categories } from "@/data/menu";
import { categoryPhotos, sarabCopy } from "@/data/sarab";
import type { Locale } from "@/i18n/routing";
import { useAppearance } from "@/components/appearance-provider";

export function SignatureFeature({ locale }: { locale: Locale }) {
  const dining = useDining();
  const { hero } = useAppearance();
  const [slide, setSlide] = useState(hero === "cinematic" ? 1 : 0);
  useEffect(() => setSlide(hero === "cinematic" ? 1 : 0), [hero]);
  const it = locale === "it";
  const slides = [
    {
      id: "amatriciana",
      eyebrow: "Rigatoni all’amatriciana",
      title: it ? "Roma, in un piatto." : "Rome, on a plate.",
      description: it
        ? "Un grande classico romano. Il prossimo assaggio comincia da qui."
        : "A Roman classic. Your next favourite starts right here.",
      image: "/images/rigatoni-feature.webp",
      alt: it
        ? "Rigatoni all’amatriciana su un piatto in ceramica, immagine illustrativa generata"
        : "Rigatoni all’amatriciana on a ceramic plate, generated illustrative image",
      note: it
        ? "Immagine creativa illustrativa"
        : "Creative illustrative image",
    },
    {
      id: "carbonara",
      eyebrow: "Rigatoni alla carbonara",
      title: it ? "Un classico, sempre." : "Always a classic.",
      description: it
        ? "La voglia di pasta parla romano. Scopri i primi del nostro menù."
        : "When in Rome, make it pasta. Discover the first courses on our menu.",
      image: "/images/hero-carbonara.webp",
      alt: sarabCopy[locale].menuAlt,
      note: sarabCopy[locale].photoNote,
    },
  ];
  const current = slides[slide];
  return (
    <section
      id="special"
      className={`signature-feature signature-slide-${slide}`}
      aria-labelledby="signature-title"
      aria-roledescription={it ? "carosello" : "carousel"}
    >
      <div className="signature-colour" aria-hidden>
        <svg
          className="signature-melt"
          viewBox="0 0 1200 125"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M0 0H1200V30C1190 80 1170 93 1153 58C1130 22 1105 17 1080 31C1025 70 1002 84 950 50C918 30 883 22 861 46C849 59 860 112 838 117C803 126 819 61 791 50C762 34 734 31 718 50C706 62 711 100 686 104C654 107 666 57 639 36C614 16 591 48 575 62C553 80 538 47 519 40C484 28 474 57 478 84C482 117 454 127 439 105C425 80 452 35 424 27C402 19 394 58 383 58C367 58 359 29 338 32C308 38 323 104 302 110C271 118 288 57 263 44C242 31 222 46 213 56C203 69 211 104 191 107C168 110 175 82 177 60C183 16 130 13 115 28C80 44 25 37 0 40Z"
          />
        </svg>
      </div>
      <div className="container signature-layout">
        <div className="signature-copy" aria-live="polite" aria-atomic="true">
          <p className="signature-eyebrow">{current.eyebrow}</p>
          <h2 id="signature-title">{current.title}</h2>
          <p className="signature-description">{current.description}</p>
          <button
            className="signature-link"
            onClick={() => dining.openDish(current.id)}
          >
            {it ? "Lasciati tentare" : "Give in to temptation"}
            <ArrowRightIcon size={29} />
          </button>
          <div className="signature-controls">
            <button
              onClick={() =>
                setSlide((value) => (value - 1 + slides.length) % slides.length)
              }
              aria-label={it ? "Piatto precedente" : "Previous dish"}
            >
              <ArrowLeftIcon size={21} />
            </button>
            <span
              aria-label={
                it
                  ? `Piatto ${slide + 1} di ${slides.length}`
                  : `Dish ${slide + 1} of ${slides.length}`
              }
            >
              0{slide + 1}
              <span> / 0{slides.length}</span>
            </span>
            <button
              onClick={() => setSlide((value) => (value + 1) % slides.length)}
              aria-label={it ? "Piatto successivo" : "Next dish"}
            >
              <ArrowRightIcon size={21} />
            </button>
          </div>
        </div>
        <div className="signature-motion-scene">
          <figure className="signature-visual" key={current.id}>
            <Image
              className={
                slide === 0 ? "signature-cutout" : "signature-round-photo"
              }
              src={current.image}
              alt={current.alt}
              width={1000}
              height={1000}
              sizes="(max-width:767px) 85vw, 46vw"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}

export function DiningCompanion({ locale }: { locale: Locale }) {
  const it = locale === "it";
  const d = useDining();
  const c = sarabCopy[locale];
  const highlights = [
    {
      icon: BookOpenIcon,
      title: it ? "Esplora il menù" : "Explore the menu",
      detail: it
        ? "Trova il tuo prossimo piatto"
        : "Find your next favourite dish",
      action: () => {
        d.setCategory("all");
        d.setQuery("");
      },
      href: "#menu",
    },
    {
      icon: HeartIcon,
      title: it ? "Salva i preferiti" : "Save your favourites",
      detail: it ? "Una selezione tutta tua" : "Make a selection of your own",
      href: "#companion-phones",
    },
    {
      icon: CalendarDotsIcon,
      title: it ? "Ritroviamoci a tavola" : "Join us at the table",
      detail: it ? "Invia la tua richiesta" : "Send your reservation request",
      href: "#reservation",
    },
  ];
  const picks = menu.filter((item) => d.favorites.includes(item.id));
  const preview = ["amatriciana", "burrata", "tiramisu"].map((id) =>
    menu.find((item) => item.id === id)!,
  );
  return (
    <section
      id="dining-companion"
      className="dining-companion"
      aria-labelledby="companion-title"
    >
      <div className="container">
        <div className="dining-benefits">
          {highlights.map(({ icon: Icon, title, detail, action, href }) => {
            const content = (
              <>
                <span className="dining-benefit-icon">
                  <Icon size={48} weight="duotone" />
                </span>
                <span>
                  <strong>{title}</strong>
                  <small>{detail}</small>
                </span>
              </>
            );
            return href ? (
              <a href={href} key={title} onClick={action}>
                {content}
              </a>
            ) : (
              <button key={title} onClick={action}>
                {content}
              </button>
            );
          })}
        </div>
        <div className="companion-layout">
          <div
            className="companion-phones"
            id="companion-phones"
            aria-label={
              it ? "Anteprima interattiva del menù" : "Interactive menu preview"
            }
          >
            <div className="companion-phone phone-back" aria-hidden="true">
              <div className="phone-speaker" aria-hidden />
              <span className="phone-wordmark">Grappasonni</span>
              <div className="phone-saved-heading">
                <HeartIcon size={25} weight="duotone" />
                <h3>{it ? "I tuoi preferiti" : "Your favourites"}</h3>
              </div>
              <p>
                {it
                  ? "Il piacere di scegliere, prima di arrivare."
                  : "The pleasure of choosing, before you arrive."}
              </p>
              {(picks.length ? picks.slice(0, 2) : preview.slice(0, 2)).map(
                (item) => (
                  <div className="phone-saved-dish" key={item.id}>
                    <Image
                      src={categoryPhotos[item.category]}
                      alt=""
                      width={200}
                      height={100}
                    />
                    <span>{item.name[locale]}</span>
                  </div>
                ),
              )}
              {!picks.length && (
                <small className="phone-hint">
                  {it
                    ? "Qualche idea per cominciare"
                    : "A little inspiration to start"}
                </small>
              )}
            </div>
            <div className="companion-phone phone-front">
              <div className="phone-speaker" aria-hidden />
              <span className="phone-wordmark">
                Grappasonni <small>DAL 1908</small>
              </span>
              <h3>{it ? "Oggi, cosa ti va?" : "What takes your fancy?"}</h3>
              <button className="phone-search" onClick={d.openSearch}>
                <MagnifyingGlassIcon size={16} />
                {c.search}
              </button>
              <div className="phone-categories">
                {categories.slice(0, 3).map((cat) => (
                  <a
                    key={cat.id}
                    href="#menu"
                    onClick={() => {
                      d.setCategory(cat.id);
                      d.setQuery("");
                    }}
                  >
                    <Image
                      src={categoryPhotos[cat.id]}
                      alt=""
                      width={47}
                      height={47}
                    />
                    <span>{cat[locale]}</span>
                  </a>
                ))}
              </div>
              <p className="phone-section-title">
                {it ? "Un assaggio del menù" : "A taste of the menu"}
              </p>
              {preview.map((item) => (
                <div className="phone-menu-item" key={item.id}>
                  <button onClick={() => d.openDish(item.id)}>
                    <Image
                      src={categoryPhotos[item.category]}
                      alt=""
                      width={52}
                      height={52}
                    />
                    <span>
                      {item.name[locale]}
                      <small>
                        {new Intl.NumberFormat(locale, {
                          style: "currency",
                          currency: "EUR",
                        }).format(item.price ?? 0)}{" "}
                        *
                      </small>
                    </span>
                  </button>
                  <button
                    className="phone-heart"
                    aria-label={`${d.favorites.includes(item.id) ? c.unfavorite : c.favorite}: ${item.name[locale]}`}
                    aria-pressed={d.favorites.includes(item.id)}
                    onClick={() => d.toggleFavorite(item.id)}
                  >
                    <HeartIcon
                      size={17}
                      weight={
                        d.favorites.includes(item.id) ? "fill" : "regular"
                      }
                    />
                  </button>
                </div>
              ))}
              <a href="#reservation" className="phone-book">
                <CalendarDotsIcon size={15} />
                {c.book}
              </a>
            </div>
          </div>
          <div className="companion-copy">
            <span className="companion-kicker">
              <ForkKnifeIcon size={20} />
              {it
                ? "Il prossimo assaggio è qui"
                : "Your next favourite is here"}
            </span>
            <h2 id="companion-title">
              {it ? "La tua prossima cena," : "Your next dinner,"}
              <br />
              <em>{it ? "a portata di mano." : "at your fingertips."}</em>
            </h2>
            <p>
              {it
                ? "Sfoglia il menù, salva i piatti che ti ispirano e organizza la tua visita. Anche dal telefono, direttamente qui."
                : "Explore the menu, save the dishes that catch your eye and plan your visit. On your phone, right here."}
            </p>
            <div className="companion-actions">
              <button onClick={d.openSearch}>
                <BookOpenIcon size={21} />
                {it ? "Scopri il menù" : "Discover the menu"}
              </button>
              <a href="#reservation">
                <CalendarDotsIcon size={21} />
                {c.book}
              </a>
            </div>
            <p className="companion-footnote">
              <BookmarkSimpleIcon size={16} />
              {it
                ? "I tuoi preferiti restano salvati su questo dispositivo."
                : "Your favourites stay saved on this device."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
import "./dining-features.css";
