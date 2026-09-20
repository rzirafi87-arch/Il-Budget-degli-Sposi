export const CEREMONY_TYPES = ["civil", "religious", "other", "undecided"] as const;
export type CeremonyType = typeof CEREMONY_TYPES[number];

export const CEREMONY_PLACE_OPTIONS = {
  civil: ["municipality", "municipal_hall", "civil_house", "ceremony_venue", "other_civil"],
  religious: ["church", "basilica", "cathedral", "abbey", "sanctuary", "chapel", "mosque", "synagogue", "temple", "other_worship"],
  other: ["ceremony_venue", "other_civil"],
  undecided: [],
} as const satisfies Record<CeremonyType, readonly string[]>;

const LEGACY_PLACE_KINDS: Record<string, string> = {
  "Comune / Municipio": "municipality",
  "Sala comunale": "municipal_hall",
  "Casa comunale": "civil_house",
  "Location per il rito": "ceremony_venue",
  "Altra sede": "other_civil",
  Chiesa: "church",
  Basilica: "basilica",
  Cattedrale: "cathedral",
  Abbazia: "abbey",
  Santuario: "sanctuary",
  Cappella: "chapel",
  Moschea: "mosque",
  Sinagoga: "synagogue",
  Tempio: "temple",
  "Altro luogo di culto": "other_worship",
};

export function canonicalCeremonyPlaceKind(value: unknown) {
  return typeof value === "string" ? (LEGACY_PLACE_KINDS[value] || value) : "";
}

export function getCeremonyPlaceOptions(type: CeremonyType): readonly string[] {
  return CEREMONY_PLACE_OPTIONS[type];
}

export function isCeremonyPlaceAllowed(type: CeremonyType, value: unknown) {
  const canonical = canonicalCeremonyPlaceKind(value);
  return canonical === "" || getCeremonyPlaceOptions(type).includes(canonical as never);
}

export function ceremonyPlaceForDisplay(type: CeremonyType, value: unknown) {
  const canonical = canonicalCeremonyPlaceKind(value);
  return isCeremonyPlaceAllowed(type, canonical) ? canonical : "";
}
