export type CarouselCategory =
  | "venues"
  | "churches"
  | "vendors"
  | "fashion"
  | "flowers"
  | "photography"
  | "catering"
  | "beauty"
  | "jewelry"
  | "music"
  | "details"
  | "stationery"
  | "guests";

export type CountryCarouselRegistry = Record<
  string,
  Partial<Record<CarouselCategory, string[]>>
>;

const CATEGORY_KEYWORDS: Record<CarouselCategory, string[]> = {
  venues: ["wedding venue", "villa wedding", "outdoor ceremony"],
  churches: ["wedding church", "historic cathedral", "chapel wedding"],
  vendors: ["wedding reception", "wedding planning", "wedding setup"],
  fashion: ["wedding dress", "bridal fashion", "couture wedding"],
  flowers: ["wedding flowers", "bridal bouquet", "floral centerpiece"],
  photography: ["wedding photographer", "wedding photoshoot", "bridal portrait"],
  catering: ["wedding catering", "wedding dinner", "banquet setup"],
  beauty: ["bridal makeup", "bridal hair", "wedding beauty"],
  jewelry: ["wedding rings", "bridal jewelry", "engagement ring"],
  music: ["wedding music", "wedding band", "wedding dj"],
  details: ["wedding decor", "wedding details", "wedding styling"],
  stationery: ["wedding stationery", "wedding invitation", "save the date"],
  guests: ["wedding guests", "wedding celebration", "wedding party"],
};

const COUNTRY_QUERY: Record<string, string> = {
  it: "italy",
  mx: "mexico",
  us: "united states",
  gb: "united kingdom",
  fr: "france",
  es: "spain",
  de: "germany",
  pt: "portugal",
  br: "brazil",
  ca: "canada",
  jp: "japan",
  id: "indonesia",
  ar: "argentina",
  ae: "dubai",
};

const COUNTRY_SEED_OFFSET: Record<string, number> = {
  it: 10,
  mx: 20,
  us: 30,
  gb: 40,
  fr: 50,
  es: 60,
  de: 70,
  pt: 80,
  br: 90,
  ca: 100,
  jp: 110,
  id: 120,
  ar: 130,
  ae: 140,
};

function buildUnsplashUrl(country: string, keyword: string, seed: number): string {
  const sanitize = (value: string) => value.trim().replace(/\s+/g, "+");
  const query = `${sanitize(country)}+${sanitize(keyword)}`;
  return `https://source.unsplash.com/1600x900/?${query}&sig=${seed}`;
}

export const COUNTRY_CAROUSEL_IMAGES: CountryCarouselRegistry = Object.fromEntries(
  Object.entries(COUNTRY_QUERY).map(([countryCode, countryName]) => {
    const seedOffset = COUNTRY_SEED_OFFSET[countryCode] ?? 0;
    const categories = Object.fromEntries(
      Object.entries(CATEGORY_KEYWORDS).map(([category, keywords]) => [
        category,
        keywords.map((keyword, idx) =>
          buildUnsplashUrl(countryName, keyword, seedOffset + idx + 1),
        ),
      ]),
    );

    return [countryCode, categories];
  }),
) as CountryCarouselRegistry;
