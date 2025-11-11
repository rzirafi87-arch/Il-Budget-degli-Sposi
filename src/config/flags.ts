export const flags = {
  enable_wedding: true,
  enable_baptism: true,
  enable_communion: true,
  enable_confirmation: true,
  enable_graduation: true,
  enable_anniversary: true,
  enable_gender_reveal: true,
  enable_birthday: true,
  enable_fifty: true,
  enable_retirement: true,
  enable_eighteenth: true,
  enable_baby_shower: true,
  enable_engagement_party: true,
  enable_proposal: false,
  enable_bar_mitzvah: false,
  enable_quinceanera: false,
  enable_corporate: false,
  enable_charity_gala: false,
} as const;

export type FlagKey = keyof typeof flags;
