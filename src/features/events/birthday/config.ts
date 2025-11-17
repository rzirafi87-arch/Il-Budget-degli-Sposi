import type { EventMeta } from "@/features/events/types";

export const BIRTHDAY_META: EventMeta = {
  key: "birthday",
  name: "Birthday",
  defaultCurrency: "EUR",
  sections: [
    {
      id: "venue",
      label: "Venue",
      categories: [
        { id: "rent", label: "Venue Rent" },
        { id: "decor", label: "Decor" },
        { id: "music", label: "Music" },
      ],
    },
    {
      id: "food",
      label: "Food & Beverage",
      categories: [
        { id: "catering", label: "Catering" },
        { id: "cake", label: "Cake" },
        { id: "drinks", label: "Drinks" },
      ],
    },
    {
      id: "extras",
      label: "Extras",
      categories: [
        { id: "photography", label: "Photography" },
        { id: "invitations", label: "Invitations" },
        { id: "gifts", label: "Gifts" },
      ],
    },
  ],
  timeline: [
    { id: "date", label: "Pick a date & theme", offsetDays: -60 },
    { id: "book", label: "Book venue & supplier", offsetDays: -45 },
    { id: "invites", label: "Send invites", offsetDays: -30 },
    { id: "confirm", label: "Confirm suppliers", offsetDays: -7 },
    { id: "event", label: "Event day", offsetDays: 0 },
  ],
};
