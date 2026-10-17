const mockRequireUser = jest.fn();
const mockListOwnedEvents = jest.fn();
const mockMaybeSingle = jest.fn();
const mockDocuments = jest.fn();
const mockRpc = jest.fn();
const mockRemove = jest.fn();
const mockStorageList = jest.fn();

jest.mock("@/lib/supabaseServer", () => ({ getServiceClient: () => ({
  from: () => ({ select: () => ({ eq: () => ({ limit: mockDocuments }) }) }),
  rpc: mockRpc,
  storage: { from: () => ({ remove: mockRemove, list: mockStorageList }) },
}) }));

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => {
      const response = {
        status: init?.status || 200,
        headers: new Headers(init?.headers),
        json: async () => body,
        cookies: {
          delete: (name: string) =>
            response.headers.append(
              "set-cookie",
              `${name}=; Max-Age=0; Path=/`,
            ),
          set: (name: string, value: string) =>
            response.headers.append("set-cookie", `${name}=${value}; Path=/`),
        },
      };
      return response;
    },
  },
}));

jest.mock("@/lib/apiAuth", () => ({
  requireUser: (...args: unknown[]) => mockRequireUser(...args),
  getBearer: () => "jwt",
}));
jest.mock("@/lib/currentEvent", () => ({
  CURRENT_EVENT_COOKIE: "app-current-event",
  listOwnedEvents: (...args: unknown[]) => mockListOwnedEvents(...args),
}));
jest.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => ({
      delete: () => ({
        eq: () => ({ select: () => ({ maybeSingle: mockMaybeSingle }) }),
      }),
    }),
  }),
}));

import type { NextRequest } from "next/server";
import { DELETE } from "@/app/api/event/delete/route";

const EVENT_A = "11111111-1111-1111-1111-111111111111";
const EVENT_B = "22222222-2222-2222-2222-222222222222";
const owner = {
  id: EVENT_A,
  eventId: EVENT_A,
  ownerId: "user-a",
  name: "Nozze A",
  eventType: "wedding",
  date: null,
  locale: "it",
  country: "it",
  capability: {},
  accessRole: "owner",
};
const partner = { ...owner, ownerId: "owner-other", accessRole: "partner" };

function request(body: unknown, authenticated = true) {
  return {
    headers: new Headers(authenticated ? { authorization: "Bearer jwt" } : {}),
    json: async () => body,
  } as NextRequest;
}

describe("canonical event deletion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "public";
    mockRequireUser.mockResolvedValue({ userId: "user-a" });
    mockListOwnedEvents.mockResolvedValue([owner]);
    mockMaybeSingle.mockResolvedValue({ data: { id: EVENT_A }, error: null });
    mockDocuments.mockResolvedValue({ data: [], error: null });
    mockStorageList.mockResolvedValue({ data: [], error: null });
    mockRemove.mockResolvedValue({ error: null });
    mockRpc.mockImplementation(async (name: string) => ({ data: name === "claim_expired_event_document_uploads" ? [] : name === "event_document_path_is_untracked" ? true : { operationId: "op", documentId: "doc", objectPath: `${EVENT_A}/doc.pdf`, status: name === "begin_event_document_delete" ? "pending_storage" : "completed" }, error: null }));
  });
  it("removes Storage before the guarded event cascade", async () => {
    mockDocuments.mockResolvedValueOnce({ data: [{ id: "doc" }], error: null });
    const response = await DELETE(request({ eventId: EVENT_A, confirmationName: "Nozze A" }));
    expect(response.status).toBe(200);
    expect(mockRemove).toHaveBeenCalledWith([`${EVENT_A}/doc.pdf`]);
    expect(mockRpc).toHaveBeenCalledWith("complete_event_document_delete", expect.objectContaining({ p_event_id: EVENT_A, p_actor_id: "user-a" }));
    expect(mockRemove.mock.invocationCallOrder[0]).toBeLessThan(mockMaybeSingle.mock.invocationCallOrder[0]);
  });
  it.each(["storage", "finalize", "query"])("keeps the event retryable after %s failure", async (failure) => {
    mockDocuments.mockResolvedValueOnce({ data: [{ id: "doc" }], error: null });
    if (failure === "storage") mockRemove.mockResolvedValue({ error: { message: "private storage detail" } });
    if (failure === "finalize") mockRpc.mockImplementation(async (name: string) => ({ data: name === "claim_expired_event_document_uploads" ? [] : { operationId: "op", documentId: "doc", objectPath: `${EVENT_A}/doc.pdf`, status: "pending_storage" }, error: name === "complete_event_document_delete" ? { message: "private DB detail" } : null }));
    if (failure === "query") mockDocuments.mockReset().mockResolvedValue({ data: null, error: { message: "private query detail" } });
    const response = await DELETE(request({ eventId: EVENT_A, confirmationName: "Nozze A" }));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "EVENT_DELETE_CLEANUP_PENDING", retryable: true });
    expect(mockMaybeSingle).not.toHaveBeenCalled();
  });
  it("returns retryable cleanup when an upload races the final cascade", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: { code: "55000", message: "EVENT_DOCUMENT_CLEANUP_REQUIRED" } });
    const response = await DELETE(request({ eventId: EVENT_A, confirmationName: "Nozze A" }));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "EVENT_DELETE_CLEANUP_PENDING", retryable: true });
  });
  it("removes untracked nested Storage objects before cascading", async () => {
    mockStorageList.mockResolvedValueOnce({ data: [{ name: "reservation", id: null }], error: null })
      .mockResolvedValueOnce({ data: [{ name: "orphan.pdf", id: "object" }], error: null });
    expect((await DELETE(request({ eventId: EVENT_A, confirmationName: "Nozze A" }))).status).toBe(200);
    expect(mockRemove).toHaveBeenCalledWith([`${EVENT_A}/reservation/orphan.pdf`]);
  });
  it("retains the event when Storage enumeration fails", async () => {
    mockStorageList.mockResolvedValueOnce({ data: null, error: { message: "unavailable" } });
    expect((await DELETE(request({ eventId: EVENT_A, confirmationName: "Nozze A" }))).status).toBe(503);
    expect(mockMaybeSingle).not.toHaveBeenCalled();
  });
  it.each([false, true])("never sweeps a protected path or failed check (error=%s)", async (failed) => {
    mockStorageList.mockResolvedValueOnce({ data: [{ name: "upload.pdf", id: "object" }], error: null });
    mockRpc.mockImplementation(async (name: string) => name === "event_document_path_is_untracked"
      ? { data: false, error: failed ? { message: "unavailable" } : null } : { data: [], error: null });
    expect((await DELETE(request({ eventId: EVENT_A, confirmationName: "Nozze A" }))).status).toBe(503);
    expect(mockRemove).not.toHaveBeenCalled();
    expect(mockMaybeSingle).not.toHaveBeenCalled();
  });
  it("refuses a cross-event cleanup path", async () => {
    mockDocuments.mockResolvedValueOnce({ data: [{ id: "doc" }], error: null });
    mockRpc.mockImplementation(async (name: string) => ({ data: name === "claim_expired_event_document_uploads" ? [] : { operationId: "op", documentId: "doc", objectPath: `${EVENT_B}/file.pdf`, status: "pending_storage" }, error: null }));
    expect((await DELETE(request({ eventId: EVENT_A, confirmationName: "Nozze A" }))).status).toBe(503);
    expect(mockRemove).not.toHaveBeenCalled();
    expect(mockMaybeSingle).not.toHaveBeenCalled();
  });
  it("returns 401 for anonymous requests", async () => {
    mockRequireUser.mockRejectedValue(new Error());
    expect((await DELETE(request({}, false))).status).toBe(401);
    expect(mockMaybeSingle).not.toHaveBeenCalled();
  });
  it.each([
    ["partner", partner, 403],
    ["stranger", undefined, 404],
  ])("rejects %s without deleting", async (_label, target, status) => {
    mockListOwnedEvents.mockResolvedValue(target ? [target] : []);
    const response = await DELETE(
      request({ eventId: EVENT_A, confirmationName: "Nozze A" }),
    );
    expect(response.status).toBe(status);
    expect(mockMaybeSingle).not.toHaveBeenCalled();
    expect(mockDocuments).not.toHaveBeenCalled();
    expect(mockStorageList).not.toHaveBeenCalled();
  });
  it("prevents owner A from deleting event B", async () => {
    expect(
      (await DELETE(request({ eventId: EVENT_B, confirmationName: "Nozze A" })))
        .status,
    ).toBe(404);
  });
  it("rejects altered or mismatched payloads", async () => {
    expect(
      (await DELETE(request({ eventId: EVENT_A, confirmationName: "wrong" })))
        .status,
    ).toBe(400);
    expect(
      (await DELETE(request({ eventId: "bad", confirmationName: "Nozze A" })))
        .status,
    ).toBe(400);
  });
  it("deletes the owner's event and clears transient cookies", async () => {
    mockListOwnedEvents
      .mockResolvedValueOnce([owner])
      .mockResolvedValueOnce([]);
    const response = await DELETE(
      request({ eventId: EVENT_A, confirmationName: "Nozze A" }),
    );
    expect(response.status).toBe(200);
    const cookies = response.headers.get("set-cookie") || "";
    expect(cookies).toContain("app-current-event=");
    expect(cookies).toContain("eventType=");
    expect(cookies).toContain("currentEventChangedAt=");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
  it("deterministically selects the first remaining accessible event", async () => {
    const next = { ...owner, id: EVENT_B, eventId: EVENT_B, name: "Nozze B" };
    mockListOwnedEvents
      .mockResolvedValueOnce([owner])
      .mockResolvedValueOnce([next]);
    const response = await DELETE(
      request({ eventId: EVENT_A, confirmationName: "Nozze A" }),
    );
    expect(await response.json()).toMatchObject({
      remainingCount: 1,
      nextEvent: { id: EVENT_B },
    });
    expect(response.headers.get("set-cookie")).toContain(
      `app-current-event=${EVENT_B}`,
    );
  });
  it("defines repeated deletion as a safe 404", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    expect(
      (await DELETE(request({ eventId: EVENT_A, confirmationName: "Nozze A" })))
        .status,
    ).toBe(404);
  });
});
