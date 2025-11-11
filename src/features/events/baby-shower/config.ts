import type { EventMeta } from "@/features/events/types";

export const BABY_SHOWER_META: EventMeta = {
  key: "babyshower",
  name: "Baby Shower",
  defaultCurrency: "EUR",
  sections: [
    {
      id: "venue",
      label: "Venue & Decor",
      categories: [
        { id: "venue", label: "Venue" },
        { id: "decor", label: "Decor" },
        { id: "balloons", label: "Balloons" },
      ],
    },
    {
      id: "food",
      label: "Food & Beverage",
      categories: [
        { id: "sweet_table", label: "Sweet Table" },
        { id: "catering", label: "Catering" },
        { id: "drinks", label: "Drinks" },
      ],
    },
    {
      id: "activities",
      label: "Activities & Gifts",
      categories: [
        { id: "games", label: "Games" },
        { id: "favors", label: "Favors" },
        { id: "photography", label: "Photography" },
      ],
    },
  ],
  timeline: [
    { id: "pick-date", label: "Pick date & budget", offsetDays: -56 },
    { id: "book-venue", label: "Book venue/decor", offsetDays: -42 },
    { id: "invites", label: "Send invitations", offsetDays: -28 },
    { id: "confirm", label: "Confirm menu & games", offsetDays: -7 },
    { id: "event", label: "Event day", offsetDays: 0 },
  ],
};
