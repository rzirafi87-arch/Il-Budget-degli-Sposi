import { Currency } from "@/lib/types";

export const BIRTHDAY_META = {
  key: "birthday",
  label: "Birthday",
  icon: "Cake",
  defaultCurrency: "EUR" as Currency,
  sections: [
    {
      id: "venue",
      label: "Venue & Decor",
      categories: [
        { id: "venue_rent", label: "Venue rent / Room" },
        { id: "outdoor_permit", label: "Outdoor permit / Fee" },
        { id: "decor", label: "Decor & Styling" },
        { id: "balloons", label: "Balloons & Backdrops" },
        { id: "flowers", label: "Flowers" },
        { id: "lighting", label: "Lighting" },
      ],
    },
    {
      id: "food",
      label: "Food & Beverage",
      categories: [
        { id: "catering", label: "Catering / Buffet" },
        { id: "cake", label: "Cake / Desserts" },
        { id: "sweet_table", label: "Sweet Table" },
        { id: "drinks", label: "Drinks & Beverages" },
        { id: "service", label: "Service & Staff" },
      ],
    },
    {
      id: "experience",
      label: "Entertainment & Experience",
      categories: [
        { id: "dj", label: "DJ / Music" },
        { id: "live_band", label: "Live band" },
        { id: "animators", label: "Animators / Kids show" },
        { id: "photo", label: "Photography" },
        { id: "video", label: "Videography" },
        { id: "games", label: "Games & Activities" },
      ],
    },
    {
      id: "guests",
      label: "Guests & Invitations",
      categories: [
        { id: "invites", label: "Invitations / E-invites" },
        { id: "rsvp_tool", label: "RSVP tool / Website" },
        { id: "favors", label: "Party favors" },
      ],
    },
    {
      id: "logistics",
      label: "Logistics & Misc",
      categories: [
        { id: "transport", label: "Transport" },
        { id: "security", label: "Security / Insurance" },
        { id: "cleaning", label: "Cleaning" },
        { id: "contingency", label: "Contingency (5–10%)" },
      ],
    },
  ],
  timeline: [
    {
      id: "t-90-budget-theme",
      label: "Define budget & theme",
      offsetDays: -90,
    },
    {
      id: "t-75-guestlist-date",
      label: "Choose date & draft guest list",
      offsetDays: -75,
    },
    { id: "t-60-venue", label: "Book venue / permits", offsetDays: -60 },
    { id: "t-50-ent", label: "Reserve DJ/entertainment", offsetDays: -50 },
    { id: "t-45-catering", label: "Select catering & cake", offsetDays: -45 },
    {
      id: "t-35-decor",
      label: "Confirm decor/backdrop/balloons",
      offsetDays: -35,
    },
    {
      id: "t-30-invites",
      label: "Send invitations (with RSVP)",
      offsetDays: -30,
    },
    {
      id: "t-21-activities",
      label: "Plan games & timeline of day",
      offsetDays: -21,
    },
    { id: "t-14-headcount", label: "Headcount to catering", offsetDays: -14 },
    {
      id: "t-10-final-payments",
      label: "Advance payments & contracts",
      offsetDays: -10,
    },
    {
      id: "t-7-runofshow",
      label: "Run-of-show & vendor contacts",
      offsetDays: -7,
    },
    { id: "t-2-setup", label: "Finalize setup & materials", offsetDays: -2 },
    { id: "t0-event", label: "Event day", offsetDays: 0 },
    { id: "t+2-post", label: "Thank-you notes & media share", offsetDays: 2 },
  ],
} as const;
