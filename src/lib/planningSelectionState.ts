export type PlanningEntity = "church" | "location" | "supplier";
export type CanonicalPlanningState = "saved" | "considering" | "selected" | "rejected";
export type PlanningDecisionState = "undecided" | "selected";

type StoredSelection = { status: string; selected?: boolean };

const CONSIDERING_STATUSES = new Set([
  "considering",
  "contacted",
  "visited",
  "shortlisted",
  "discovered",
  "quote_requested",
  "quote_received",
]);

export function canonicalPlanningState(entity: PlanningEntity, row: StoredSelection): CanonicalPlanningState {
  const status = row.status.trim().toLowerCase();
  if (row.selected === true || status === "selected") return "selected";
  if (status === "discarded" || status === "rejected") return "rejected";
  if (entity === "supplier" && status === "saved") return "saved";
  if (CONSIDERING_STATUSES.has(status)) return "considering";
  return "saved";
}

export function withCanonicalPlanningState<T extends StoredSelection>(
  entity: PlanningEntity,
  row: T,
): T & { planning_state: CanonicalPlanningState } {
  return { ...row, planning_state: canonicalPlanningState(entity, row) };
}

export function planningDecisionState(entity: PlanningEntity, rows: StoredSelection[]): PlanningDecisionState {
  return rows.some((row) => canonicalPlanningState(entity, row) === "selected")
    ? "selected"
    : "undecided";
}

export function normalizeBooleanSelectionMutation(
  input: Record<string, unknown>,
  fallbackStatus: "considering",
): { selected?: boolean; status?: string } {
  const selected = typeof input.selected === "boolean" ? input.selected : undefined;
  const rawStatus = typeof input.status === "string" ? input.status : undefined;
  const status = rawStatus?.toLowerCase();

  if (status === "discarded") return { selected: false, status };
  if (selected === false) {
    return { selected: false, status: !status || status === "selected" ? fallbackStatus : rawStatus };
  }
  if (selected === true || status === "selected") return { selected: true, status: "selected" };
  return { selected, status: rawStatus };
}
