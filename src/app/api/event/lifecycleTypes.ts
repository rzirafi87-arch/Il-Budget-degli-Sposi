import type { Database } from "@/types/database.types";
export type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
export type EventUpdate = Database["public"]["Tables"]["events"]["Update"];
export type WeddingCardInsert = Database["public"]["Tables"]["wedding_cards"]["Insert"];
export type WeddingCardUpdate = Database["public"]["Tables"]["wedding_cards"]["Update"];
export type EventCreateBody = {
  eventType?: unknown;
  country?: unknown;
  language?: unknown;
  createAdditional?: unknown;
};
export type EventUpdateBody = {
  name?: unknown; currency?: unknown; total_budget?: unknown;
  wedding_card?: { bride_name?: unknown; groom_name?: unknown; wedding_date?: unknown } | null;
};
