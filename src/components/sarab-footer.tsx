"use client";
import {
  FacebookLogoIcon,
  MapPinIcon,
  PhoneIcon,
  CaretRightIcon,
  BookOpenIcon,
} from "@phosphor-icons/react";
import { sarabCopy, facebookUrl, navTargets } from "@/data/sarab";
import { restaurant } from "@/data/content";
import { categories } from "@/data/menu";
import { useDining } from "./sarab-experience";
import { useGuest } from "./guest-experience";
import type { Locale } from "@/i18n/routing";
export function SarabFooter({ locale }: { locale: Locale }) {
  const c = sarabCopy[locale];
  const d = useDining();
  const guest = useGuest();
  return (
    <footer>
      <div className="container">
        <div className="row g-5">
          <div className="col-lg-4">
            <div className="fnm">
              Grappa<span>sonni</span>
            </div>
            <p className="fdesc">{c.footerDescription}</p>
            <div className="fsoc">
              <a
                href={facebookUrl}
                aria-label="Facebook"
                rel="noreferrer"
                target="_blank"
              >
                <FacebookLogoIcon size={20} weight="fill" />
              </a>
              <a
                href={restaurant.theFork}
                aria-label="TheFork"
                rel="noreferrer"
                target="_blank"
              >
                <BookOpenIcon size={19} weight="fill" />
              </a>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Grappasonni+Via+Appia+Nuova+858+Roma"
                aria-label="Google Maps"
                rel="noreferrer"
                target="_blank"
              >
                <MapPinIcon size={20} weight="fill" />
              </a>
              <a href={`tel:${restaurant.phone}`} aria-label={c.phone}>
                <PhoneIcon size={18} weight="fill" />
              </a>
            </div>
          </div>
          <div className="col-sm-6 col-lg-2">
            <div className="ftit">{c.quickLinks}</div>
            <ul className="flinks ps-0">
              {c.nav.map((label, i) => (
                <li key={label}>
                  <a href={navTargets[i]}>
                    <CaretRightIcon size={12} />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-sm-6 col-lg-2">
            <div className="ftit">{c.menuTitle.join(" ")}</div>
            <ul className="flinks ps-0">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <a
                    href="#menu"
                    onClick={() => {
                      d.setCategory(cat.id);
                      d.setQuery("");
                    }}
                  >
                    <CaretRightIcon size={12} />
                    {cat[locale]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-lg-4">
            <div className="ftit">{c.contact}</div>
            <div className="fci">
              <div className="fciico">
                <MapPinIcon size={18} weight="fill" />
              </div>
              <div className="fciinfo">
                <strong>{c.address}</strong>
                {restaurant.address}, 00178 Roma
              </div>
            </div>
            <div className="fci">
              <div className="fciico">
                <PhoneIcon size={18} weight="fill" />
              </div>
              <div className="fciinfo">
                <strong>{c.phone}</strong>
                <a href={`tel:${restaurant.phone}`}>
                  {restaurant.phoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="fbot">
        <div className="container">
          <p>
            © {new Date().getFullYear()} <span>Grappasonni dal 1908.</span>
          </p>
          <button
            className="footer-cookie-settings"
            onClick={guest.showCookies}
          >
            {locale === "it" ? "Preferenze cookie" : "Cookie settings"}
          </button>
        </div>
      </div>
    </footer>
  );
}
