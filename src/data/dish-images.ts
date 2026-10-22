import type { MenuItem, MenuCategory } from "./menu";
const images: Record<string, string> = {
  alici: "alici",
  moscardini: "moscardini",
  polpo: "polpo",
  prosciutto: "prosciutto",
  tartare: "tartare",
  burrata: "burrata",
  "ravioli-pesce": "ravioli-pesce",
  "ravioli-ricotta": "ravioli-ricotta",
  trofietta: "trofietta",
  straccetti: "straccetti",
  salsicce: "salsicce",
  calamari: "calamari",
  spada: "spada",
  patate: "patate",
  cicoria: "cicoria",
  fritte: "fritte",
  sbriciolata: "sbriciolata",
  brulee: "brulee",
  tiramisu: "tiramisu",
  gelato: "gelato",
  frascati: "wine-white",
  "pinot-grigio": "wine-white",
  vermentino: "wine-white",
  chianti: "wine-red",
  montepulciano: "wine-red",
  prosecco: "wine-sparkling",
};
export function dishImage(item: Pick<MenuItem, "id" | "category">): string {
  if (item.id === "amatriciana") return "/images/rigatoni-feature.webp";
  if (item.id === "carbonara") return "/images/hero-carbonara.webp";
  return `/images/dishes/${images[item.id] || "alici"}.webp`;
}
export const foodCategoryImages: Record<MenuCategory, string> = {
  antipasti: "/images/dishes/burrata.webp",
  primi: "/images/rigatoni-feature.webp",
  secondi: "/images/dishes/straccetti.webp",
  contorni: "/images/dishes/patate.webp",
  dolci: "/images/dishes/tiramisu.webp",
  vini: "/images/dishes/wine-red.webp",
};
