const mockRequireEventAccess = jest.fn();
const mockRequireEventResource = jest.fn();
const mockRemove = jest.fn();
const mockCreateSignedUrl = jest.fn();
const mockFrom = jest.fn();
const mockRpc = jest.fn();

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      json: async () => body,
      status: init?.status ?? 200,
    }),
  },
}));

jest.mock("@/lib/apiSecurity", () => ({
  parseUuid: (value: string) => value,
  requireEventAccess: (...args: unknown[]) => mockRequireEventAccess(...args),
  requireEventResource: (...args: unknown[]) => mockRequireEventResource(...args),
  apiSecurityErrorResponse: (error: { status?: number; code?: string }, fallback: string) => ({
    status: error?.status ?? 500,
    json: async () => ({ error: error?.code ?? fallback }),
  }),
}));

jest.mock("@/lib/supabaseServer", () => ({
  getServiceClient: () => ({
    rpc: (...args: unknown[]) => mockRpc(...args),
    from: (...args: unknown[]) => mockFrom(...args),
    storage: {
      from: () => ({ remove: mockRemove, createSignedUrl: mockCreateSignedUrl }),
    },
  }),
}));

import type { NextRequest } from "next/server";
import { DELETE } from "./[id]/route";
import { GET as DOWNLOAD } from "./[id]/download/route";

const eventId = "53120000-0000-4000-8000-000000000010";
const documentId = "53120000-0000-4000-8000-000000000020";
const actorId = "53120000-0000-4000-8000-000000000001";
const operationId = "53120000-0000-4000-8000-000000000030";
const objectPath = `${eventId}/${documentId}/contratto.pdf`;
const context = { params: Promise.resolve({ id: documentId }) };

describe("document download and delete contracts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireEventAccess.mockResolvedValue({ userId: actorId, currentEvent: { eventId, accessRole: "owner" } });
    mockRequireEventResource.mockResolvedValue({
      id: documentId,
      object_path: objectPath,
      original_name: "contratto.pdf",
      deletion_state: "active",
    });
    mockRemove.mockResolvedValue({ error: null });
    mockCreateSignedUrl.mockResolvedValue({ data: { signedUrl: "https://signed.invalid/doc" }, error: null });
    mockRpc.mockImplementation(async (name: string) => {
      if (name === "begin_event_document_delete") {
        return { data: { operationId, documentId, objectPath, status: "pending_storage" }, error: null };
      }
      if (name === "complete_event_document_delete") {
        return { data: { operationId, documentId, status: "completed" }, error: null };
      }
      throw new Error(`Unexpected RPC ${name}`);
    });
  });

  it("returns a signed download URL limited to 60 seconds", async () => {
    const response = await DOWNLOAD({} as NextRequest, context);
    expect(response.status).toBe(200);
    expect(mockCreateSignedUrl).toHaveBeenCalledWith(
      objectPath,
      60,
      { download: "contratto.pdf" },
    );
    await expect(response.json()).resolves.toEqual({ url: "https://signed.invalid/doc", expiresIn: 60 });
  });

  it("hides cross-event or missing resources as 404", async () => {
    mockRequireEventResource.mockRejectedValue({ status: 404, code: "RESOURCE_NOT_FOUND" });
    const response = await DOWNLOAD({} as NextRequest, context);
    expect(response.status).toBe(404);
    expect(mockCreateSignedUrl).not.toHaveBeenCalled();
  });

  it("secures a tombstone before Storage and finalizes afterward", async () => {
    const response = await DELETE({} as NextRequest, context);
    expect(response.status).toBe(200);
    expect(mockRpc).toHaveBeenNthCalledWith(1, "begin_event_document_delete", {
      p_event_id: eventId,
      p_actor_id: actorId,
      p_document_id: documentId,
    });
    expect(mockRemove).toHaveBeenCalledWith([objectPath]);
    expect(mockRpc).toHaveBeenNthCalledWith(2, "complete_event_document_delete", {
      p_event_id: eventId,
      p_actor_id: actorId,
      p_operation_id: operationId,
      p_document_id: documentId,
      p_object_path: objectPath,
    });
    expect(mockRpc.mock.invocationCallOrder[0]).toBeLessThan(mockRemove.mock.invocationCallOrder[0]);
    expect(mockRemove.mock.invocationCallOrder[0]).toBeLessThan(mockRpc.mock.invocationCallOrder[1]);
  });

  it("keeps an explicit retryable tombstone when Storage succeeds and DB finalization fails", async () => {
    mockRpc.mockImplementation(async (name: string) => name === "begin_event_document_delete"
      ? { data: { operationId, documentId, objectPath, status: "pending_storage" }, error: null }
      : { data: null, error: { code: "08006", message: "database unavailable" } });
    const response = await DELETE({} as NextRequest, context);
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "EVENT_DOCUMENT_DELETE_PENDING",
      deletionPending: true,
      retryable: true,
    });
  });

  it("keeps the tombstone pending when Storage deletion fails", async () => {
    mockRemove.mockResolvedValueOnce({ error: { message: "Storage unavailable" } });
    const response = await DELETE({} as NextRequest, context);
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ deletionPending: true, retryable: true });
    expect(mockRpc.mock.calls.filter(([name]) => name === "complete_event_document_delete")).toHaveLength(0);
  });

  it("does not touch Storage when the durable begin transition fails", async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { code: "08006", message: "database unavailable" } });
    const response = await DELETE({} as NextRequest, context);
    expect(response.status).toBe(500);
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it("retries a pending deletion and completes cleanup", async () => {
    const response = await DELETE({} as NextRequest, context);
    expect(response.status).toBe(200);
    expect(mockRemove).toHaveBeenCalledTimes(1);
    expect(mockRpc).toHaveBeenCalledTimes(2);
  });

  it("returns success without Storage for an already completed duplicate intent", async () => {
    mockRpc.mockResolvedValueOnce({ data: { operationId, documentId, objectPath, status: "completed" }, error: null });
    const response = await DELETE({} as NextRequest, context);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true, idempotent: true });
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it("converges concurrent duplicate DELETE requests on one operation", async () => {
    const [first, second] = await Promise.all([
      DELETE({} as NextRequest, context),
      DELETE({} as NextRequest, context),
    ]);
    expect([first.status, second.status]).toEqual([200, 200]);
    expect(mockRpc.mock.calls.filter(([name]) => name === "begin_event_document_delete")).toHaveLength(2);
    expect(mockRpc.mock.calls.filter(([name]) => name === "complete_event_document_delete")).toHaveLength(2);
  });

  it("denies a cross-event actor before Storage", async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { code: "42501", message: "DOCUMENT_EVENT_MISMATCH" } });
    const response = await DELETE({} as NextRequest, context);
    expect(response.status).toBe(404);
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it("rejects a ledger object key outside the authorized event", async () => {
    mockRpc.mockResolvedValueOnce({
      data: { operationId, documentId, objectPath: `other-event/${documentId}/contratto.pdf`, status: "pending_storage" },
      error: null,
    });
    const response = await DELETE({} as NextRequest, context);
    expect(response.status).toBe(500);
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it("returns 401 before resource or Storage access", async () => {
    mockRequireEventAccess.mockRejectedValue({ status: 401, code: "AUTHENTICATION_REQUIRED" });
    const response = await DELETE({} as NextRequest, context);
    expect(response.status).toBe(401);
    expect(mockRequireEventResource).not.toHaveBeenCalled();
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it("does not issue signed URLs for tombstoned metadata", async () => {
    mockRequireEventResource.mockResolvedValueOnce({
      id: documentId,
      object_path: objectPath,
      original_name: "contratto.pdf",
      deletion_state: "pending_storage",
    });
    const response = await DOWNLOAD({} as NextRequest, context);
    expect(response.status).toBe(404);
    expect(mockCreateSignedUrl).not.toHaveBeenCalled();
  });
});
