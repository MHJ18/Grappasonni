import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SarabHero } from "@/sections/sarab-hero";
import { SarabCategories, SarabMenu } from "@/sections/sarab-menu";
import { SignatureFeature } from "@/sections/dining-features";
import { KitchenExperience } from "@/sections/kitchen-experience";
import { SarabGallery } from "@/sections/sarab-gallery";
import { SarabReviews } from "@/sections/sarab-reviews";
import { Reservation } from "@/sections/reservation";
import { SarabNewsletter } from "@/sections/sarab-contact";
import { RestaurantContact } from "@/sections/restaurant-contact";
import { SarabFooter } from "@/components/sarab-footer";
import { restaurant } from "@/data/content";
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    foundingDate: "1908",
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.address,
      postalCode: restaurant.postalCode,
      addressLocality: restaurant.city,
      addressCountry: restaurant.country,
    },
    hasMenu: restaurant.menuSource,
    sameAs: [restaurant.theFork],
  };
  return (
    <>
      <main id="main">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
        <SarabHero locale={locale} />
        <SarabCategories locale={locale} />
        <SignatureFeature locale={locale} />
        <SarabMenu locale={locale} />
        <KitchenExperience locale={locale} />
        <SarabGallery locale={locale} />
        <SarabReviews locale={locale} />
        <Reservation locale={locale} />
        <RestaurantContact locale={locale} />
        <SarabNewsletter locale={locale} />
      </main>
      <SarabFooter locale={locale} />
    </>
  );
}
