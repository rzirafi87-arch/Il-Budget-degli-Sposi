import type { Database } from "@/types/database.types";

type Tables = Database["public"]["Tables"];

export type SavedChurchRow = Tables["saved_churches"]["Row"];
export type SavedChurchInsert = Pick<Tables["saved_churches"]["Insert"], "event_id" | "church_id">;
export type SavedChurchUpdate = Pick<
  Tables["saved_churches"]["Update"],
  "favorite" | "contacted" | "selected" | "status" | "personal_notes" | "personal_contact_notes" | "quoted_price"
>;

export type SavedLocationRow = Tables["saved_locations"]["Row"];
export type SavedLocationInsert = Pick<Tables["saved_locations"]["Insert"], "event_id" | "location_id" | "location_role">;
export type SavedLocationUpdate = Pick<
  Tables["saved_locations"]["Update"],
  | "favorite"
  | "contacted"
  | "visited"
  | "shortlisted"
  | "selected"
  | "status"
  | "location_role"
  | "personal_notes"
  | "contact_notes"
  | "quote_amount"
  | "agreed_cost"
  | "quote_currency"
>;

export type SavedSupplierRow = Tables["saved_suppliers"]["Row"];
export type SavedSupplierInsert = Pick<Tables["saved_suppliers"]["Insert"], "event_id" | "supplier_id">;
export type SavedSupplierUpdate = Pick<
  Tables["saved_suppliers"]["Update"],
  | "status"
  | "favorite"
  | "deposit_paid"
  | "contract_signed"
  | "personal_notes"
  | "contact_notes"
  | "quote_amount"
  | "agreed_amount"
  | "deposit_amount"
  | "balance_amount"
  | "currency"
>;
