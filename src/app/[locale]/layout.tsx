import type { Metadata } from "next";
import {
  Playfair_Display,
  Poppins,
  Dancing_Script,
  Lora,
} from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { copy } from "@/data/content";
import { SarabHeader } from "@/components/sarab-header";
import { DesignProvider } from "@/components/design-provider";
import { SarabMotion } from "@/components/sarab-motion";
import { DiningProvider } from "@/components/sarab-experience";
import { GuestProvider } from "@/components/guest-experience";
import { AppearanceProvider } from "@/components/appearance-provider";
import { WelcomeOffer } from "@/components/welcome-offer";
import { VisualJourney } from "@/components/visual-journey";
import { PastaFlight } from "@/components/pasta-flight";
import "../globals.css";
import "../refinements.css";
import "../heritage.css";
import "../journey.css";
import "../experience-polish.css";
import "../mobile-polish.css";
const display = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const sans = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm",
  display: "swap",
});
const script = Dancing_Script({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-script",
  display: "swap",
});
const heritageBody = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heritage-body",
  display: "swap",
});
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const it = locale !== "en";
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    ),
    title: it
      ? "Grappasonni dal 1908 | Un indirizzo, una storia. Roma."
      : "Grappasonni since 1908 | A Roman story.",
    description: it
      ? "Grappasonni dal 1908. Scopri il ristorante in Via Appia Nuova 858–860, Roma: menù, atmosfera e prenotazioni."
      : "Discover Grappasonni since 1908 at Via Appia Nuova 858–860, Rome. Menu, atmosphere and table reservations.",
    alternates: {
      canonical: it ? "/" : "/en",
      languages: { it: "/", en: "/en" },
    },
    openGraph: {
      type: "website",
      locale: it ? "it_IT" : "en_GB",
      siteName: "Grappasonni dal 1908",
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <html
      lang={locale}
      data-color-mode="dark"
      data-design-mode="heritage"
      data-hero="classic"
      data-gallery="ring"
      data-motion="on"
      className={`${display.variable} ${sans.variable} ${script.variable} ${heritageBody.variable}`}
    >
      <body>
        <NextIntlClientProvider>
          <AppearanceProvider>
            <DesignProvider>
              <a href="#main" className="skip-link">
                {copy[locale as Locale].skip}
              </a>
              <GuestProvider locale={locale}>
                <DiningProvider locale={locale}>
                  <div className="page-shell">
                    <SarabHeader locale={locale} />
                    {children}
                  </div>
                  <SarabMotion locale={locale} />
                  <VisualJourney />
                  <PastaFlight />
                  <WelcomeOffer locale={locale} />
                </DiningProvider>
              </GuestProvider>
            </DesignProvider>
          </AppearanceProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
