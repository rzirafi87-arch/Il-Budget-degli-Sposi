jest.mock("@/lib/apiAuth", () => ({ requireUser: jest.fn() }));
jest.mock("@/lib/currentEvent", () => {
  const actual = jest.requireActual("@/lib/currentEvent");
  return { ...actual, resolveCurrentEvent: jest.fn() };
});

import { requireUser } from "@/lib/apiAuth";
import { resolveCurrentEvent } from "@/lib/currentEvent";
import {
  ApiSecurityError,
  parseUuid,
  requireEventAccess,
  requireSession,
} from "@/lib/apiSecurity";
import { NextRequest } from "next/server";

const mockedRequireUser = jest.mocked(requireUser);
const mockedResolve = jest.mocked(resolveCurrentEvent);
const ownerId = "51000000-0000-4000-8000-000000000001";
const eventId = "51000000-0000-4000-8000-000000000002";

const request = () => new NextRequest("http://localhost/api/test");
const resolved = (accessRole: "owner" | "partner" | "legacy", resolvedOwner = ownerId) => ({
  status: "RESOLVED" as const,
  currentEvent: {
    id: eventId,
    eventId,
    ownerId: resolvedOwner,
    name: "Event",
    eventType: "wedding",
    date: null,
    locale: "it",
    country: "IT",
    capability: {} as never,
    accessRole,
    source: "explicit" as const,
    valid: true as const,
  },
  events: [],
  staleSelection: false,
});

describe("Branch 51 canonical API authorization", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockedRequireUser.mockResolvedValue({ userId: ownerId });
  });

  it("normalizes absent and invalid sessions to 401", async () => {
    mockedRequireUser.mockRejectedValue(new Error("Invalid JWT"));
    await expect(requireSession(request())).rejects.toMatchObject({
      code: "AUTHENTICATION_REQUIRED",
      status: 401,
    });
  });

  it("accepts owner and active partner for collaborative event access", async () => {
    for (const role of ["owner", "partner"] as const) {
      mockedResolve.mockResolvedValueOnce(resolved(role));
      await expect(requireEventAccess(request(), "owner-or-partner", eventId))
        .resolves.toMatchObject({ currentEvent: { eventId, accessRole: role } });
    }
  });

  it("does not treat a partner as owner for owner-only operations", async () => {
    mockedResolve.mockResolvedValue(resolved("partner", "51000000-0000-4000-8000-000000000099"));
    await expect(requireEventAccess(request(), "owner-only", eventId)).rejects.toMatchObject({
      code: "OWNER_REQUIRED",
      status: 403,
    });
  });

  it.each(["NO_EVENT", "SELECTION_REQUIRED"] as const)(
    "hides an explicit inaccessible event as 404 (%s)",
    async (status) => {
      mockedResolve.mockResolvedValue({ status, currentEvent: null, events: [], staleSelection: true });
      await expect(requireEventAccess(request(), "owner-or-partner", eventId)).rejects.toMatchObject({
        code: "EVENT_NOT_FOUND",
        status: 404,
      });
    },
  );

  it("passes only the explicit event id to the authoritative resolver", async () => {
    mockedResolve.mockResolvedValue(resolved("owner"));
    await requireEventAccess(request(), "owner-only", eventId);
    expect(mockedResolve).toHaveBeenCalledWith(expect.any(NextRequest), ownerId, { explicitEventId: eventId });
  });

  it("rejects malformed UUIDs before any resource lookup", () => {
    expect(() => parseUuid("../event", "INVALID_EVENT_ID")).toThrow(ApiSecurityError);
    expect(parseUuid(eventId)).toBe(eventId);
  });
});
