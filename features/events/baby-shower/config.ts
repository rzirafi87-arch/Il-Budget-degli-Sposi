import { Currency } from "@/lib/types";

export const BABY_SHOWER_META = {
  key: "baby-shower",
  label: "Baby Shower",
  icon: "Baby",
  defaultCurrency: "EUR" as Currency,
  sections: [
    {
      id: "venue",
      label: "Venue & Decor",
      categories: [
        { id: "venue_rent", label: "Venue rent / Home setup" },
        { id: "decor", label: "Decor & Theme styling" },
        { id: "balloons", label: "Balloon arch / Backdrop" },
        { id: "flowers", label: "Flowers / Centerpieces" },
        { id: "rentals", label: "Rentals (tables/chairs/linens)" },
      ],
    },
    {
      id: "food",
      label: "Food & Beverage",
      categories: [
        { id: "sweet_table", label: "Sweet table / Dessert bar" },
        { id: "catering", label: "Catering / Snacks" },
        { id: "drinks", label: "Drinks (non-alcoholic)" },
        { id: "cake", label: "Cake / Cupcakes" },
      ],
    },
    {
      id: "program",
      label: "Program & Gifts",
      categories: [
        { id: "games", label: "Games & Prizes" },
        { id: "favors", label: "Favors" },
        { id: "gift_registry", label: "Gift registry setup" },
        { id: "photo", label: "Photography / Corner" },
      ],
    },
    {
      id: "guests",
      label: "Invites & RSVP",
      categories: [
        { id: "invites", label: "Invitations / E-invites" },
        { id: "rsvp_tool", label: "RSVP tool / Website" },
      ],
    },
    {
      id: "logistics",
      label: "Logistics & Misc",
      categories: [
        { id: "transport", label: "Transport" },
        { id: "cleaning", label: "Cleaning / Helpers" },
        { id: "contingency", label: "Contingency (5–10%)" },
      ],
    },
  ],
  timeline: [
    {
      id: "t-70-budget",
      label: "Budget, theme & host(s) defined",
      offsetDays: -70,
    },
    {
      id: "t-60-date-guestlist",
      label: "Pick date & draft guest list",
      offsetDays: -60,
    },
    { id: "t-50-venue", label: "Book venue / home plan", offsetDays: -50 },
    { id: "t-45-registry", label: "Create gift registry", offsetDays: -45 },
    {
      id: "t-40-stationery",
      label: "Design invitations / e-invites",
      offsetDays: -40,
    },
    {
      id: "t-35-decor",
      label: "Book decor/backdrop/balloons",
      offsetDays: -35,
    },
    {
      id: "t-30-invites",
      label: "Send invitations (with RSVP)",
      offsetDays: -30,
    },
    {
      id: "t-21-games",
      label: "Plan games, prizes & program",
      offsetDays: -21,
    },
    { id: "t-14-headcount", label: "Headcount to catering", offsetDays: -14 },
    {
      id: "t-10-orders",
      label: "Confirm cake & dessert orders",
      offsetDays: -10,
    },
    { id: "t-7-ros", label: "Run-of-show + responsibilities", offsetDays: -7 },
    { id: "t-2-setup", label: "Prepare setup & favors", offsetDays: -2 },
    { id: "t0-event", label: "Event day", offsetDays: 0 },
    { id: "t+2-thanks", label: "Thank-you notes & photo share", offsetDays: 2 },
  ],
} as const;
