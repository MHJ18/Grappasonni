import {sectionCopy} from '@/data/sections';
import {restaurant} from '@/data/content';
import type {Locale} from '@/i18n/routing';

export const sarabMediaCopy = {
  it: {
    galleryLabel: 'Il nostro ristorante',
    galleryHeading: ['Uno sguardo', 'a Grappasonni'],
    galleryDescription: 'La veranda, il giardino e la cucina. Fotografie dalla galleria del ristorante su TheFork.',
    galleryCounter: 'Fotografia',
    reviewLabel: 'Le vostre impressioni',
    reviewHeading: ['A tavola,', 'con voi'],
    reviewSources: 'Fonte delle recensioni',
    previousReview: 'Recensione precedente',
    nextReview: 'Recensione successiva',
    goToReview: 'Mostra la recensione',
    pauseReviews: 'Pausa scorrimento recensioni',
    playReviews: 'Avvia scorrimento recensioni',
    reviewPosition: 'Prima recensione visibile',
    rating: 'Valutazione',
    GoogleSnapshot: 'Dati Google consultati il',
    noGoogleReviews: 'Google non ha restituito recensioni per questo profilo.',
    kitchenCaption: 'Dalla nostra cucina',
    dessertCaption: 'Un momento dolce',
    kitchenAlt: 'Una preparazione della cucina di Grappasonni, con salsa e germogli',
    dessertAlt: 'Un dolce della casa, servito su un piatto decorato',
  },
  en: {
    galleryLabel: 'Our restaurant',
    galleryHeading: ['A glimpse', 'of Grappasonni'],
    galleryDescription: 'The veranda, the garden and the kitchen. Photographs from the restaurant’s gallery on TheFork.',
    galleryCounter: 'Photograph',
    reviewLabel: 'Your impressions',
    reviewHeading: ['At the table,', 'with you'],
    reviewSources: 'Review source',
    previousReview: 'Previous review',
    nextReview: 'Next review',
    goToReview: 'Show review',
    pauseReviews: 'Pause review carousel',
    playReviews: 'Start review carousel',
    reviewPosition: 'First visible review',
    rating: 'Rating',
    GoogleSnapshot: 'Google data retrieved on',
    noGoogleReviews: 'Google did not return any reviews for this profile.',
    kitchenCaption: 'From our kitchen',
    dessertCaption: 'A sweet moment',
    kitchenAlt: 'A preparation from Grappasonni’s kitchen, with sauce and fresh shoots',
    dessertAlt: 'A house dessert served on a decorated plate',
  },
} as const;

export function getSarabGallery(locale: Locale) {
  const c = sectionCopy[locale];
  const m = sarabMediaCopy[locale];
  // Every caption and alt stays paired with its verified source photograph.
  return [
    {src: '/images/interior.webp', alt: c.galleryAlts[1], caption: c.galleryCaptions[1], source: restaurant.theFork},
    {src: '/images/terrace.webp', alt: c.galleryAlts[0], caption: c.galleryCaptions[0], source: restaurant.theFork},
    {src: '/images/dish-02.webp', alt: m.kitchenAlt, caption: m.kitchenCaption, source: restaurant.theFork},
    {src: '/images/detail.webp', alt: c.galleryAlts[3], caption: c.galleryCaptions[3], source: restaurant.theFork},
    {src: '/images/dish-03.webp', alt: m.dessertAlt, caption: m.dessertCaption, source: restaurant.theFork},
  ];
}

export const googleRestaurantLink = 'https://www.google.com/maps/search/?api=1&query=Ristorante+Grappasonni+dal+1908&query_place_id=ChIJI-vDF-qJJRMRObrY4JlPg_E';

export const theForkReviewSnapshot = {
  rating: 9.7,
  count: 605,
  checkedAt: '2026-10-12',
  source: `${restaurant.theFork}/recensioni`,
} as const;
