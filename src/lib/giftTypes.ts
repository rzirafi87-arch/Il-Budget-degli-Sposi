// Exact descriptive values emitted by the immutable main@7aaf48c bundle.
export const LEGACY_GIFT_TYPE_VALUES = {
  honeymoon: "Contributo viaggio di nozze",
  cash: "Cassa comune",
  experiences: "Esperienze (cene, spa, tour)",
  furniture: "Arredamento",
  appliances: "Elettrodomestici",
  luxury: "Beni di lusso",
  charity: "Beneficenza",
  vouchers: "Buoni regalo",
  smartHome: "Tech & Smart Home",
  other: "Altro",
} as const;

export type GiftType = keyof typeof LEGACY_GIFT_TYPE_VALUES;
export const GIFT_TYPES = Object.keys(LEGACY_GIFT_TYPE_VALUES) as GiftType[];

export function canonicalGiftType(value: string): GiftType | null {
  return GIFT_TYPES.find((key) => key === value || LEGACY_GIFT_TYPE_VALUES[key] === value) ?? null;
}
