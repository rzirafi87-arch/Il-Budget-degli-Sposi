jest.mock("next/server", () => ({
  NextResponse: { json: (body: unknown, init?: { status?: number }) => ({ status: init?.status ?? 200, json: async () => body }) },
}));
const mockGetUser = jest.fn();
const mockFrom = jest.fn();
const mockCurrentEvent = jest.fn();
jest.mock("@/lib/supabaseServer", () => ({ getServiceClient: () => ({ auth: { getUser: mockGetUser }, from: mockFrom }) }));
jest.mock("@/lib/currentEvent", () => ({ requireServerCurrentEvent: (...args: unknown[]) => mockCurrentEvent(...args) }));
jest.mock("@/lib/logger", () => ({ logger: { error: jest.fn() } }));
import type { NextRequest } from "next/server";
import { GET } from "./route";

const request = { headers: new Headers({ authorization: "Bearer test-token" }) } as NextRequest;
describe("guest read failure confidentiality", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "owner" } }, error: null });
    mockCurrentEvent.mockResolvedValue({ eventId: "event-a" });
  });
  it("does not expose event resolver exception details", async () => {
    mockCurrentEvent.mockRejectedValue(new Error("internal database host and private diagnostic"));
    const response = await GET(request);
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "GUEST_SNAPSHOT_READ_FAILED" });
    expect(mockFrom).not.toHaveBeenCalled();
  });
  it("does not expose rejected database transport details", async () => {
    mockFrom.mockImplementation(() => { throw new Error("private transport diagnostic"); });
    const response = await GET(request);
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "GUEST_SNAPSHOT_READ_FAILED" });
  });
  it("keeps an invalid session a 401 without reading event data", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "invalid" } });
    const response = await GET(request);
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "AUTHENTICATION_REQUIRED" });
    expect(mockCurrentEvent).not.toHaveBeenCalled();
    expect(mockFrom).not.toHaveBeenCalled();
  });
  it("preserves a successful event-scoped empty snapshot", async () => {
    const eq = jest.fn();
    mockFrom.mockImplementation((table: string) => {
      const result = { data: table === "events" ? { default_rsvp_deadline: "2027-05-01" } : [], error: null };
      const chain: { select: jest.Mock; eq: jest.Mock; single: jest.Mock; order: jest.Mock } = { select: jest.fn(() => chain), eq: jest.fn((...args: unknown[]) => { eq(...args); return chain; }), single: jest.fn(async () => result), order: jest.fn(async () => result) };
      return chain;
    });
    const response = await GET(request);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ guests: [], familyGroups: [], nonInvitedRecipients: [], defaultRsvpDeadline: "2027-05-01" });
    expect(eq).toHaveBeenCalledWith("id", "event-a");
    expect(eq.mock.calls.filter(([key]) => key === "event_id")).toEqual(Array(3).fill(["event_id", "event-a"]));
  });
});
