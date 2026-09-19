import fs from "node:fs";
import path from "node:path";
import {
  isUuid,
  parseCreateSupplierPayload,
  parseSavedSupplierMutation,
  SAVED_SUPPLIER_COLUMNS,
  SUPPLIER_DETAIL_COLUMNS,
} from "@/lib/supplierContracts";

const supplierId = "52000000-0000-4000-8000-000000000001";
const resourceId = "52000000-0000-4000-8000-000000000002";

describe("Branch 52 M1 supplier contracts", () => {
  it("accepts canonical UUIDs and rejects malformed identifiers", () => {
    expect(isUuid(supplierId)).toBe(true);
    expect(isUuid("supplier-52")).toBe(false);
    expect(isUuid(null)).toBe(false);
  });

  it("allows only a supplier UUID when creating event state", () => {
    expect(parseCreateSupplierPayload({ supplier_id: supplierId })).toEqual({
      ok: true,
      value: { supplier_id: supplierId },
    });
    expect(parseCreateSupplierPayload({ supplier_id: supplierId, event_id: resourceId })).toEqual({
      ok: false,
      error: "INVALID_SUPPLIER_PAYLOAD",
    });
    expect(parseCreateSupplierPayload({ supplier_id: supplierId, owner_id: resourceId }).ok).toBe(false);
  });

  it("validates resource id, enum, lengths, money and currency", () => {
    expect(parseSavedSupplierMutation({
      resource_id: resourceId,
      status: "SELECTED",
      personal_notes: "  scelta condivisa  ",
      quote_amount: 2500,
      currency: "eur",
    })).toEqual({
      ok: true,
      value: {
        resourceId,
        update: {
          status: "SELECTED",
          personal_notes: "scelta condivisa",
          quote_amount: 2500,
          currency: "EUR",
        },
      },
    });
    expect(parseSavedSupplierMutation({ resource_id: resourceId, status: "ADMIN" })).toEqual({
      ok: false,
      error: "INVALID_SUPPLIER_STATUS",
    });
    expect(parseSavedSupplierMutation({ resource_id: resourceId, personal_notes: "x".repeat(4001) }).ok).toBe(false);
    expect(parseSavedSupplierMutation({ resource_id: resourceId, quote_amount: -1 }).ok).toBe(false);
    expect(parseSavedSupplierMutation({ resource_id: resourceId, currency: "EURO" }).ok).toBe(false);
    expect(parseSavedSupplierMutation({ resource_id: resourceId, event_id: supplierId }).ok).toBe(false);
    expect(parseSavedSupplierMutation({ resource_id: resourceId, owner_id: supplierId }).ok).toBe(false);
  });

  it("projects only generated supplier and saved-supplier fields", () => {
    expect(SUPPLIER_DETAIL_COLUMNS).not.toEqual(expect.arrayContaining(["photo_urls", "video_urls", "discount_info"]));
    expect(SAVED_SUPPLIER_COLUMNS).toEqual(expect.arrayContaining(["event_id", "supplier_id", "personal_notes"]));
  });

  it("contains no wildcard projection or untyped escape in M1 routes", () => {
    for (const relative of [
      "src/app/api/suppliers/[id]/route.ts",
      "src/app/api/my/suppliers/route.ts",
    ]) {
      const source = fs.readFileSync(path.join(process.cwd(), relative), "utf8");
      expect(source).not.toMatch(/select\(["']\*["']\)/);
      expect(source).not.toMatch(/\bas any\b/);
    }
  });

  it("keeps private writes event-scoped and ignores client event ownership", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "src/app/api/my/suppliers/route.ts"), "utf8");
    expect(source).toContain('requirePlanningSelectionAccess(req, "read")');
    expect(source.match(/requirePlanningSelectionAccess\(req, "mutate"\)/g)).toHaveLength(3);
    expect(source).toContain('.eq("id", parsed.value.resourceId).eq("event_id", currentEvent.eventId)');
    expect(source).not.toMatch(/body\.event_id|body\.owner_id/);
  });

  it("renders real schema fields and explicit loading, empty, error and retry states", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "src/app/[locale]/(routes)/fornitori/[id]/page.tsx"),
      "utf8",
    );
    expect(source).toContain('kind: "loading"');
    expect(source).toContain('kind: "not-found"');
    expect(source).toContain('kind: "error"');
    expect(source).toContain('t("retry")');
    expect(source).not.toMatch(/photo_urls|video_urls|discount_info/);
  });
});
