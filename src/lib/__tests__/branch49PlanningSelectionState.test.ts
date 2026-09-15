import {
  canonicalPlanningState,
  normalizeBooleanSelectionMutation,
  planningDecisionState,
  withCanonicalPlanningState,
} from "@/lib/planningSelectionState";

describe("Branch 49 canonical planning-selection state", () => {
  it.each([
    ["church", { status: "considering", selected: false }, "considering"],
    ["church", { status: "selected", selected: true }, "selected"],
    ["church", { status: "discarded", selected: false }, "rejected"],
    ["location", { status: "visited", selected: false }, "considering"],
    ["location", { status: "shortlisted", selected: false }, "considering"],
    ["supplier", { status: "SAVED" }, "saved"],
    ["supplier", { status: "DISCOVERED" }, "considering"],
    ["supplier", { status: "QUOTE_REQUESTED" }, "considering"],
    ["supplier", { status: "QUOTE_RECEIVED" }, "considering"],
    ["supplier", { status: "SELECTED" }, "selected"],
    ["supplier", { status: "REJECTED" }, "rejected"],
  ] as const)("normalizes %s %j to %s", (entity, row, expected) => {
    expect(canonicalPlanningState(entity, row)).toBe(expected);
  });

  it("preserves the stored row while adding its API-only canonical state", () => {
    const row = { id: "saved-49", status: "contacted", selected: false };
    expect(withCanonicalPlanningState("church", row)).toEqual({ ...row, planning_state: "considering" });
    expect(row).toEqual({ id: "saved-49", status: "contacted", selected: false });
  });

  it("uses undecided only as an aggregate decision state", () => {
    expect(planningDecisionState("church", [])).toBe("undecided");
    expect(planningDecisionState("location", [{ status: "shortlisted", selected: false }])).toBe("undecided");
    expect(planningDecisionState("supplier", [{ status: "SELECTED" }])).toBe("selected");
  });

  it.each([
    [{ selected: true }, { selected: true, status: "selected" }],
    [{ status: "selected" }, { selected: true, status: "selected" }],
    [{ selected: false }, { selected: false, status: "considering" }],
    [{ selected: false, status: "selected" }, { selected: false, status: "considering" }],
    [{ status: "discarded" }, { selected: false, status: "discarded" }],
    [{ selected: false, status: "shortlisted" }, { selected: false, status: "shortlisted" }],
  ] as const)("normalizes boolean selection mutation %j", (input, expected) => {
    expect(normalizeBooleanSelectionMutation(input, "considering")).toEqual(expected);
  });
});
