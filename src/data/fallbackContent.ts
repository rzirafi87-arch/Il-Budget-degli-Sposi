"use client";

type DeepReadonly<T> = {
  readonly [K in keyof T]: DeepReadonly<T[K]>;
};

export type FallbackSupplier = {
  id: string;
  country: string;
  category: string;
  name: string;
  region: string;
  province: string;
  city: string;
  description: string;
  priceRange?: string;
  rating?: number;
  phone?: string;
  email?: string;
  website?: string;
  verified: boolean;
};

export type FallbackLocation = {
  id: string;
  country: string;
  name: string;
  region: string;
  province: string;
  city: string;
  address: string;
  description: string;
  location_type: string;
  capacity_min: number;
  capacity_max: number;
  website?: string;
  phone?: string;
  verified: boolean;
};

export type FallbackChurch = {
  id: string;
  country: string;
  name: string;
  region: string;
  province: string;
  city: string;
  address: string;
  description: string;
  church_type: string;
  capacity?: number;
  requires_baptism: boolean;
  requires_marriage_course: boolean;
  phone?: string;
  email?: string;
  website?: string;
  verified: boolean;
};

const FALLBACK_SUPPLIERS: DeepReadonly<Record<string, FallbackSupplier[]>> = {
  us: [
    {
      id: "fallback-supplier-us-catering-harvest-moon",
      country: "us",
      category: "Catering",
      name: "Harvest Moon Catering",
      region: "California",
      province: "Napa County",
      city: "Napa",
      description: "Banqueting farm-to-table con menu stagionali e degustazioni di vini locali.",
      priceRange: "$$$",
      rating: 4.9,
      phone: "+1 707 555 0148",
      email: "events@harvestmooncatering.com",
      website: "https://harvestmooncatering.com",
      verified: true,
    },
    {
      id: "fallback-supplier-us-photography-hudson",
      country: "us",
      category: "Fotografi",
      name: "Hudson Studio Collective",
      region: "New York",
      province: "New York County",
      city: "New York",
      description: "Studio di fotografia editoriale con reportage artistici a Manhattan e Brooklyn.",
      priceRange: "$$$",
      rating: 4.8,
      phone: "+1 212 555 0360",
      email: "hello@hudsonstudio.co",
      website: "https://hudsonstudio.co",
      verified: true,
    },
    {
      id: "fallback-supplier-us-floral-magnolia",
      country: "us",
      category: "Fiorai",
      name: "Magnolia & Vine",
      region: "Texas",
      province: "Travis County",
      city: "Austin",
      description: "Design floreale botanico con installazioni sospese per matrimoni outdoor texani.",
      priceRange: "$$",
      rating: 4.7,
      phone: "+1 512 555 0890",
      email: "design@magnoliavine.com",
      website: "https://magnoliavine.com",
      verified: true,
    },
  ],
  gb: [
    {
      id: "fallback-supplier-gb-catering-mayfair",
      country: "gb",
      category: "Catering",
      name: "Mayfair Banqueting",
      region: "Inghilterra",
      province: "Greater London",
      city: "Londra",
      description: "Catering luxury con menu tasting britannici e asiatici per dimore storiche.",
      priceRange: "£££",
      rating: 4.8,
      phone: "+44 20 7946 0899",
      email: "events@mayfairbanqueting.co.uk",
      website: "https://mayfairbanqueting.co.uk",
      verified: true,
    },
    {
      id: "fallback-supplier-gb-photography-lake",
      country: "gb",
      category: "Fotografi",
      name: "Lake District Storytellers",
      region: "Inghilterra",
      province: "Cumbria",
      city: "Windermere",
      description: "Fotografi di matrimoni intimi con scatti cinematici tra i laghi inglesi.",
      priceRange: "££",
      rating: 4.7,
      phone: "+44 1539 555 210",
      email: "hello@lakedistrictstorytellers.uk",
      website: "https://lakedistrictstorytellers.uk",
      verified: true,
    },
    {
      id: "fallback-supplier-gb-floral-chelsea",
      country: "gb",
      category: "Fiorai",
      name: "Chelsea Flowers & Styling",
      region: "Inghilterra",
      province: "Greater London",
      city: "Londra",
      description: "Fioristi couture con installazioni sospese e bouquet english garden.",
      priceRange: "£££",
      rating: 4.9,
      phone: "+44 20 7887 3211",
      email: "studio@chelseaflowers.co.uk",
      website: "https://chelseaflowers.co.uk",
      verified: true,
    },
  ],
  fr: [
    {
      id: "fallback-supplier-fr-catering-maison",
      country: "fr",
      category: "Catering",
      name: "Maison Belle Table",
      region: "Île-de-France",
      province: "Paris",
      city: "Parigi",
      description: "Banqueting gastronomico con menu degustazione franco-italiani.",
      priceRange: "€€€",
      rating: 4.9,
      phone: "+33 1 86 95 42 10",
      email: "contact@maisonbelletable.fr",
      website: "https://maisonbelletable.fr",
      verified: true,
    },
    {
      id: "fallback-supplier-fr-photography-provence",
      country: "fr",
      category: "Fotografi",
      name: "Provence Light Studio",
      region: "Provence-Alpes-Côte d'Azur",
      province: "Bouches-du-Rhône",
      city: "Aix-en-Provence",
      description: "Reportage fine art su pellicola tra lavanda e bastides provenzali.",
      priceRange: "€€€",
      rating: 4.8,
      phone: "+33 4 65 45 90 12",
      email: "bonjour@provencelight.fr",
      website: "https://provencelight.fr",
      verified: true,
    },
    {
      id: "fallback-supplier-fr-floral-eucalyptus",
      country: "fr",
      category: "Fiorai",
      name: "Atelier Eucalyptus",
      region: "Auvergne-Rhône-Alpes",
      province: "Rhône",
      city: "Lione",
      description: "Atelier botanico che crea scenografie sostenibili e bouquet giardino.",
      priceRange: "€€",
      rating: 4.7,
      phone: "+33 4 28 29 70 55",
      email: "atelier@eucalyptus-lyon.fr",
      website: "https://eucalyptus-lyon.fr",
      verified: true,
    },
  ],
  es: [
    {
      id: "fallback-supplier-es-catering-barcelona",
      country: "es",
      category: "Catering",
      name: "Barcelona Gourmet Events",
      region: "Catalunya",
      province: "Barcelona",
      city: "Barcellona",
      description: "Catering creativo con showcooking mediterranei e tapas stellate.",
      priceRange: "€€",
      rating: 4.8,
      phone: "+34 93 555 6108",
      email: "hola@barcelonagourmetevents.es",
      website: "https://barcelonagourmetevents.es",
      verified: true,
    },
    {
      id: "fallback-supplier-es-photography-costa",
      country: "es",
      category: "Fotografi",
      name: "Costa de la Luz Visuals",
      region: "Andalucía",
      province: "Cádiz",
      city: "Tarifa",
      description: "Fotografia lifestyle con palette calde per matrimoni sulla costa andalusa.",
      priceRange: "€€",
      rating: 4.7,
      phone: "+34 956 555 210",
      email: "studio@costadelaluzvisuals.es",
      website: "https://costadelaluzvisuals.es",
      verified: true,
    },
    {
      id: "fallback-supplier-es-floral-madrid",
      country: "es",
      category: "Fiorai",
      name: "Madrid Botanica",
      region: "Comunidad de Madrid",
      province: "Madrid",
      city: "Madrid",
      description: "Design floreale elegante con mix di fiori secchi e freschi.",
      priceRange: "€€",
      rating: 4.8,
      phone: "+34 91 602 4478",
      email: "info@madridbotanica.es",
      website: "https://madridbotanica.es",
      verified: true,
    },
  ],
};
const FALLBACK_LOCATIONS: DeepReadonly<Record<string, FallbackLocation[]>> = {};
const FALLBACK_CHURCHES: DeepReadonly<Record<string, FallbackChurch[]>> = {};

function cloneList<T>(list: readonly T[]): T[] {
  return list.map((item) => ({ ...(item as Record<string, unknown>) })) as T[];
}

export function getFallbackSuppliers(country: string, category?: string): FallbackSupplier[] {
  const normalized = country?.toLowerCase();
  const items = FALLBACK_SUPPLIERS[normalized ?? ""] ?? [];
  const filtered = category
    ? items.filter((item) => item.category.toLowerCase() === category.toLowerCase())
    : items;
  return cloneList(filtered);
}

export function getFallbackLocations(
  country: string,
  options?: { region?: string | null; province?: string | null; locationType?: string | null },
): FallbackLocation[] {
  const normalized = country?.toLowerCase();
  const items = FALLBACK_LOCATIONS[normalized ?? ""] ?? [];
  const filtered = items.filter((location) => {
    if (options?.region && location.region !== options.region) return false;
    if (options?.province && location.province !== options.province) return false;
    if (options?.locationType && location.location_type !== options.locationType) return false;
    return true;
  });
  return cloneList(filtered);
}

export function getFallbackChurches(
  country: string,
  options?: { region?: string | null; province?: string | null; churchType?: string | null },
): FallbackChurch[] {
  const normalized = country?.toLowerCase();
  const items = FALLBACK_CHURCHES[normalized ?? ""] ?? [];
  const filtered = items.filter((church) => {
    if (options?.region && church.region !== options.region) return false;
    if (options?.province && church.province !== options.province) return false;
    if (options?.churchType && church.church_type !== options.churchType) return false;
    return true;
  });
  return cloneList(filtered);
}
