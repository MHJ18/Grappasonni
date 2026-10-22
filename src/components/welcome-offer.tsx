"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Dialog, IconButton } from "@mui/material";
import { XIcon, ArrowRightIcon, GiftIcon } from "@phosphor-icons/react";
import { useAppearance } from "./appearance-provider";
import { useDining } from "./sarab-experience";
import type { Locale } from "@/i18n/routing";
import { menu } from "@/data/menu";
import { dishImage } from "@/data/dish-images";
import { DishPrice } from "./dish-price";
export function WelcomeOffer({ locale }: { locale: Locale }) {
  const p = useAppearance();
  const dining = useDining();
  const it = locale === "it";
  const [open, setOpen] = useState(false);
  const requestSeen = useRef(0);
  useEffect(() => {
    if (!p.ready || !p.offers) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem("grappasonni-welcome-v1") === "seen";
    } catch {}
    const requested = p.welcomeVersion > requestSeen.current;
    if (seen && !requested) return;
    requestSeen.current = p.welcomeVersion;
    const timer = window.setTimeout(
      () => setOpen(true),
      p.welcomeVersion ? 0 : 650,
    );
    return () => window.clearTimeout(timer);
  }, [p.ready, p.offers, p.welcomeVersion]);
  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem("grappasonni-welcome-v1", "seen");
    } catch {}
  };
  return (
    <Dialog
      open={open && p.offers}
      onClose={close}
      fullWidth
      maxWidth="md"
      aria-labelledby="welcome-title"
      aria-describedby="welcome-description"
      slotProps={{
        paper: { className: "welcome-offer-dialog" },
        backdrop: { className: "welcome-backdrop" },
      }}
    >
      <IconButton
        className="welcome-close"
        aria-label={it ? "Chiudi il benvenuto" : "Close welcome"}
        onClick={close}
      >
        <XIcon size={22} />
      </IconButton>
      <div className="welcome-art">
        <Image
          src="/images/welcome-1908.webp"
          alt={
            it
              ? "Una tavola italiana a lume di candela, con ravioli e vino"
              : "A candlelit Italian table with ravioli and wine"
          }
          fill
          sizes="(max-width:639px) 90vw, 400px"
        />
        <span className="welcome-est">
          Grappasonni<span>ROMA · DAL 1908</span>
        </span>
      </div>
      <div className="welcome-letter">
        <span className="welcome-eyebrow">
          <GiftIcon size={17} />
          {it ? "Il nostro benvenuto" : "A welcome from us"}
        </span>
        <h2 id="welcome-title">
          {it ? "Un invito" : "An invitation"}
          <br />
          <em>{it ? "al buon gusto." : "to good taste."}</em>
        </h2>
        <p id="welcome-description">
          {it
            ? "Accomodati. La tua prossima storia a tavola comincia con un piccolo regalo."
            : "Make yourself at home. Your next story around the table begins with a little gift."}
        </p>
        <div className="welcome-stamp">
          <strong>
            15<span>%</span>
          </strong>
          <div>
            {it ? "di sconto" : "off"}
            <small>{it ? "su piatti selezionati" : "selected dishes"}</small>
          </div>
        </div>
        <div className="welcome-dish-preview">
          {["amatriciana", "tiramisu"].map((id) => {
            const dish = menu.find((item) => item.id === id)!;
            return (
              <div key={id}>
                <Image src={dishImage(dish)} alt="" width={48} height={48} />
                <span>
                  <strong>{dish.name[locale]}</strong>
                  <DishPrice item={dish} locale={locale} />
                </span>
              </div>
            );
          })}
        </div>
        <p className="welcome-terms">
          {it
            ? "Amatriciana, carbonara, ravioli ricotta e spinaci e tiramisù."
            : "Amatriciana, carbonara, ricotta and spinach ravioli, and tiramisù."}
        </p>
        <a
          href="#menu"
          className="welcome-action"
          onClick={() => {
            dining.setCategory("all");
            dining.setQuery("");
            close();
          }}
        >
          {it ? "Scopri i piatti in offerta" : "Explore the welcome menu"}
          <ArrowRightIcon size={19} />
        </a>
        <button className="welcome-later" onClick={close}>
          {it ? "Esplora prima il ristorante" : "Explore the restaurant first"}
        </button>
      </div>
    </Dialog>
  );
}
