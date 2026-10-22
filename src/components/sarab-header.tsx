"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ForkKnifeIcon,
  MagnifyingGlassIcon,
  ListIcon,
  XIcon,
  CalendarDotsIcon,
  CalendarCheckIcon,
  BasketIcon,
} from "@phosphor-icons/react";
import { sarabCopy, navTargets } from "@/data/sarab";
import { useDining } from "./sarab-experience";
import { useGuest } from "./guest-experience";
import { ProfilePanel } from "./profile-panel";
import type { Locale } from "@/i18n/routing";
export function SarabHeader({ locale }: { locale: Locale }) {
  const c = sarabCopy[locale];
  const dining = useDining();
  const guest = useGuest();
  const [open, setOpen] = useState(false);
  const count = Object.values(dining.selection).reduce((sum, n) => sum + n, 0);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);
  const bookingsLabel = locale === "it" ? "Le mie prenotazioni" : "My bookings";
  const bookingsButton = (
    <button
      className="sarab-icon-btn nav-bookings"
      onClick={() => {
        guest.openBookings();
        setOpen(false);
      }}
      aria-label={bookingsLabel}
    >
      <CalendarCheckIcon size={21} />
      {guest.bookings.length > 0 && <span>{guest.bookings.length}</span>}
    </button>
  );
  return (
    <header id="nav" className="navbar navbar-expand-xl floating-nav">
      <div className="container">
        <Link className="navbar-brand" href={locale === "it" ? "/" : "/en"}>
          <div className="blogo">
            <div className="bico">
              <ForkKnifeIcon size={21} weight="fill" />
            </div>
            <div>
              <div className="bname">
                Grappa<span>sonni</span>
              </div>
              <div className="bsub">{c.brandSub}</div>
            </div>
          </div>
        </Link>
        <div className="d-flex align-items-center d-xl-none gap-1">
          <ProfilePanel locale={locale} />
          <button
            className="sarab-icon-btn"
            onClick={dining.openSearch}
            aria-label={c.search}
          >
            <MagnifyingGlassIcon size={22} />
          </button>
          <button
            className="navbar-toggler border-0"
            onClick={() => setOpen(!open)}
            aria-controls="navmenu"
            aria-expanded={open}
            aria-label={open ? c.closeNav : c.openNav}
          >
            {open ? <XIcon size={24} /> : <ListIcon size={24} />}
          </button>
        </div>
        <div
          className={`collapse navbar-collapse${open ? " show" : ""}`}
          id="navmenu"
        >
          <nav
            className="navbar-nav mx-auto"
            aria-label={
              locale === "it" ? "Navigazione principale" : "Main navigation"
            }
          >
            {c.nav.map((label, index) => (
              <a
                className="nav-link"
                href={navTargets[index]}
                key={label}
                onClick={() => setOpen(false)}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="d-flex align-items-center gap-1">
            <div className="sarab-language">
              <Link
                href="/"
                aria-current={locale === "it" ? "page" : undefined}
              >
                IT
              </Link>
              <span>/</span>
              <Link
                href="/en"
                aria-current={locale === "en" ? "page" : undefined}
              >
                EN
              </Link>
            </div>
            <button
              id="navSearchBtn"
              aria-label={c.search}
              onClick={dining.openSearch}
            >
              <MagnifyingGlassIcon size={20} />
            </button>
            <ProfilePanel locale={locale} />
            {count > 0 && (
              <button
                className="sarab-icon-btn sarab-selection-nav"
                aria-label={`${c.selection}: ${count}`}
                onClick={dining.openSelection}
              >
                <BasketIcon size={20} />
                <span>{count}</span>
              </button>
            )}
            <a
              href="#reservation"
              className="nav-link nav-cta"
              onClick={() => setOpen(false)}
            >
              <CalendarDotsIcon size={17} />
              {locale === "it" ? "Prenota" : "Book a table"}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
