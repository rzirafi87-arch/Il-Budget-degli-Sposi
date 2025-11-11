import { flags } from "./flags";

export type EventKey =
  | "wedding"
  | "baptism"
  | "communion"
  | "confirmation"
  | "graduation"
  | "anniversary"
  | "gender-reveal"
  | "birthday"
  | "fifty"
  | "retirement"
  | "eighteenth"
  | "babyshower"
  | "engagement"
  | "proposal"
  | "bar-mitzvah"
  | "quinceanera"
  | "corporate"
  | "charity-gala";

type EventRegistryItem = {
  label: string;
  available: boolean;
  icon: string;
  route: string;
};

export const eventsRegistry: Record<EventKey, EventRegistryItem> = {
  wedding: {
    label: "Wedding",
    available: flags.enable_wedding,
    icon: "Gem",
    route: "/[locale]/wedding",
  },
  baptism: {
    label: "Baptism",
    available: flags.enable_baptism,
    icon: "Droplets",
    route: "/[locale]/baptism",
  },
  communion: {
    label: "Communion",
    available: flags.enable_communion,
    icon: "Bread",
    route: "/[locale]/communion",
  },
  confirmation: {
    label: "Confirmation",
    available: flags.enable_confirmation,
    icon: "Sparkles",
    route: "/[locale]/confirmation",
  },
  graduation: {
    label: "Graduation",
    available: flags.enable_graduation,
    icon: "GraduationCap",
    route: "/[locale]/graduation",
  },
  anniversary: {
    label: "Anniversary",
    available: flags.enable_anniversary,
    icon: "Heart",
    route: "/[locale]/anniversary",
  },
  "gender-reveal": {
    label: "Gender Reveal",
    available: flags.enable_gender_reveal,
    icon: "BabyBottle",
    route: "/[locale]/gender-reveal",
  },
  birthday: {
    label: "Birthday",
    available: flags.enable_birthday,
    icon: "Cake",
    route: "/[locale]/birthday",
  },
  fifty: {
    label: "50th Birthday",
    available: flags.enable_fifty,
    icon: "Milestone",
    route: "/[locale]/turning-50",
  },
  retirement: {
    label: "Retirement",
    available: flags.enable_retirement,
    icon: "Briefcase",
    route: "/[locale]/retirement",
  },
  eighteenth: {
    label: "18th Birthday",
    available: flags.enable_eighteenth,
    icon: "Sparkle",
    route: "/[locale]/turning-18",
  },
  babyshower: {
    label: "Baby Shower",
    available: flags.enable_babyshower,
    icon: "Baby",
    route: "/[locale]/baby-shower",
  },
  engagement: {
    label: "Engagement Party",
    available: flags.enable_engagement,
    icon: "HeartHandshake",
    route: "/[locale]/engagement-party",
  },
  proposal: {
    label: "Proposal",
    available: flags.enable_proposal,
    icon: "Diamond",
    route: "/[locale]/proposal",
  },
  "bar-mitzvah": {
    label: "Bar Mitzvah",
    available: flags.enable_bar_mitzvah,
    icon: "Scroll",
    route: "/[locale]/bar-mitzvah",
  },
  quinceanera: {
    label: "Quinceañera",
    available: flags.enable_quinceanera,
    icon: "Crown",
    route: "/[locale]/quinceanera",
  },
  corporate: {
    label: "Corporate Event",
    available: flags.enable_corporate,
    icon: "Building",
    route: "/[locale]/corporate",
  },
  "charity-gala": {
    label: "Charity Gala",
    available: flags.enable_charity_gala,
    icon: "Ribbon",
    route: "/[locale]/charity-gala",
  },
};

export const activeEventEntries = Object.entries(eventsRegistry).filter(([, value]) => value.available);
