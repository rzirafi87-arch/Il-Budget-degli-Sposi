import type { Currency } from "@/lib/types";

export type EventCategory = {
  id: string;
  label: string;
};

export type EventSection = {
  id: string;
  label: string;
  categories: EventCategory[];
};

export type EventTimelineItem = {
  id: string;
  label: string;
  offsetDays: number;
};

export type EventMeta = {
  key: string;
  name: string;
  defaultCurrency: Currency;
  sections: EventSection[];
  timeline: EventTimelineItem[];
};
