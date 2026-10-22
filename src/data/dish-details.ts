/**
 * Ingredient copy accompanies short, descriptive ingredient lists in menu.ts.
 * Lists marked "traditional" explain the customary dish, not this restaurant's
 * exact recipe or allergen handling. Other lists use the photographed menu.
 *
 * Recipe references:
 * https://www.amatriciana.org/a_download/amatriciana.pdf
 * https://www.accademiaitalianadellacucina.it/it/regionistati/lazio
 * https://tiramisuworldcup.com/ricette/italia-tiramisu-originale/
 */
export const dishDetailCopy = {
  it: {
    ingredients: "Ingredienti principali",
    traditionalIngredients: "Nella ricetta tradizionale",
    ingredientNote: "La preparazione della cucina può variare.",
    details: "Scopri il piatto",
    close: "Chiudi i dettagli",
    reserve: "Prenota un tavolo",
    save: "Salva tra i preferiti",
    saved: "Nei tuoi preferiti",
    removeSaved: "Rimuovi dai preferiti",
    offer: "Prezzo speciale",
    regularPrice: "Prezzo di menù",
    offerPrice: "Prezzo in offerta",
    wineDetails: "Il vino",
    askWine: "Chiedi al personale disponibilità e prezzo.",
  },
  en: {
    ingredients: "Main ingredients",
    traditionalIngredients: "In the traditional recipe",
    ingredientNote: "The kitchen’s preparation may vary.",
    details: "Explore the dish",
    close: "Close dish details",
    reserve: "Book a table",
    save: "Save to favourites",
    saved: "In your favourites",
    removeSaved: "Remove from favourites",
    offer: "Special price",
    regularPrice: "Menu price",
    offerPrice: "Offer price",
    wineDetails: "The wine",
    askWine: "Ask the team about availability and price.",
  },
} as const;
