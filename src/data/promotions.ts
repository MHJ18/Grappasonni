import type { MenuItem } from "./menu";
export const welcomePromotion = {
  id: "welcome-1908",
  percent: 15,
  dishIds: ["amatriciana", "carbonara", "ravioli-ricotta", "tiramisu"],
} as const;
export function menuPrice(
  item: Pick<MenuItem, "id" | "price">,
  enabled: boolean,
) {
  const discounted =
    enabled &&
    item.price !== null &&
    (welcomePromotion.dishIds as readonly string[]).includes(item.id);
  return {
    original: item.price,
    current: discounted
      ? Math.round(item.price! * (100 - welcomePromotion.percent)) / 100
      : item.price,
    discount: discounted ? welcomePromotion.percent : 0,
  };
}
