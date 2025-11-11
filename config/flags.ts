export const flags = {
  en_ui: true,
  es_ui: false,
  country_mexico: true,
  country_india: false,
  ai_suggestions: false,
  payments_stripe: true,
  enable_wedding: true,
} as const;

export type FeatureFlags = typeof flags;
