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
  event_date: "2026-09-16",
};
const eventB = {
  id: "b0000000-0000-4000-8000-000000000001",
  owner_id: owner,
  name: "Evento B",
  event_type: "eighteenth",
  language: "it",
  country: "IT",
  inserted_at: "2026-02-01T00:00:00Z",
  event_date: "2026-10-01",
};

function arrange(rows: typeof eventA[], email?: string) {
  const query = {
    select: jest.fn(),
    eq: jest.fn(),
    or: jest.fn(),
    order: jest.fn(),
  } as unknown as Record<string, jest.Mock> & PromiseLike<{ data: typeof rows; error: null }>;
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.or.mockReturnValue(query);
  query.order.mockReturnValue(query);
  query.then = (resolve) => Promise.resolve({ data: rows, error: null }).then(resolve);

  const client = {
    from: jest.fn(() => query),
    ...(email
      ? {
          auth: {
            admin: {
              getUserById: jest.fn(async () => ({
                data: { user: { email } },
                error: null,
              })),
            },
          },
        }
      : {}),
  };
  mockedClient.mockReturnValue(client as never);
  return query;
}

function request(cookie?: string): NextRequest {
  return { cookies: { get: jest.fn(() => cookie ? { name: "app-current-event", value: cookie } : undefined) } } as unknown as NextRequest;
}

describe("authoritative current event resolver", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns NO_EVENT for an account with zero accessible events", async () => {
    arrange([]);
    expect((await resolveCurrentEvent(request(), owner)).status).toBe("NO_EVENT");
  });

  it("automatically resolves exactly one accessible event", async () => {
    arrange([eventA]);
    const result = await resolveCurrentEvent(request(), owner);
    expect(result.status).toBe("RESOLVED");
    if (result.status === "RESOLVED") {
      expect(result.currentEvent.source).toBe("single-event-fallback");
      expect(result.currentEvent.date).toBe("2026-09-16");
    }
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

  it("does not accept an inaccessible event", async () => {
    arrange([eventA, eventB]);
    const result = await resolveCurrentEvent(request("20000000-0000-4000-8000-000000000002"), other);
    expect(result.status).toBe("SELECTION_REQUIRED");
  });

  it("recovers a stale selection when exactly one accessible event remains", async () => {
    arrange([eventA]);
    const result = await resolveCurrentEvent(request(eventB.id), owner);
    expect(result).toMatchObject({ status: "RESOLVED", staleSelection: true });
  });

  it("switches A to B through an explicit validated selection", async () => {
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

  it("queries canonical event columns by owner when account email is unavailable", async () => {
    const query = arrange([eventA]);
    await resolveCurrentEvent(request(), owner);
    expect(query.select).toHaveBeenCalledWith("id,owner_id,name,event_type,language,country,inserted_at,event_date");
    expect(query.eq).toHaveBeenCalledWith("owner_id", owner);
  });

  it("includes owner, bride and groom email access for an authenticated partner", async () => {
    const query = arrange([eventA], "partner@example.com");
    await resolveCurrentEvent(request(), other);
    expect(query.or).toHaveBeenCalledWith(
      `owner_id.eq.${other},bride_email.eq.partner@example.com,groom_email.eq.partner@example.com`,
    );
  });
});
