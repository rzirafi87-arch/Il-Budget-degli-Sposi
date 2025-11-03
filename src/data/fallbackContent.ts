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
const FALLBACK_LOCATIONS: DeepReadonly<Record<string, FallbackLocation[]>> = {
  us: [
    {
      id: "fallback-location-us-sonoma",
      country: "us",
      name: "Sonoma Vineyard Estate",
      region: "California",
      province: "Sonoma County",
      city: "Healdsburg",
      address: "420 Vineyard Lane, Healdsburg, CA",
      description: "Tenuta vinicola panoramica con cortili in pietra e sale vetrate immersive.",
      location_type: "Vineyard",
      capacity_min: 40,
      capacity_max: 180,
      website: "https://sonomavineyardestate.com",
      phone: "+1 707 555 6020",
      verified: true,
    },
    {
      id: "fallback-location-us-brooklyn",
      country: "us",
      name: "Brooklyn Loft & Garden",
      region: "New York",
      province: "Kings County",
      city: "Brooklyn",
      address: "25 River Street, Brooklyn, NY",
      description: "Loft industriale con rooftop garden vista skyline di Manhattan.",
      location_type: "Loft",
      capacity_min: 50,
      capacity_max: 220,
      website: "https://brooklynloftgarden.com",
      phone: "+1 718 555 7440",
      verified: true,
    },
  ],
  gb: [
    {
      id: "fallback-location-gb-cotswolds",
      country: "gb",
      name: "Cotswolds Manor & Orangery",
      region: "Inghilterra",
      province: "Gloucestershire",
      city: "Chipping Campden",
      address: "1 Manor Lane, GL55",
      description: "Maniero del XVII secolo con giardini all'inglese e orangerie in vetro.",
      location_type: "Country House",
      capacity_min: 40,
      capacity_max: 160,
      website: "https://cotswoldsmanor.co.uk",
      phone: "+44 1386 555 902",
      verified: true,
    },
    {
      id: "fallback-location-gb-shoreditch",
      country: "gb",
      name: "Shoreditch Warehouse Hall",
      region: "Inghilterra",
      province: "Greater London",
      city: "Londra",
      address: "12 Brick Lane, London E1",
      description: "Spazio industriale con mattoni a vista e cortile interno per cerimonie civili.",
      location_type: "Warehouse",
      capacity_min: 60,
      capacity_max: 220,
      website: "https://shoreditchwarehouse.co.uk",
      phone: "+44 20 7450 3310",
      verified: true,
    },
  ],
  fr: [
    {
      id: "fallback-location-fr-chateau",
      country: "fr",
      name: "Château de Lavande",
      region: "Provence-Alpes-Côte d'Azur",
      province: "Vaucluse",
      city: "Gordes",
      address: "Route de Senanque, 84220 Gordes",
      description: "Château provenzale con cortile interno e terrazza panoramica sul Luberon.",
      location_type: "Château",
      capacity_min: 50,
      capacity_max: 200,
      website: "https://chateaudelavande.fr",
      phone: "+33 4 90 55 41 00",
      verified: true,
    },
    {
      id: "fallback-location-fr-loft",
      country: "fr",
      name: "Parisian Loft des Arts",
      region: "Île-de-France",
      province: "Paris",
      city: "Parigi",
      address: "18 Rue des Filles du Calvaire, 75003",
      description: "Loft artistico nel Marais con lucernari e cortile per cerimonie civili.",
      location_type: "Loft",
      capacity_min: 40,
      capacity_max: 130,
      website: "https://parisianloftdesarts.fr",
      phone: "+33 1 84 60 90 70",
      verified: true,
    },
  ],
  es: [
    {
      id: "fallback-location-es-masia",
      country: "es",
      name: "Masía Bella Vista",
      region: "Catalunya",
      province: "Barcelona",
      city: "Sitges",
      address: "Camí de la Serra, Sitges",
      description: "Masía con patio interno, pergolati e suite per gli sposi.",
      location_type: "Masía",
      capacity_min: 60,
      capacity_max: 220,
      website: "https://masiabellavista.es",
      phone: "+34 938 555 320",
      verified: true,
    },
    {
      id: "fallback-location-es-palacio",
      country: "es",
      name: "Palacio de Sevilla",
      region: "Andalucía",
      province: "Sevilla",
      city: "Sevilla",
      address: "Calle Águilas 23, Sevilla",
      description: "Palazzo nobiliario con patio mudéjar, fontane e saloni affrescati.",
      location_type: "Palacio",
      capacity_min: 50,
      capacity_max: 180,
      website: "https://palaciodesevilla.es",
      phone: "+34 955 555 715",
      verified: true,
    },
  ],
};
const FALLBACK_CHURCHES: DeepReadonly<Record<string, FallbackChurch[]>> = {
  us: [
    {
      id: "fallback-church-us-st-patrick",
      country: "us",
      name: "St. Patrick's Cathedral",
      region: "New York",
      province: "New York County",
      city: "New York",
      address: "5th Ave, New York, NY",
      description: "Cattedrale neogotica iconica con navate imponenti e organo maestoso.",
      church_type: "Catholic",
      capacity: 400,
      requires_baptism: true,
      requires_marriage_course: true,
      phone: "+1 212 555 3000",
      email: "weddings@saintpatrickscathedral.org",
      website: "https://saintpatrickscathedral.org",
      verified: true,
    },
    {
      id: "fallback-church-us-grace-cathedral",
      country: "us",
      name: "Grace Cathedral",
      region: "California",
      province: "San Francisco County",
      city: "San Francisco",
      address: "1100 California St, San Francisco, CA",
      description: "Cattedrale episcopale con labirinto medievale e coro gospel residente.",
      church_type: "Episcopal",
      capacity: 350,
      requires_baptism: false,
      requires_marriage_course: true,
      phone: "+1 415 555 2100",
      email: "events@gracecathedral.org",
      website: "https://gracecathedral.org",
      verified: true,
    },
  ],
  gb: [
    {
      id: "fallback-church-gb-westminster",
      country: "gb",
      name: "Westminster Abbey",
      region: "Inghilterra",
      province: "Greater London",
      city: "London",
      address: "20 Deans Yd, London SW1",
      description: "Abbazia reale con cori professionali e navata storica patrimonio UNESCO.",
      church_type: "Anglican",
      capacity: 300,
      requires_baptism: false,
      requires_marriage_course: true,
      phone: "+44 20 7222 5152",
      email: "ceremonies@westminster-abbey.org",
      website: "https://westminster-abbey.org",
      verified: true,
    },
    {
      id: "fallback-church-gb-st-giles",
      country: "gb",
      name: "St Giles' Cathedral",
      region: "Scotland",
      province: "City of Edinburgh",
      city: "Edinburgh",
      address: "High St, Edinburgh EH1",
      description: "Cattedrale gotica con navate luminose e organo barocco restaurato.",
      church_type: "Presbyterian",
      capacity: 220,
      requires_baptism: false,
      requires_marriage_course: false,
      phone: "+44 131 225 9442",
      email: "events@stgilescathedral.org.uk",
      website: "https://stgilescathedral.org.uk",
      verified: true,
    },
  ],
  fr: [
    {
      id: "fallback-church-fr-fourviere",
      country: "fr",
      name: "Basilique Notre-Dame de Fourvière",
      region: "Auvergne-Rhône-Alpes",
      province: "Rhône",
      city: "Lyon",
      address: "8 Place de Fourvière, 69005 Lyon",
      description: "Basilica monumentale con vista su Lione, mosaici dorati e cappelle laterali.",
      church_type: "Catholique",
      capacity: 320,
      requires_baptism: true,
      requires_marriage_course: true,
      phone: "+33 4 78 25 13 01",
      email: "mariages@fourviere.org",
      website: "https://fourviere.org",
      verified: true,
    },
    {
      id: "fallback-church-fr-sainte-chapelle",
      country: "fr",
      name: "Sainte-Chapelle Royale",
      region: "Île-de-France",
      province: "Paris",
      city: "Paris",
      address: "8 Boulevard du Palais, 75001 Paris",
      description: "Cappella gotica regale con vetrate del XIII secolo ideale per cerimonie intime.",
      church_type: "Catholique",
      capacity: 150,
      requires_baptism: true,
      requires_marriage_course: true,
      phone: "+33 1 53 40 60 90",
      email: "ceremonies@sainte-chapelle.fr",
      website: "https://sainte-chapelle.fr",
      verified: true,
    },
  ],
  es: [
    {
      id: "fallback-church-es-sevilla",
      country: "es",
      name: "Catedral de Sevilla",
      region: "Andalucía",
      province: "Sevilla",
      city: "Sevilla",
      address: "Av. de la Constitución s/n, Sevilla",
      description: "La più grande cattedrale gotica del mondo con coro dorato e Giralda panoramica.",
      church_type: "Católica",
      capacity: 400,
      requires_baptism: true,
      requires_marriage_course: true,
      phone: "+34 955 555 512",
      email: "bodas@catedraldesevilla.es",
      website: "https://catedraldesevilla.es",
      verified: true,
    },
    {
      id: "fallback-church-es-santa-maria",
      country: "es",
      name: "Basílica Santa María del Mar",
      region: "Catalunya",
      province: "Barcelona",
      city: "Barcelona",
      address: "Pl. de Santa Maria, 1, Barcelona",
      description: "Basilica gotica catalana con navata slanciata e rosone del XIV secolo.",
      church_type: "Católica",
      capacity: 260,
      requires_baptism: true,
      requires_marriage_course: true,
      phone: "+34 933 102 390",
      email: "sacramentos@santamariadelmar.cat",
      website: "https://santamariadelmar.barcelona",
      verified: true,
    },
  ],
};

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
