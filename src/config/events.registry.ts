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
  | "baby-shower"
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
    label: "Matrimonio",
    available: flags.enable_wedding,
    icon: "Gem",
    route: "/[locale]/wedding",
  },
  baptism: {
    label: "Battesimo",
    available: flags.enable_baptism,
    icon: "Droplets",
    route: "/[locale]/baptism",
  },
  communion: {
    label: "Comunione (coming soon)",
    available: false,
    icon: "Bread",
    route: "/[locale]/communion",
  },
  confirmation: {
    label: "Cresima (coming soon)",
    available: false,
    icon: "Sparkles",
    route: "/[locale]/confirmation",
  },
  graduation: {
    label: "Laurea (coming soon)",
    available: false,
    icon: "GraduationCap",
    route: "/[locale]/graduation",
  },
  anniversary: {
    label: "Anniversario di matrimonio",
    available: flags.enable_anniversary,
    icon: "Heart",
    route: "/[locale]/anniversary",
  },
  "gender-reveal": {
    label: "Gender reveal",
    available: flags.enable_gender_reveal,
    icon: "BabyBottle",
    route: "/[locale]/gender-reveal",
  },
  birthday: {
    label: "Compleanno",
    available: flags.enable_birthday,
    icon: "Cake",
    route: "/[locale]/birthday",
  },
  fifty: {
    label: "50° compleanno",
    available: flags.enable_fifty,
    icon: "Milestone",
    route: "/[locale]/turning-50",
  },
  retirement: {
    label: "Pensione",
    available: flags.enable_retirement,
    icon: "Briefcase",
    route: "/[locale]/retirement",
  },
  eighteenth: {
    label: "Festa dei 18 anni",
    available: flags.enable_eighteenth,
    icon: "Sparkle",
    route: "/[locale]/turning-18",
  },
  "baby-shower": {
    label: "Baby Shower (coming soon)",
    available: false,
    icon: "Baby",
    route: "/[locale]/baby-shower",
  },
  engagement: {
    label: "Engagement Party (coming soon)",
    available: false,
    icon: "HeartHandshake",
    route: "/[locale]/engagement",
  },
  proposal: {
    label: "Proposta di Matrimonio (coming soon)",
    available: false,
    icon: "Diamond",
    route: "/[locale]/proposal",
  },
  "bar-mitzvah": {
    label: "Bar Mitzvah (coming soon)",
    available: false,
    icon: "Scroll",
    route: "/[locale]/bar-mitzvah",
  },
  quinceanera: {
    label: "Quinceañera (coming soon)",
    available: false,
    icon: "Crown",
    route: "/[locale]/quinceanera",
  },
  corporate: {
    label: "Evento aziendale (coming soon)",
    available: false,
    icon: "Building",
    route: "/[locale]/corporate",
  },
  "charity-gala": {
    label: "Evento culturale/Charity/Gala (coming soon)",
    available: false,
    icon: "Ribbon",
    route: "/[locale]/charity-gala",
  },
};

export const activeEventEntries = Object.entries(eventsRegistry).filter(
  ([, value]) => value.available
);
