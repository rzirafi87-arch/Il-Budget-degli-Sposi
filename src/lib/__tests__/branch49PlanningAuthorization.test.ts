import fs from "node:fs";
import path from "node:path";

jest.mock("@/lib/apiAuth", () => ({ requireUser: jest.fn() }));
jest.mock("@/lib/currentEvent", () => {
  class CurrentEventError extends Error {
    readonly status: "NO_EVENT" | "SELECTION_REQUIRED";
    constructor(mockStatus: "NO_EVENT" | "SELECTION_REQUIRED") {
      super(mockStatus);
      this.status = mockStatus;
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
import { CurrentEventError, requireCurrentEvent } from "@/lib/currentEvent";
import {
  PLANNING_SELECTION_PERMISSIONS,
  planningSelectionErrorResponse,
  requirePlanningSelectionAccess,
} from "@/lib/planningSelectionAuthorization";
import type { CurrentEventContext } from "@/lib/currentEvent";
import type { NextRequest } from "next/server";

const mockedRequireUser = jest.mocked(requireUser);
const mockedRequireCurrentEvent = jest.mocked(requireCurrentEvent);
const request = {} as NextRequest;

function context(accessRole: CurrentEventContext["accessRole"]): CurrentEventContext {
  return {
    id: "49000000-0000-4000-8000-000000000001",
    eventId: "49000000-0000-4000-8000-000000000001",
    ownerId: "49000000-0000-4000-8000-000000000002",
    name: "Branch 49",
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

describe("Branch 49 planning-selection authorization", () => {
  beforeEach(() => jest.clearAllMocks());

  it.each(["owner", "partner", "legacy"] as const)(
    "makes the existing shared-planning permission explicit for %s",
    async (accessRole) => {
      mockedRequireUser.mockResolvedValue({ userId: "user-49" });
      mockedRequireCurrentEvent.mockResolvedValue(context(accessRole));

      expect(PLANNING_SELECTION_PERMISSIONS[accessRole]).toEqual({ read: true, mutate: true });
      await expect(requirePlanningSelectionAccess(request, "read")).resolves.toMatchObject({ currentEvent: { accessRole } });
      await expect(requirePlanningSelectionAccess(request, "mutate")).resolves.toMatchObject({ currentEvent: { accessRole } });
      expect(mockedRequireCurrentEvent).toHaveBeenCalledWith(request, "user-49");
    },
  );

  it("returns a stable 401 contract before event resolution when authentication fails", async () => {
    mockedRequireUser.mockRejectedValue(new Error("invalid jwt"));
    let error: unknown;
    try { await requirePlanningSelectionAccess(request, "read"); } catch (cause) { error = cause; }
    const response = planningSelectionErrorResponse(error);
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "AUTHENTICATION_REQUIRED" });
    expect(mockedRequireCurrentEvent).not.toHaveBeenCalled();
  });

  it.each([
    ["NO_EVENT", 404, "NO_EVENT"],
    ["SELECTION_REQUIRED", 409, "EVENT_SELECTION_REQUIRED"],
  ] as const)("preserves the %s current-event contract", async (status, httpStatus, code) => {
    mockedRequireUser.mockResolvedValue({ userId: "user-49" });
    mockedRequireCurrentEvent.mockRejectedValue(new CurrentEventError(status));
    let error: unknown;
    try { await requirePlanningSelectionAccess(request, "mutate"); } catch (cause) { error = cause; }
    const response = planningSelectionErrorResponse(error);
    expect(response.status).toBe(httpStatus);
    await expect(response.json()).resolves.toEqual({ error: code });
  });

  it("does not expose unexpected service or database errors", async () => {
    const response = planningSelectionErrorResponse(new Error("sensitive database detail"));
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "PLANNING_SELECTION_FAILED" });
  });
});

describe("Branch 49 planning route contracts", () => {
  const routes = [
    "src/app/api/my/churches/route.ts",
    "src/app/api/my/locations/route.ts",
    "src/app/api/my/suppliers/route.ts",
  ];

  it.each(routes)("%s authorizes reads and every mutation explicitly", (relativePath) => {
    const source = fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
    expect(source).toContain('requirePlanningSelectionAccess(req, "read")');
    expect(source.match(/requirePlanningSelectionAccess\(req, "mutate"\)/g)).toHaveLength(3);
    expect(source).toContain('.eq("event_id", eventId)');
    expect(source).not.toMatch(/body\.event_id|searchParams\.get\(["']event_id/);
  });

  it("keeps the read model authenticated and current-event scoped", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "src/app/api/my/planning-selections/route.ts"), "utf8");
    expect(source).toContain('requirePlanningSelectionAccess(req, "read")');
    expect(source).toContain('.eq("event_id", event.id)');
    expect(source).not.toMatch(/body\.event_id|searchParams\.get\(["']event_id/);
  });

  it("uses generated database types for every insert and update payload", () => {
    const contracts = fs.readFileSync(path.join(process.cwd(), "src/lib/planningSelectionContracts.ts"), "utf8");
    expect(contracts).toContain('Database["public"]["Tables"]');
    for (const entity of ["Church", "Location", "Supplier"]) {
      expect(contracts).toContain(`Saved${entity}Insert`);
      expect(contracts).toContain(`Saved${entity}Update`);
    }
  });
});
