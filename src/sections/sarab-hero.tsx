"use client";
import { useAppearance } from "@/components/appearance-provider";
import { ClassicHero } from "./hero-classic";
import { CinematicHero } from "./hero-cinematic";
import type { Locale } from "@/i18n/routing";
export function SarabHero({ locale }: { locale: Locale }) {
  const { hero } = useAppearance();
  return hero === "classic" ? (
    <ClassicHero key="classic" locale={locale} />
  ) : (
    <CinematicHero key="cinematic" locale={locale} />
  );
}
