import type { EventMeta } from "@/features/events/types";

export const ENGAGEMENT_PARTY_META: EventMeta = {
  key: "engagement-party",
  name: "Engagement Party",
  defaultCurrency: "EUR",
  sections: [
    {
      id: "venue",
      label: "Venue & Location",
      categories: [
        { id: "venue_rent", label: "Venue Rent" },
        { id: "decor", label: "Decor & Styling" },
        { id: "music", label: "Music / DJ" },
      ],
    },
    {
      id: "food",
      label: "Food & Beverage",
      categories: [
        { id: "catering", label: "Catering" },
        { id: "cake", label: "Cake / Dessert" },
        { id: "drinks", label: "Drinks" },
      ],
    },
    {
      id: "extras",
      label: "Extras",
      categories: [
        { id: "photography", label: "Photography" },
        { id: "invitations", label: "Invitations" },
        { id: "transport", label: "Transport" },
      ],
    },
  ],
  timeline: [
    { id: "pick-date", label: "Pick a date & budget", offsetDays: -60 },
    { id: "book-venue", label: "Book the venue", offsetDays: -45 },
    { id: "send-invites", label: "Send invitations", offsetDays: -30 },
    { id: "final-headcount", label: "Final headcount to catering", offsetDays: -7 },
    { id: "event-day", label: "Event day", offsetDays: 0 },
  ],
};
