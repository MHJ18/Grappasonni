import Link from "next/link";
import { copy } from "@/data/content";
import type { Locale } from "@/i18n/routing";
import { MobileNav } from "./mobile-nav";
export function Header({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return (
    <header className="site-header">
      <Link
        href={locale === "it" ? "/" : "/en"}
        className="brand-mark"
      >
        grappasonni<span>DAL 1908 · ROMA</span>
      </Link>
      <nav
        className="desktop-nav"
        aria-label={
          locale === "it" ? "Navigazione principale" : "Main navigation"
        }
      >
        {c.nav.map((label, i) => (
          <a
            className="nav-link"
            key={label}
            href={["#storia", "#menu", "#atmosfera", "#dove"][i]}
          >
            {label}
          </a>
        ))}
      </nav>
      <div className="header-actions">
        <div className="locale-switch">
          <Link
            href="/"
            aria-current={locale === "it" ? "page" : undefined}
            lang="it"
          >
            IT
          </Link>
          <span>/</span>
          <Link
            href="/en"
            aria-current={locale === "en" ? "page" : undefined}
            lang="en"
          >
            EN
          </Link>
        </div>
        <a href="#prenota" className="button">
          {c.reserve}
          <span aria-hidden>↗</span>
        </a>
        <MobileNav locale={locale} />
      </div>
    </header>
  );
}
