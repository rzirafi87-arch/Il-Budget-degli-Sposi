import {
  parseAppointmentCreatePayload,
  parseAppointmentUpdatePayload,
  parseSupplierFilter,
  parseSupplierReference,
  parseTimelineCreatePayload,
  parseTimelineUpdatePayload,
  supplierReferenceColumns,
} from "@/lib/supplierWorkContracts";

const savedSupplier = "52400000-0000-4000-8000-000000000001";
const privateSupplier = "52400000-0000-4000-8000-000000000002";
const timelineId = "52400000-0000-4000-8000-000000000003";
const clientKey = "52400000-0000-4000-8000-000000000004";

describe("Branch 52 M4 supplier work contracts", () => {
  it.each([
    [{ scope: "saved", resource_id: savedSupplier }, "saved"],
    [{ scope: "private", resource_id: privateSupplier }, "private"],
    [null, null],
  ] as const)("accepts optional supplier reference %#", (input, expectedScope) => {
    const result = parseSupplierReference(input);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value?.scope ?? null).toBe(expectedScope);
  });

  it("rejects malformed, cross-field and authority payloads before database access", () => {
    expect(parseSupplierReference({ scope: "global", resource_id: savedSupplier })).toEqual({ ok: false, error: "INVALID_SUPPLIER_LINK" });
    expect(parseSupplierReference({ scope: "saved", resource_id: "not-a-uuid" })).toEqual({ ok: false, error: "INVALID_SUPPLIER_LINK" });
    expect(parseTimelineCreatePayload({ title: "Task", event_id: savedSupplier })).toEqual({ ok: false, error: "INVALID_TIMELINE_PAYLOAD" });
    expect(parseTimelineUpdatePayload({ id: timelineId, owner_id: savedSupplier, supplier: null })).toEqual({ ok: false, error: "INVALID_TIMELINE_PAYLOAD" });
    expect(parseAppointmentCreatePayload({ title: "Call", date: "2026-09-30", event_id: savedSupplier })).toEqual({ ok: false, error: "INVALID_APPOINTMENT_PAYLOAD" });
  });

  it("parses Timeline create, update, unlink and legacy month conversion", () => {
    const create = parseTimelineCreatePayload({
      title: "  Firma contratto  ",
      client_key: clientKey,
      monthsBefore: 2,
      supplier: { scope: "saved", resource_id: savedSupplier },
    });
    expect(create).toMatchObject({ ok: true, value: [{ client_key: clientKey, title: "Firma contratto", days_before: 60, supplier: { scope: "saved" } }] });
    expect(parseTimelineUpdatePayload({ id: timelineId, supplier: null })).toEqual({
      ok: true,
      value: { resourceId: timelineId, update: {}, supplier: null },
    });
    expect(parseTimelineUpdatePayload({ id: timelineId })).toEqual({ ok: false, error: "EMPTY_TIMELINE_UPDATE" });
  });

  it("parses appointment creation and supplier-only updates while preserving optional links", () => {
    expect(parseAppointmentCreatePayload({
      title: "  Sopralluogo  ",
      client_key: clientKey,
      date: "2026-10-01",
      supplier: { scope: "private", resource_id: privateSupplier },
    })).toMatchObject({ ok: true, value: { client_key: clientKey, title: "Sopralluogo", appointment_date: "2026-10-01", supplier: { scope: "private" } } });
    expect(parseAppointmentUpdatePayload({ supplier: null })).toEqual({ ok: true, value: { update: {}, supplier: null } });
    expect(parseAppointmentCreatePayload({ title: "Bad", date: "2026-02-30" })).toEqual({ ok: false, error: "APPOINTMENT_REQUIRED_FIELDS" });
  });

  it("requires paired supplier filters and maps exactly one database endpoint", () => {
    expect(parseSupplierFilter(new URLSearchParams())).toEqual({ ok: true, value: null });
    expect(parseSupplierFilter(new URLSearchParams({ supplier_scope: "saved", supplier_resource_id: savedSupplier }))).toEqual({
      ok: true,
      value: { scope: "saved", resourceId: savedSupplier },
    });
    expect(parseSupplierFilter(new URLSearchParams({ supplier_scope: "saved" }))).toEqual({ ok: false, error: "INVALID_SUPPLIER_FILTER" });
    expect(supplierReferenceColumns({ scope: "saved", resource_id: savedSupplier })).toEqual({ saved_supplier_id: savedSupplier, private_supplier_id: null });
    expect(supplierReferenceColumns({ scope: "private", resource_id: privateSupplier })).toEqual({ saved_supplier_id: null, private_supplier_id: privateSupplier });
    expect(supplierReferenceColumns(null)).toEqual({ saved_supplier_id: null, private_supplier_id: null });
  });

  it("caps batch size, text length, dates and numeric ranges", () => {
    expect(parseTimelineCreatePayload([])).toEqual({ ok: false, error: "INVALID_TIMELINE_PAYLOAD" });
    expect(parseTimelineCreatePayload({ title: "x".repeat(201) })).toEqual({ ok: false, error: "TIMELINE_TITLE_REQUIRED" });
    expect(parseTimelineCreatePayload({ title: "Task", days_before: -1 })).toEqual({ ok: false, error: "INVALID_TIMELINE_PAYLOAD" });
    expect(parseAppointmentCreatePayload({ title: "Call", date: "not-a-date" })).toEqual({ ok: false, error: "APPOINTMENT_REQUIRED_FIELDS" });
    expect(parseAppointmentCreatePayload({ title: "Call", date: "2026-09-30", client_key: "bad" })).toEqual({ ok: false, error: "INVALID_CLIENT_KEY" });
    expect(parseTimelineCreatePayload([
      { title: "One", client_key: clientKey },
      { title: "Two", client_key: clientKey },
    ])).toEqual({ ok: false, error: "DUPLICATE_CLIENT_KEY" });
  });
});
