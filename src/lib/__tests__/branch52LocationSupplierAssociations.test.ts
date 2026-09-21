import {
  LOCATION_SUPPLIER_RELATIONSHIP_TYPES,
  parseGlobalAssociationFilter,
  parsePrivateAssociationCreate,
  parsePrivateAssociationFilter,
  parsePrivateAssociationUpdate,
  resolvePrivateAssociation,
} from "@/lib/locationSupplierAssociationContracts";

const locationId = "52310000-0000-4000-8000-000000000001";
const supplierId = "52310000-0000-4000-8000-000000000002";

describe("Branch 52 M3 Location-Supplier contracts", () => {
  it.each([
    ["saved", "saved"],
    ["saved", "private"],
    ["private", "saved"],
    ["private", "private"],
  ] as const)("accepts the %s location to %s supplier combination", (locationScope, supplierScope) => {
    expect(parsePrivateAssociationCreate({
      location: { scope: locationScope, resource_id: locationId },
      supplier: { scope: supplierScope, resource_id: supplierId },
      relationship_type: "recommended",
      private_notes: "  note  ",
    })).toEqual({
      ok: true,
      value: {
        location: { scope: locationScope, resource_id: locationId },
        supplier: { scope: supplierScope, resource_id: supplierId },
        relationshipType: "recommended",
        privateNotes: "note",
      },
    });
  });

  it.each(LOCATION_SUPPLIER_RELATIONSHIP_TYPES)("accepts relationship type %s", (relationshipType) => {
    expect(parsePrivateAssociationCreate({
      location: { scope: "saved", resource_id: locationId },
      supplier: { scope: "private", resource_id: supplierId },
      relationship_type: relationshipType,
    }).ok).toBe(true);
  });

  it("rejects event, owner, creator and malformed endpoint manipulation", () => {
    for (const forbidden of ["event_id", "owner_id", "created_by"]) {
      expect(parsePrivateAssociationCreate({
        location: { scope: "saved", resource_id: locationId },
        supplier: { scope: "saved", resource_id: supplierId },
        relationship_type: "recommended",
        [forbidden]: locationId,
      })).toEqual({ ok: false, error: "INVALID_ASSOCIATION_PAYLOAD" });
    }
    expect(parsePrivateAssociationCreate({
      location: { scope: "saved", resource_id: "not-a-uuid" },
      supplier: { scope: "saved", resource_id: supplierId },
      relationship_type: "recommended",
    })).toEqual({ ok: false, error: "INVALID_ASSOCIATION_ENDPOINT" });
  });

  it("allowlists updates and limits private notes", () => {
    expect(parsePrivateAssociationUpdate({ resource_id: locationId, relationship_type: "works_at", private_notes: "ok" }).ok).toBe(true);
    expect(parsePrivateAssociationUpdate({ resource_id: locationId, saved_supplier_id: supplierId })).toEqual({ ok: false, error: "INVALID_ASSOCIATION_PAYLOAD" });
    expect(parsePrivateAssociationUpdate({ resource_id: locationId, private_notes: "x".repeat(4001) })).toEqual({ ok: false, error: "PRIVATE_NOTES_TOO_LONG" });
  });

  it("requires UUID filters and an explicit global side", () => {
    expect(parseGlobalAssociationFilter(new URLSearchParams())).toEqual({ ok: false, error: "ASSOCIATION_FILTER_REQUIRED" });
    expect(parseGlobalAssociationFilter(new URLSearchParams({ location_id: locationId })).ok).toBe(true);
    expect(parsePrivateAssociationFilter(new URLSearchParams({ endpoint_type: "saved_location" }))).toEqual({ ok: false, error: "INVALID_ASSOCIATION_FILTER" });
    expect(parsePrivateAssociationFilter(new URLSearchParams({ endpoint_type: "saved_location", endpoint_id: locationId })).ok).toBe(true);
  });

  it("resolves saved snapshots and private-only records without mutating either", () => {
    const row = {
      id: "52310000-0000-4000-8000-000000000003",
      event_id: "52310000-0000-4000-8000-000000000004",
      saved_location_id: locationId,
      private_location_id: null,
      saved_supplier_id: null,
      private_supplier_id: supplierId,
      relationship_type: "recommended",
      private_notes: "event note",
      created_at: "2026-09-19T00:00:00Z",
      updated_at: "2026-09-19T00:00:00Z",
      saved_location: {
        id: locationId,
        location_id: "52310000-0000-4000-8000-000000000005",
        catalog_snapshot: { name: "Snapshot venue" },
        private_overrides: { name: "Private venue name" },
        location: { name: "Changed global venue" },
      },
      private_supplier: {
        id: supplierId,
        entity_type: "supplier",
        snapshot_data: { name: "Private supplier snapshot" },
        override_data: { phone: "+39 1" },
      },
    };
    expect(resolvePrivateAssociation(row)).toMatchObject({
      location: { scope: "saved", name: "Private venue name" },
      supplier: { scope: "private", name: "Private supplier snapshot" },
      relationshipType: "recommended",
      privateNotes: "event note",
    });
    expect(row.saved_location.catalog_snapshot).toEqual({ name: "Snapshot venue" });
  });
});
