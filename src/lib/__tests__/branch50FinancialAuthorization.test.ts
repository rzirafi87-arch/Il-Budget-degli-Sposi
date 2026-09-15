import fs from "node:fs";
import path from "node:path";

jest.mock("@/lib/apiAuth", () => ({ requireUser: jest.fn() }));
jest.mock("@/lib/currentEvent", () => {
  class CurrentEventError extends Error {
    readonly status: "NO_EVENT" | "SELECTION_REQUIRED";
    constructor(status: "NO_EVENT" | "SELECTION_REQUIRED") {
      super(status);
      this.status = status;
    }
  }
  return {
    CurrentEventError,
    requireCurrentEvent: jest.fn(),
    currentEventErrorResponse: (error: unknown) => error instanceof CurrentEventError
      ? error.status === "NO_EVENT"
        ? { error: "NO_EVENT", status: 404 }
        : { error: "EVENT_SELECTION_REQUIRED", status: 409 }
      : null,
  };
});

import { requireUser } from "@/lib/apiAuth";
import type { CurrentEventContext } from "@/lib/currentEvent";
import { CurrentEventError, requireCurrentEvent } from "@/lib/currentEvent";
import {
  FINANCIAL_PERMISSIONS,
  financialErrorResponse,
  requireFinancialAccess,
  requireSameEventSavedSupplier,
} from "@/lib/financialAuthorization";
import {
  FinancialContractError,
  parseBudgetItemCreate,
  parseExpenseCreate,
} from "@/lib/financialContracts";
import type { getServiceClient } from "@/lib/supabaseServer";
import type { NextRequest } from "next/server";

const mockedRequireUser = jest.mocked(requireUser);
const mockedRequireCurrentEvent = jest.mocked(requireCurrentEvent);
const request = {} as NextRequest;

function context(accessRole: CurrentEventContext["accessRole"]): CurrentEventContext {
  return {
    id: "50000000-0000-4000-8000-000000000001",
    eventId: "50000000-0000-4000-8000-000000000001",
    ownerId: "50000000-0000-4000-8000-000000000002",
    name: "Branch 50",
    eventType: "wedding",
    date: null,
    locale: "it",
    country: "IT",
    capability: {} as CurrentEventContext["capability"],
    accessRole,
    source: "cookie",
    valid: true,
  };
}

describe("Branch 50 financial authorization", () => {
  beforeEach(() => jest.clearAllMocks());

  it.each(["owner", "partner", "legacy"] as const)(
    "makes existing shared-event financial permissions explicit for %s",
    async (accessRole) => {
      mockedRequireUser.mockResolvedValue({ userId: "user-50" });
      mockedRequireCurrentEvent.mockResolvedValue(context(accessRole));
      expect(FINANCIAL_PERMISSIONS[accessRole]).toEqual({ read: true, mutate: true });
      await expect(requireFinancialAccess(request, "read")).resolves.toMatchObject({
        currentEvent: { accessRole },
      });
      await expect(requireFinancialAccess(request, "mutate")).resolves.toMatchObject({
        currentEvent: { accessRole },
      });
      expect(mockedRequireCurrentEvent).toHaveBeenCalledWith(request, "user-50");
    },
  );

  it("returns 401 before event resolution when authentication fails", async () => {
    mockedRequireUser.mockRejectedValue(new Error("invalid token"));
    let error: unknown;
    try { await requireFinancialAccess(request, "read"); } catch (cause) { error = cause; }
    const response = financialErrorResponse(error);
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "AUTHENTICATION_REQUIRED" });
    expect(mockedRequireCurrentEvent).not.toHaveBeenCalled();
  });

  it.each([
    ["NO_EVENT", 404, "NO_EVENT"],
    ["SELECTION_REQUIRED", 409, "EVENT_SELECTION_REQUIRED"],
  ] as const)("preserves the %s current-event contract", async (status, httpStatus, code) => {
    mockedRequireUser.mockResolvedValue({ userId: "user-50" });
    mockedRequireCurrentEvent.mockRejectedValue(new CurrentEventError(status));
    let error: unknown;
    try { await requireFinancialAccess(request, "mutate"); } catch (cause) { error = cause; }
    const response = financialErrorResponse(error);
    expect(response.status).toBe(httpStatus);
    await expect(response.json()).resolves.toEqual({ error: code });
  });

  it("does not expose unexpected service or database errors", async () => {
    const response = financialErrorResponse(new Error("sensitive database detail"));
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "FINANCIAL_OPERATION_FAILED" });
  });
});

describe("Branch 50 same-event supplier guard", () => {
  function client(result: { data: { id: string } | null; error: { code: string } | null }) {
    const maybeSingle = jest.fn().mockResolvedValue(result);
    const secondEq = jest.fn(() => ({ maybeSingle }));
    const firstEq = jest.fn(() => ({ eq: secondEq }));
    const select = jest.fn(() => ({ eq: firstEq }));
    const from = jest.fn(() => ({ select }));
    return {
      db: { from } as unknown as ReturnType<typeof getServiceClient>,
      from,
      firstEq,
      secondEq,
      maybeSingle,
    };
  }

  it("accepts only a saved supplier in the authoritative current event", async () => {
    const mock = client({ data: { id: "saved-50" }, error: null });
    await expect(
      requireSameEventSavedSupplier(mock.db, "event-50", "saved-50"),
    ).resolves.toBeUndefined();
    expect(mock.from).toHaveBeenCalledWith("saved_suppliers");
    expect(mock.firstEq).toHaveBeenCalledWith("id", "saved-50");
    expect(mock.secondEq).toHaveBeenCalledWith("event_id", "event-50");
  });

  it("returns a stable 404 for a foreign or missing saved supplier before mutation", async () => {
    const mock = client({ data: null, error: null });
    let error: unknown;
    try {
      await requireSameEventSavedSupplier(mock.db, "event-a", "supplier-from-event-b");
    } catch (cause) {
      error = cause;
    }
    const response = financialErrorResponse(error);
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "SAVED_SUPPLIER_NOT_FOUND" });
  });

  it("returns a stable 500 without leaking lookup errors", async () => {
    const mock = client({ data: null, error: { code: "XX000" } });
    let error: unknown;
    try { await requireSameEventSavedSupplier(mock.db, "event-a", "saved-a"); } catch (cause) { error = cause; }
    const response = financialErrorResponse(error);
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "SAVED_SUPPLIER_LOOKUP_FAILED" });
  });
});

describe("Branch 50 typed financial contracts", () => {
  it("builds an allowlisted budget-item payload and ignores request-controlled event_id", () => {
    expect(parseBudgetItemCreate({
      name: "Fotografo",
      country_code: "IT",
      amount: 2500,
      saved_supplier_id: "saved-50",
      event_id: "foreign-event",
      injected: "not allowed",
    })).toEqual({
      name: "Fotografo",
      country_code: "IT",
      amount: 2500,
      canonical_key: undefined,
      saved_supplier_id: "saved-50",
      source: undefined,
      spend_type: undefined,
      tradition_id: undefined,
      vendor_id: undefined,
    });
  });

  it("rejects invalid financial amounts and malformed expense contracts", () => {
    expect(() => parseBudgetItemCreate({ name: "X", country_code: "IT", amount: -1 }))
      .toThrow(FinancialContractError);
    expect(() => parseExpenseCreate({
      category: "Foto",
      subcategory: "Servizio",
      supplier: "",
      description: "",
      amount: Number.NaN,
      spendType: "common",
      status: "pending",
      date: "not-a-date",
      notes: "",
      fromDashboard: false,
    })).toThrow(FinancialContractError);
  });

  it("accepts the current expense contract without introducing supplier linking yet", () => {
    expect(parseExpenseCreate({
      category: "Foto",
      subcategory: "Servizio",
      supplier: "Studio",
      description: "Contratto",
      amount: 1500,
      spendType: "common",
      status: "pending",
      date: "2026-09-15",
      notes: "",
      fromDashboard: false,
    })).toMatchObject({ category: "Foto", amount: 1500, status: "pending" });
  });
});

describe("Branch 50 route boundaries", () => {
  const read = (relativePath: string) =>
    fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");

  it.each([
    "src/app/api/budget-items/route.ts",
    "src/app/api/my/expenses/route.ts",
  ])("%s authorizes authenticated reads and every mutation explicitly", (relativePath) => {
    const source = read(relativePath);
    expect(source).toContain('requireFinancialAccess(req, "read")');
    expect(source).toContain('requireFinancialAccess(req, "mutate")');
    expect(source).not.toMatch(/body\.event_id|input\.event_id/);
    expect(source).not.toMatch(/error\.message\s*}/);
  });

  it("guards every budget saved-supplier reference before insertion", () => {
    const source = read("src/app/api/budget-items/route.ts");
    expect(source).toContain("requireSameEventSavedSupplier");
    expect(source.indexOf("requireSameEventSavedSupplier"))
      .toBeLessThan(source.indexOf('.from("budget_items").insert'));
  });

  it("derives insert contracts from generated Supabase types", () => {
    const source = read("src/lib/financialContracts.ts");
    expect(source).toContain('Database["public"]["Tables"]');
    expect(source).toContain('Tables["budget_items"]["Insert"]');
    expect(source).toContain('Tables["expenses"]["Insert"]');
  });
});
