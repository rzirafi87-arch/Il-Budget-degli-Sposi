// Core global categories (stable slugs) for Matrimonio
// Keep slugs stable across countries; localize labels in UI.

export type CoreCategory = {
  slug: string;
  name_it: string;
  description_it?: string;
};

// Ordered list for UI and reports
export const CORE_CATEGORIES: CoreCategory[] = [
  { slug: "ceremony_location", name_it: "Location & Cerimonia", description_it: "Luogo, rito, officiant/licenze" },
  { slug: "reception_catering", name_it: "Ricevimento & Catering" },
  { slug: "attire_beauty", name_it: "Abiti & Bellezza" },
  { slug: "photo_video", name_it: "Foto/Video" },
  { slug: "flowers_decor", name_it: "Fiori & Decor" },
  { slug: "entertainment", name_it: "Intrattenimento" },
  { slug: "invites_stationery", name_it: "Inviti & Stationery" },
  { slug: "transport_hospitality", name_it: "Trasporti & Ospitalità" },
  { slug: "gifts_registry", name_it: "Regali/Lista nozze" },
  { slug: "traditions", name_it: "Rituali/Tradizioni" },
  { slug: "documents_licenses", name_it: "Documenti & Burocrazia" },
  { slug: "contingencies", name_it: "Contingenze" },
];

// Transitional helper: map core slugs to existing dashboard category labels to avoid UI breakage.
// This lets us group current detailed categories under the new global buckets when needed.
export const CORE_TO_EXISTING_CATEGORY_LABELS: Record<string, string[]> = {
  ceremony_location: [
    "Cerimonia/Chiesa Location",
    "Musica Cerimonia",
  ],
  reception_catering: [
    "Ricevimento Location",
    "Musica Ricevimento",
  ],
  attire_beauty: [
    "Sposa",
    "Sposo",
    "Abiti & Accessori (altri)",
    "Beauty & Benessere",
  ],
  photo_video: ["Foto & Video"],
  flowers_decor: ["Fiori & Decor"],
  entertainment: ["Musica & Intrattenimento", "Fuochi d'artificio"],
  invites_stationery: ["Inviti & Stationery", "Comunicazione & Media"],
  transport_hospitality: ["Trasporti", "Ospitalità & Logistica"],
  gifts_registry: ["Bomboniere & Regali", "Viaggio di nozze"],
  traditions: [], // populated from country/rite specific presets
  documents_licenses: ["Burocrazia"],
  contingencies: ["Extra & Contingenze"],
};

// Utility: Italian label by slug
export const coreLabelIt = (slug: string): string =>
  CORE_CATEGORIES.find((c) => c.slug === slug)?.name_it || slug;
