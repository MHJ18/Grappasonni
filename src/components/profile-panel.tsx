"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import {
  UserCircleIcon,
  XIcon,
  SunIcon,
  MoonIcon,
  CalendarCheckIcon,
  ArrowRightIcon,
  GiftIcon,
  CheckIcon,
  CookieIcon,
  LockSimpleIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import { useAppearance } from "./appearance-provider";
import { useGuest } from "./guest-experience";
import type { Locale } from "@/i18n/routing";
export function ProfilePanel({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const p = useAppearance();
  const guest = useGuest();
  const it = locale === "it";
  return (
    <>
      <button
        className="sarab-icon-btn nav-profile"
        aria-label={it ? "Profilo e preferenze" : "Profile and preferences"}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <UserCircleIcon size={26} weight="duotone" />
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="xs"
        aria-labelledby="profile-title"
        slotProps={{ paper: { className: "profile-panel" } }}
      >
        <DialogTitle id="profile-heading">
          <UserCircleIcon size={30} weight="duotone" />
          <span id="profile-title">{it ? "Il tuo spazio" : "Your space"}</span>
          <IconButton
            aria-label={it ? "Chiudi" : "Close"}
            onClick={() => setOpen(false)}
            sx={{ position: "absolute", top: 12, right: 12, color: "inherit" }}
          >
            <XIcon size={21} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <div className="profile-guest">
            <span>G</span>
            <div>
              <strong>{it ? "Benvenuto, ospite" : "Welcome, guest"}</strong>
              <small>
                {it
                  ? "La tua esperienza, a modo tuo."
                  : "Make yourself at home."}
              </small>
            </div>
          </div>
          <div className="profile-option">
            <h3>{it ? "Aspetto" : "Appearance"}</h3>
            <div
              className="preference-segment"
              role="group"
              aria-label={it ? "Aspetto" : "Appearance"}
            >
              <button
                aria-pressed={p.colorMode === "dark"}
                onClick={() => p.setAppearance({ colorMode: "dark" })}
              >
                <MoonIcon size={17} />
                {it ? "Scuro" : "Dark"}
              </button>
              <button
                aria-pressed={p.colorMode === "light"}
                onClick={() => p.setAppearance({ colorMode: "light" })}
              >
                <SunIcon size={17} />
                {it ? "Chiaro" : "Light"}
              </button>
            </div>
          </div>
          <div className="profile-option">
            <h3>{it ? "Atmosfera" : "Style"}</h3>
            <div
              className="preference-segment"
              role="group"
              aria-label={it ? "Atmosfera" : "Style"}
            >
              <button
                aria-pressed={p.designMode === "heritage"}
                onClick={() => p.setAppearance({ designMode: "heritage" })}
              >
                Heritage 1908
              </button>
              <button
                aria-pressed={p.designMode === "contemporary"}
                onClick={() => p.setAppearance({ designMode: "contemporary" })}
              >
                {it ? "Contemporaneo" : "Contemporary"}
              </button>
            </div>
          </div>
          <div className="profile-option">
            <h3>{it ? "La prima impressione" : "Your first impression"}</h3>
            <div
              className="hero-choices"
              role="group"
              aria-label={it ? "Stile della copertina" : "Hero style"}
            >
              <button
                className="hero-choice-classic"
                aria-pressed={p.hero === "classic"}
                onClick={() => p.setAppearance({ hero: "classic" })}
              >
                <span className="hero-choice-art">
                  <i />
                  <b />
                </span>
                <strong>{it ? "Classico" : "Classic"}</strong>
                <small>
                  {it ? "Il design originale" : "The original layout"}
                </small>
                {p.hero === "classic" && <CheckIcon size={16} />}
              </button>
              <button
                className="hero-choice-cinematic"
                aria-pressed={p.hero === "cinematic"}
                onClick={() => p.setAppearance({ hero: "cinematic" })}
              >
                <span className="hero-choice-art">
                  <i />
                  <b />
                </span>
                <strong>{it ? "Cinematico" : "Cinematic"}</strong>
                <small>
                  {it ? "Una scena da assaporare" : "A scene to savour"}
                </small>
                {p.hero === "cinematic" && <CheckIcon size={16} />}
              </button>
            </div>
          </div>
          <div className="profile-option">
            <h3>{it ? "Galleria del ristorante" : "Restaurant gallery"}</h3>
            <div
              className="preference-segment"
              role="group"
              aria-label={it ? "Stile della galleria" : "Gallery style"}
            >
              <button
                aria-pressed={p.gallery === "ring"}
                onClick={() => p.setAppearance({ gallery: "ring" })}
              >
                Momentum Ring
              </button>
              <button
                aria-pressed={p.gallery === "elastic"}
                onClick={() => p.setAppearance({ gallery: "elastic" })}
              >
                Elastic Reel
              </button>
            </div>
          </div>
          <label className="preference-toggle">
            <span>
              <SparkleIcon size={18} />
              {it ? "Animazioni" : "Animations"}
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={p.motion}
              onChange={(e) => p.setAppearance({ motion: e.target.checked })}
            />
          </label>
          <label className="preference-toggle">
            <span>
              <GiftIcon size={18} />
              {it ? "Offerte di benvenuto" : "Welcome offers"}
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={p.offers}
              onChange={(e) => p.setAppearance({ offers: e.target.checked })}
            />
          </label>
          <div className="profile-shortcuts">
            <button
              onClick={() => {
                setOpen(false);
                guest.openBookings();
              }}
            >
              <CalendarCheckIcon size={19} />
              {it ? "Le mie prenotazioni" : "My bookings"}
              <ArrowRightIcon size={17} />
            </button>
            <button
              onClick={() => {
                setOpen(false);
                p.showWelcome();
              }}
            >
              <GiftIcon size={19} />
              {it ? "Il nostro benvenuto" : "Our welcome gift"}
              <ArrowRightIcon size={17} />
            </button>
            <button
              onClick={() => {
                setOpen(false);
                guest.showCookies();
              }}
            >
              <CookieIcon size={19} />
              {it ? "Preferenze cookie" : "Cookie settings"}
              <ArrowRightIcon size={17} />
            </button>
          </div>
          <div className="profile-login-future">
            <LockSimpleIcon size={16} />
            <span>
              {it
                ? "Accesso personale in arrivo. Le preferenze sono salvate su questo dispositivo."
                : "Account sign-in is coming later. Preferences are saved on this device."}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
