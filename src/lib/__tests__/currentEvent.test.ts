import { resolveCurrentEvent } from "@/lib/currentEvent";
import { getServiceClient } from "@/lib/supabaseServer";
import type { NextRequest } from "next/server";

jest.mock("@/lib/supabaseServer", () => ({ getServiceClient: jest.fn() }));

const mockedClient = getServiceClient as jest.MockedFunction<typeof getServiceClient>;
const owner = "10000000-0000-4000-8000-000000000001";
const other = "20000000-0000-4000-8000-000000000001";
const eventA = {
  id: "a0000000-0000-4000-8000-000000000001",
  owner_id: owner,
  name: "Matrimonio A",
  event_type: "wedding",
  language: "it",
  country: "IT",
  inserted_at: "2026-01-01T00:00:00Z",
};
const eventB = {
  id: "b0000000-0000-4000-8000-000000000001",
  owner_id: owner,
  name: "Evento B",
  event_type: "eighteenth",
  language: "it",
  country: "IT",
  inserted_at: "2026-02-01T00:00:00Z",
};

function arrange(rows: typeof eventA[]) {
  const query = {
    select: jest.fn(),
    eq: jest.fn(),
    order: jest.fn(),
  } as unknown as Record<string, jest.Mock> & PromiseLike<{ data: typeof rows; error: null }>;
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.order.mockReturnValue(query);
  query.then = (resolve) => Promise.resolve({ data: rows, error: null }).then(resolve);
  mockedClient.mockReturnValue({ from: jest.fn(() => query) } as never);
  return query;
}

function request(cookie?: string): NextRequest {
  return { cookies: { get: jest.fn(() => cookie ? { name: "app-current-event", value: cookie } : undefined) } } as unknown as NextRequest;
}

describe("authoritative current event resolver", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns NO_EVENT for an owner with zero events", async () => {
    arrange([]);
    expect((await resolveCurrentEvent(request(), owner)).status).toBe("NO_EVENT");
  });

  it("automatically resolves exactly one owned event", async () => {
    arrange([eventA]);
    const result = await resolveCurrentEvent(request(), owner);
    expect(result.status).toBe("RESOLVED");
    if (result.status === "RESOLVED") expect(result.currentEvent.source).toBe("single-event-fallback");
  });

  it("requires selection for two events without a hint", async () => {
    arrange([eventA, eventB]);
    expect((await resolveCurrentEvent(request(), owner)).status).toBe("SELECTION_REQUIRED");
  });

  it("resolves the validated cookie selection", async () => {
    arrange([eventA, eventB]);
    const result = await resolveCurrentEvent(request(eventB.id), owner);
    expect(result.status).toBe("RESOLVED");
    if (result.status === "RESOLVED") expect(result.currentEvent.eventId).toBe(eventB.id);
  });

  it("does not accept an invalid selection when multiple events exist", async () => {
    arrange([eventA, eventB]);
    const result = await resolveCurrentEvent(request("ffffffff-ffff-4fff-8fff-ffffffffffff"), owner);
    expect(result).toMatchObject({ status: "SELECTION_REQUIRED", staleSelection: true });
  });

  it("does not accept another owner's event", async () => {
    arrange([eventA, eventB]);
    const result = await resolveCurrentEvent(request("20000000-0000-4000-8000-000000000002"), other);
    expect(result.status).toBe("SELECTION_REQUIRED");
  });

  it("recovers a deleted selection only when one event remains", async () => {
    arrange([eventA]);
    const result = await resolveCurrentEvent(request(eventB.id), owner);
    expect(result).toMatchObject({ status: "RESOLVED", staleSelection: true });
  });

  it("switches A to B through an explicit owner-validated selection", async () => {
    arrange([eventA, eventB]);
    const before = await resolveCurrentEvent(request(eventA.id), owner);
    const after = await resolveCurrentEvent(request(eventA.id), owner, { explicitEventId: eventB.id });
    expect(before.status === "RESOLVED" && before.currentEvent.eventId).toBe(eventA.id);
    expect(after.status === "RESOLVED" && after.currentEvent.eventId).toBe(eventB.id);
  });

  it("derives Coming Soon capability from the Branch 29 matrix", async () => {
    arrange([eventA, eventB]);
    const result = await resolveCurrentEvent(request(eventB.id), owner);
    expect(result.status === "RESOLVED" && result.currentEvent.capability.availabilityStatus).toBe("COMING_SOON");
    expect(result.status === "RESOLVED" && result.currentEvent.capability.enabledModules).toEqual([]);
  });

  it("derives wedding capability after switching back", async () => {
    arrange([eventA, eventB]);
    const result = await resolveCurrentEvent(request(eventB.id), owner, { explicitEventId: eventA.id });
    expect(result.status === "RESOLVED" && result.currentEvent.capability.availabilityStatus).toBe("READY");
  });

  it("queries only events belonging to the authenticated owner", async () => {
    const query = arrange([eventA]);
    await resolveCurrentEvent(request(), owner);
    expect(query.eq).toHaveBeenCalledWith("owner_id", owner);
  });
});
