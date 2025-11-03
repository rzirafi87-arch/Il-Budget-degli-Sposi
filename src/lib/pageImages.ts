import {
  COUNTRY_CAROUSEL_IMAGES,
  type CarouselCategory,
} from "@/data/countryCarousels";

type PageImageConfig = {
  default: string[];
};

const PAGE_IMAGE_CONFIG: Record<string, PageImageConfig> = {
  dashboard: {
    default: [
      "/carousels/dashboard/01.svg",
      "/carousels/dashboard/02.svg",
      "/carousels/dashboard/03.svg",
    ],
  },
  budget: {
    default: [
      "/carousels/budget/01.svg",
      "/carousels/budget/02.svg",
      "/carousels/budget/03.svg",
    ],
  },
  spese: {
    default: [
      "/carousels/spese/01.svg",
      "/carousels/spese/02.svg",
      "/carousels/spese/03.svg",
    ],
  },
  entrate: {
    default: [
      "/carousels/entrate/01.svg",
      "/carousels/entrate/02.svg",
      "/carousels/entrate/03.svg",
    ],
  },
  fornitori: {
    default: [
      "/carousels/fornitori/01.svg",
      "/carousels/fornitori/02.svg",
      "/carousels/fornitori/03.svg",
    ],
  },
  fotografi: {
    default: [
      "/carousels/fotografi/01.svg",
      "/carousels/fotografi/02.svg",
      "/carousels/fotografi/03.svg",
    ],
  },
  fiorai: {
    default: [
      "/carousels/fiorai/01.svg",
      "/carousels/fiorai/02.svg",
      "/carousels/fiorai/03.svg",
    ],
  },
  atelier: {
    default: [
      "/carousels/atelier/01.svg",
      "/carousels/atelier/02.svg",
      "/carousels/atelier/03.svg",
    ],
  },
  catering: {
    default: [
      "/carousels/catering/01.svg",
      "/carousels/catering/02.svg",
      "/carousels/catering/03.svg",
    ],
  },
  beauty: {
    default: [
      "/carousels/beauty/01.svg",
      "/carousels/beauty/02.svg",
      "/carousels/beauty/03.svg",
    ],
  },
  gioiellerie: {
    default: [
      "/carousels/gioiellerie/01.svg",
      "/carousels/gioiellerie/02.svg",
      "/carousels/gioiellerie/03.svg",
    ],
  },
  location: {
    default: [
      "/carousels/location/01.svg",
      "/carousels/location/02.svg",
      "/carousels/location/03.svg",
    ],
  },
  chiese: {
    default: [
      "/carousels/chiese/01.svg",
      "/carousels/chiese/02.svg",
      "/carousels/chiese/03.svg",
    ],
  },
  invitati: {
    default: [
      "/carousels/invitati/01.svg",
      "/carousels/invitati/02.svg",
      "/carousels/invitati/03.svg",
    ],
  },
  "save-the-date": {
    default: [
      "/carousels/save-the-date/01.svg",
      "/carousels/save-the-date/02.svg",
      "/carousels/save-the-date/03.svg",
    ],
  },
  "musica-cerimonia": {
    default: [
      "/carousels/musica-cerimonia/01.svg",
      "/carousels/musica-cerimonia/02.svg",
      "/carousels/musica-cerimonia/03.svg",
    ],
  },
  "musica-ricevimento": {
    default: [
      "/carousels/musica-ricevimento/01.svg",
      "/carousels/musica-ricevimento/02.svg",
      "/carousels/musica-ricevimento/03.svg",
    ],
  },
  "wedding-planner": {
    default: [
      "/carousels/wedding-planner/01.svg",
      "/carousels/wedding-planner/02.svg",
      "/carousels/wedding-planner/03.svg",
    ],
  },
  "cose-matrimonio": {
    default: [
      "/carousels/cose-matrimonio/01.svg",
      "/carousels/cose-matrimonio/02.svg",
      "/carousels/cose-matrimonio/03.svg",
    ],
  },
};

const KEY_TO_CATEGORIES: Record<string, CarouselCategory[]> = {
  budget: ["details", "vendors"],
  spese: ["details", "vendors"],
  entrate: ["details", "vendors"],
  fornitori: ["vendors"],
  fotografi: ["photography", "vendors"],
  fiorai: ["flowers", "vendors"],
  atelier: ["fashion", "vendors"],
  catering: ["catering", "venues"],
  beauty: ["beauty", "fashion"],
  gioiellerie: ["jewelry", "fashion"],
  location: ["venues"],
  chiese: ["churches", "venues"],
  invitati: ["guests", "details"],
  "save-the-date": ["stationery", "details"],
  "musica-cerimonia": ["music", "vendors"],
  "musica-ricevimento": ["music", "vendors"],
  "wedding-planner": ["vendors"],
  "cose-matrimonio": ["details", "vendors"],
};

export const PAGE_IMAGES: Record<string, string[]> = Object.fromEntries(
  Object.entries(PAGE_IMAGE_CONFIG).map(([key, value]) => [key, value.default]),
);

export const DEFAULT_IMAGES = [
  "/carousels/default/01.svg",
  "/carousels/default/02.svg",
  "/carousels/default/03.svg",
];

export function getPageImages(pageKey: string, country?: string): string[] {
  const countryCode = country?.toLowerCase();
  if (countryCode) {
    const categories = KEY_TO_CATEGORIES[pageKey] ?? [];
    const registry = COUNTRY_CAROUSEL_IMAGES[countryCode];

    for (const category of categories) {
      const localized = registry?.[category];
      if (localized && localized.length > 0) {
        return localized;
      }
    }
  }

  return PAGE_IMAGE_CONFIG[pageKey]?.default ?? DEFAULT_IMAGES;
}
