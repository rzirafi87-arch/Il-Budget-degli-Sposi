export const flags = {
  en_ui: true,
  es_ui: true,
  fr_ui: true,
  pt_ui: true,
  zh_ui: true,
  country_mexico: true,
  country_india: false,
  ai_suggestions: false,
  payments_stripe: true,
  enable_wedding: true,
  enable_baptism: true,
  enable_communion: true,
  enable_confirmation: true,
  enable_graduation: true,
  enable_anniversary: true,
  enable_gender_reveal: true,
  enable_birthday: true, // Ensure this flag is enabled
  enable_fifty: true,
  enable_retirement: true,
  enable_eighteenth: true,
  enable_baby_shower: true, // Ensure this flag is enabled
  enable_engagement_party: true, // Ensure this flag is enabled
  enable_proposal: true,
  enable_bar_mitzvah: true,
  enable_quinceanera: true,
  enable_corporate: true,
  enable_charity_gala: true,
} as const;

export type FeatureFlags = typeof flags;
