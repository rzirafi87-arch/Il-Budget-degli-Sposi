import { Currency } from "@/lib/types";

export const ENGAGEMENT_PARTY_META = {
  key: "engagement-party",
  label: "Engagement Party",
  icon: "HeartHandshake",
  defaultCurrency: "EUR" as Currency,
  sections: [
    {
      id: "venue",
      label: "Venue & Styling",
      categories: [
        { id: "venue_rent", label: "Venue rent / Private space" },
        { id: "decor", label: "Decor & Styling" },
        { id: "flowers", label: "Flowers" },
        { id: "lighting", label: "Lighting" },
        { id: "signage", label: "Welcome sign / Stationery" },
      ],
    },
    {
      id: "food",
      label: "Food & Beverage",
      categories: [
        { id: "catering", label: "Catering (finger food / buffet)" },
        { id: "cake", label: "Cake / Dessert table" },
        { id: "drinks", label: "Drinks & Bar" },
        { id: "service", label: "Service / Staff" },
      ],
    },
    {
      id: "media",
      label: "Media & Entertainment",
      categories: [
        { id: "photo", label: "Photography" },
        { id: "video", label: "Videography" },
        { id: "music", label: "Music / DJ" },
        { id: "toast_setup", label: "Toast / Mic setup" },
      ],
    },
    {
      id: "guests",
      label: "Invites & Guests",
      categories: [
        { id: "invites", label: "Invitations / E-invites" },
        { id: "rsvp", label: "RSVP tool / Website" },
        { id: "favors", label: "Favors / Keepsakes" },
      ],
    },
    {
      id: "logistics",
      label: "Logistics",
      categories: [
        { id: "transport", label: "Transport" },
        { id: "coordination", label: "Day-of coordination" },
        { id: "contingency", label: "Contingency (5–10%)" },
      ],
    },
  ],
  timeline: [
    {
      id: "t-90-vision",
      label: "Define vision, budget & style",
      offsetDays: -90,
    },
    {
      id: "t-75-guestlist",
      label: "Draft guest list & pick date",
      offsetDays: -75,
    },
    { id: "t-60-venue", label: "Book venue / space", offsetDays: -60 },
    { id: "t-50-keyvendors", label: "Book catering & music", offsetDays: -50 },
    {
      id: "t-45-stationery",
      label: "Design invitations/stationery",
      offsetDays: -45,
    },
    {
      id: "t-35-decor",
      label: "Confirm decor, flowers, lighting",
      offsetDays: -35,
    },
    {
      id: "t-30-invites",
      label: "Send invitations (with RSVP)",
      offsetDays: -30,
    },
    {
      id: "t-21-toasts",
      label: "Plan toasts & timeline of the night",
      offsetDays: -21,
    },
    { id: "t-14-headcount", label: "Headcount to catering", offsetDays: -14 },
    { id: "t-10-contracts", label: "Contracts & deposits", offsetDays: -10 },
    { id: "t-7-ros", label: "Run-of-show + vendor contacts", offsetDays: -7 },
    { id: "t-2-setup", label: "Finalize setup & rentals", offsetDays: -2 },
    { id: "t0-event", label: "Event day", offsetDays: 0 },
    { id: "t+1-thanks", label: "Thank-you notes & photo share", offsetDays: 1 },
  ],
} as const;
