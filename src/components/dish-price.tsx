"use client";
import { useAppearance } from "./appearance-provider";
import { menuPrice } from "@/data/promotions";
import type { MenuItem } from "@/data/menu";
import type { Locale } from "@/i18n/routing";
export function DishPrice({
  item,
  locale,
  tag = false,
}: {
  item: Pick<MenuItem, "id" | "price">;
  locale: Locale;
  tag?: boolean;
}) {
  const { offers } = useAppearance();
  const price = menuPrice(item, offers);
  const format = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
    }).format(value);
  if (price.current === null)
    return (
      <span className="wine-price-label">
        {locale === "it" ? "Calice / bottiglia" : "Glass / bottle"}
      </span>
    );
  return (
    <span className={`dish-price${price.discount ? " dish-price-offer" : ""}`}>
      {price.discount > 0 && (
        <del
          aria-label={locale === "it" ? "Prezzo originale" : "Original price"}
        >
          {format(price.original!)}
        </del>
      )}
      <span className="dish-price-current">{format(price.current)}</span>
      {tag && price.discount > 0 && (
        <span className="dish-offer-tag">−{price.discount}%</span>
      )}
    </span>
  );
}
