import { flags } from "./flags";

export const eventsRegistry = {
  birthday: {
    label: "Birthday",
    available: flags.enable_birthday,
    icon: "Cake",
    route: "/[locale]/birthday",
  },
  "engagement-party": {
    label: "Engagement Party",
    available: flags.enable_engagement_party,
    icon: "HeartHandshake",
    route: "/[locale]/engagement-party",
  },
  "baby-shower": {
    label: "Baby Shower",
    available: flags.enable_baby_shower,
    icon: "Baby",
    route: "/[locale]/baby-shower",
  },
  // …lascia OFF i 5 non iniziati (available:false finché non completi)
} as const;
