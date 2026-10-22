export type MenuCategory =
  "antipasti" | "primi" | "secondi" | "contorni" | "dolci" | "vini";
export type MenuItem = {
  id: string;
  category: MenuCategory;
  name: { it: string; en: string };
  description?: { it: string; en: string };
  mainIngredients?: { it: string[]; en: string[] };
  ingredientBasis?: "menu" | "traditional";
  price: number | null;
  confirmed: boolean;
};
export const categories: { id: MenuCategory; it: string; en: string }[] = [
  { id: "antipasti", it: "Antipasti", en: "Starters" },
  { id: "primi", it: "Primi", en: "Pasta" },
  { id: "secondi", it: "Secondi", en: "Main courses" },
  { id: "contorni", it: "Contorni", en: "Sides" },
  { id: "dolci", it: "Dolci", en: "Desserts" },
  { id: "vini", it: "Vini", en: "Wine" },
];
// Transcribed from guest menu photos. Source/freshness: docs/menu-research.md.
// Do not set confirmed=true until approved by the restaurant. Prices are euros.
// Ingredient lists describe the main components, never a complete allergen list.
// "menu" uses only components named in the photographed menu; "traditional"
// describes a customary recipe, not a verified recipe from this kitchen.
export const menu: MenuItem[] = [
  {
    id: "alici",
    category: "antipasti",
    name: { it: "Alici fritte", en: "Fried anchovies" },
    description: {
      it: "Spinaci e maionese alla senape",
      en: "Spinach and mustard mayonnaise",
    },
    mainIngredients: {
      it: ["Alici", "Spinaci", "Maionese alla senape"],
      en: ["Anchovies", "Spinach", "Mustard mayonnaise"],
    },
    ingredientBasis: "menu",
    price: 12,
    confirmed: false,
  },
  {
    id: "moscardini",
    category: "antipasti",
    name: { it: "Moscardini fritti", en: "Fried baby octopus" },
    description: { it: "Maionese alla senape", en: "Mustard mayonnaise" },
    mainIngredients: {
      it: ["Moscardini", "Maionese alla senape"],
      en: ["Baby octopus", "Mustard mayonnaise"],
    },
    ingredientBasis: "menu",
    price: 13,
    confirmed: false,
  },
  {
    id: "polpo",
    category: "antipasti",
    name: { it: "Insalata di polpo e patate", en: "Octopus and potato salad" },
    mainIngredients: {
      it: ["Polpo", "Patate"],
      en: ["Octopus", "Potatoes"],
    },
    ingredientBasis: "menu",
    price: 11,
    confirmed: false,
  },
  {
    id: "prosciutto",
    category: "antipasti",
    name: {
      it: "Prosciutto crudo e bufala",
      en: "Prosciutto and buffalo mozzarella",
    },
    mainIngredients: {
      it: ["Prosciutto crudo", "Mozzarella di bufala"],
      en: ["Prosciutto", "Buffalo mozzarella"],
    },
    ingredientBasis: "menu",
    price: 12,
    confirmed: false,
  },
  {
    id: "tartare",
    category: "antipasti",
    name: { it: "Tartare di manzo", en: "Beef tartare" },
    description: {
      it: "Tarallo e olive taggiasche",
      en: "Tarallo and Taggiasca olives",
    },
    mainIngredients: {
      it: ["Manzo", "Tarallo", "Olive taggiasche"],
      en: ["Beef", "Tarallo", "Taggiasca olives"],
    },
    ingredientBasis: "menu",
    price: 15,
    confirmed: false,
  },
  {
    id: "burrata",
    category: "antipasti",
    name: {
      it: "Burrata di bufala con alici",
      en: "Buffalo burrata with anchovies",
    },
    mainIngredients: {
      it: ["Burrata di bufala", "Alici"],
      en: ["Buffalo burrata", "Anchovies"],
    },
    ingredientBasis: "menu",
    price: 12,
    confirmed: false,
  },
  {
    id: "amatriciana",
    category: "primi",
    name: { it: "Rigatone all’amatriciana", en: "Rigatone all’amatriciana" },
    mainIngredients: {
      it: ["Rigatoni", "Pomodoro", "Guanciale", "Pecorino"],
      en: ["Rigatoni", "Tomato", "Guanciale", "Pecorino"],
    },
    ingredientBasis: "traditional",
    price: 15,
    confirmed: false,
  },
  {
    id: "carbonara",
    category: "primi",
    name: { it: "Rigatone alla carbonara", en: "Rigatone alla carbonara" },
    mainIngredients: {
      it: ["Rigatoni", "Guanciale", "Uova", "Pecorino", "Pepe nero"],
      en: ["Rigatoni", "Guanciale", "Eggs", "Pecorino", "Black pepper"],
    },
    ingredientBasis: "traditional",
    price: 15,
    confirmed: false,
  },
  {
    id: "ravioli-pesce",
    category: "primi",
    name: {
      it: "Ravioli di cernia e spigola",
      en: "Grouper and sea bass ravioli",
    },
    description: { it: "Fatti a mano", en: "Handmade" },
    mainIngredients: {
      it: ["Ravioli fatti a mano", "Cernia", "Spigola"],
      en: ["Handmade ravioli", "Grouper", "Sea bass"],
    },
    ingredientBasis: "menu",
    price: 17,
    confirmed: false,
  },
  {
    id: "ravioli-ricotta",
    category: "primi",
    name: {
      it: "Ravioli ricotta e spinaci",
      en: "Ricotta and spinach ravioli",
    },
    description: { it: "Fatti a mano", en: "Handmade" },
    mainIngredients: {
      it: ["Ravioli fatti a mano", "Ricotta", "Spinaci"],
      en: ["Handmade ravioli", "Ricotta", "Spinach"],
    },
    ingredientBasis: "menu",
    price: 15,
    confirmed: false,
  },
  {
    id: "trofietta",
    category: "primi",
    name: {
      it: "Trofietta alla puttanesca di mare",
      en: "Seafood puttanesca trofietta",
    },
    mainIngredients: {
      it: ["Trofiette", "Condimento di mare alla puttanesca"],
      en: ["Trofiette", "Seafood puttanesca sauce"],
    },
    ingredientBasis: "menu",
    price: 16.5,
    confirmed: false,
  },
  {
    id: "straccetti",
    category: "secondi",
    name: { it: "Straccetti di manzo", en: "Beef straccetti" },
    description: {
      it: "Rucola, grana e pomodoro",
      en: "Rocket, grana cheese and tomato",
    },
    mainIngredients: {
      it: ["Manzo", "Rucola", "Grana", "Pomodoro"],
      en: ["Beef", "Rocket", "Grana cheese", "Tomato"],
    },
    ingredientBasis: "menu",
    price: 18,
    confirmed: false,
  },
  {
    id: "salsicce",
    category: "secondi",
    name: { it: "Salsicce brasate al vino", en: "Wine-braised pork sausages" },
    description: { it: "Con patate al forno", en: "With roast potatoes" },
    mainIngredients: {
      it: ["Salsicce", "Vino", "Patate al forno"],
      en: ["Pork sausages", "Wine", "Roast potatoes"],
    },
    ingredientBasis: "menu",
    price: 16,
    confirmed: false,
  },
  {
    id: "calamari",
    category: "secondi",
    name: { it: "Frittura di calamari", en: "Fried calamari" },
    description: { it: "Con insalata", en: "With salad" },
    mainIngredients: {
      it: ["Calamari", "Insalata"],
      en: ["Calamari", "Salad"],
    },
    ingredientBasis: "menu",
    price: 18,
    confirmed: false,
  },
  {
    id: "spada",
    category: "secondi",
    name: { it: "Bistecchina di pesce spada", en: "Grilled swordfish" },
    description: { it: "Con verdure", en: "With vegetables" },
    mainIngredients: {
      it: ["Pesce spada", "Verdure"],
      en: ["Swordfish", "Vegetables"],
    },
    ingredientBasis: "menu",
    price: 18,
    confirmed: false,
  },
  {
    id: "patate",
    category: "contorni",
    name: { it: "Patate al forno", en: "Roast potatoes" },
    mainIngredients: {
      it: ["Patate"],
      en: ["Potatoes"],
    },
    ingredientBasis: "menu",
    price: 6.5,
    confirmed: false,
  },
  {
    id: "cicoria",
    category: "contorni",
    name: { it: "Cicoria ripassata", en: "Sautéed chicory" },
    mainIngredients: {
      it: ["Cicoria"],
      en: ["Chicory"],
    },
    ingredientBasis: "menu",
    price: 7,
    confirmed: false,
  },
  {
    id: "fritte",
    category: "contorni",
    name: { it: "Patate fritte", en: "Fries" },
    mainIngredients: {
      it: ["Patate"],
      en: ["Potatoes"],
    },
    ingredientBasis: "menu",
    price: 6.5,
    confirmed: false,
  },
  {
    id: "sbriciolata",
    category: "dolci",
    name: {
      it: "Sbriciolata al cioccolato e lamponi",
      en: "Chocolate and raspberry crumble",
    },
    mainIngredients: {
      it: ["Crumble", "Mousse al cioccolato", "Lamponi"],
      en: ["Crumble", "Chocolate mousse", "Raspberries"],
    },
    ingredientBasis: "menu",
    price: 7.5,
    confirmed: false,
  },
  {
    id: "brulee",
    category: "dolci",
    name: { it: "Crème brûlée agli agrumi", en: "Citrus crème brûlée" },
    mainIngredients: {
      it: ["Crème brûlée", "Agrumi"],
      en: ["Crème brûlée", "Citrus"],
    },
    ingredientBasis: "menu",
    price: 7.5,
    confirmed: false,
  },
  {
    id: "tiramisu",
    category: "dolci",
    name: { it: "Tiramisù", en: "Tiramisù" },
    mainIngredients: {
      it: ["Mascarpone", "Savoiardi", "Caffè", "Uova", "Cacao"],
      en: ["Mascarpone", "Ladyfingers", "Coffee", "Eggs", "Cocoa"],
    },
    ingredientBasis: "traditional",
    price: 7,
    confirmed: false,
  },
  {
    id: "gelato",
    category: "dolci",
    name: {
      it: "Gelato crema e fichi freschi",
      en: "Cream gelato and fresh figs",
    },
    mainIngredients: {
      it: ["Gelato alla crema", "Fichi freschi"],
      en: ["Cream gelato", "Fresh figs"],
    },
    ingredientBasis: "menu",
    price: 7.5,
    confirmed: false,
  },
  {
    id: "frascati",
    category: "vini",
    name: { it: "Frascati DOC", en: "Frascati DOC" },
    description: {
      it: "Bianco · Lazio · fresco e delicato",
      en: "White · Lazio · fresh and delicate",
    },
    price: null,
    confirmed: false,
  },
  {
    id: "pinot-grigio",
    category: "vini",
    name: {
      it: "Pinot Grigio delle Venezie DOC",
      en: "Pinot Grigio delle Venezie DOC",
    },
    description: {
      it: "Bianco · Triveneto · leggero e fruttato",
      en: "White · Northeast Italy · light and fruity",
    },
    price: null,
    confirmed: false,
  },
  {
    id: "vermentino",
    category: "vini",
    name: { it: "Vermentino di Toscana IGT", en: "Vermentino di Toscana IGT" },
    description: {
      it: "Bianco · Toscana · agrumato e sapido",
      en: "White · Tuscany · citrus and mineral notes",
    },
    price: null,
    confirmed: false,
  },
  {
    id: "chianti",
    category: "vini",
    name: { it: "Chianti DOCG", en: "Chianti DOCG" },
    description: {
      it: "Rosso · Toscana · armonioso e intenso",
      en: "Red · Tuscany · balanced and expressive",
    },
    price: null,
    confirmed: false,
  },
  {
    id: "montepulciano",
    category: "vini",
    name: {
      it: "Montepulciano d’Abruzzo DOC",
      en: "Montepulciano d’Abruzzo DOC",
    },
    description: {
      it: "Rosso · Abruzzo · morbido e generoso",
      en: "Red · Abruzzo · smooth and full-bodied",
    },
    price: null,
    confirmed: false,
  },
  {
    id: "prosecco",
    category: "vini",
    name: { it: "Prosecco DOC", en: "Prosecco DOC" },
    description: {
      it: "Bollicine · Veneto e Friuli · fresco e vivace",
      en: "Sparkling · Veneto and Friuli · fresh and lively",
    },
    price: null,
    confirmed: false,
  },
];
export const menuCopy = {
  it: {
    title: "Il menù",
    subtitle: "Una buona ragione per tornare.",
    note: "Proposte e prezzi [DA CONFERMARE]. Da foto del menù su TheFork, consultate il 12 ottobre 2026.",
    allergens:
      "Allergie o intolleranze? Parlane con il personale. Informazioni sugli allergeni [DA CONFERMARE].",
    scan: "Sfoglia il menù fotografato",
    scanTitle: "Il menù, nelle foto dei clienti",
    scanCredit:
      "Foto: MariaLuisa L., TheFork. La data della foto non garantisce la validità del menù.",
    wine: "La carta dei vini",
    wineNote: "Etichette e prezzi [DA CONFERMARE].",
    close: "Chiudi",
    photo:
      "Un piatto fotografato da un cliente. Identità esatta [DA CONFERMARE].",
    sideLabel: "Il piacere della tavola.",
    priceLabel: "Prezzo fotografato",
  },
  en: {
    title: "The menu",
    subtitle: "A good reason to come back.",
    note: "Dishes and prices [TO BE CONFIRMED]. From menu photos on TheFork, checked 12 October 2026.",
    allergens:
      "Allergies or intolerances? Ask the team. Allergen information [TO BE CONFIRMED].",
    scan: "Browse the photographed menu",
    scanTitle: "The menu, photographed by guests",
    scanCredit:
      "Photos: MariaLuisa L., TheFork. A photo’s date does not establish menu validity.",
    wine: "The wine list",
    wineNote: "Wines and prices [TO BE CONFIRMED].",
    close: "Close",
    photo: "A dish photographed by a guest. Exact identity [TO BE CONFIRMED].",
    sideLabel: "The pleasure of the table.",
    priceLabel: "Photographed price",
  },
};
