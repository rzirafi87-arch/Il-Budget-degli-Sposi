const mockRequireEventAccess = jest.fn();
const mockFrom = jest.fn();
const mockRpc = jest.fn();
const mockUpload = jest.fn();
const mockRemove = jest.fn();

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      json: async () => body,
      status: init?.status ?? 200,
    }),
  },
}));

jest.mock("@/lib/apiSecurity", () => ({
  requireEventAccess: (...args: unknown[]) => mockRequireEventAccess(...args),
  parseUuid: (value: unknown) => {
    if (typeof value !== "string" || !/^[0-9a-f-]{36}$/i.test(value)) {
      throw { status: 400, code: "DOCUMENT_IDEMPOTENCY_KEY_INVALID" };
    }
    return value;
  },
  apiSecurityErrorResponse: (error: { status?: number; code?: string }, fallback: string) => ({
    status: error?.status ?? 500,
    json: async () => ({ error: error?.code ?? fallback }),
  }),
}));

jest.mock("@/lib/supabaseServer", () => ({
  getServiceClient: () => ({
    from: (...args: unknown[]) => mockFrom(...args),
    rpc: (...args: unknown[]) => mockRpc(...args),
    storage: { from: () => ({ upload: mockUpload, remove: mockRemove }) },
  }),
}));

import type { NextRequest } from "next/server";
import { GET, POST } from "./route";

const eventId = "53110000-0000-4000-8000-000000000010";
const userId = "53110000-0000-4000-8000-000000000001";
const idempotencyKey = "53110000-0000-4000-8000-000000000099";
const reservationId = "53110000-0000-4000-8000-000000000020";
const documentId = "53110000-0000-4000-8000-000000000021";
const objectPath = `${eventId}/${reservationId}/opaque.pdf`;
const row = {
  id: documentId, original_name: "contratto.pdf", category: "contract",
  mime_type: "application/pdf", file_size: 3, notes: null, created_at: "2026-09-22",
};

function file(name = "contratto.pdf", type = "application/pdf", bytes = "pdf") {
  const value = new File([bytes], name, { type });
  Object.defineProperty(value, "arrayBuffer", {
    configurable: true,
    value: async () => Uint8Array.from([...bytes].map((character) => character.charCodeAt(0))).buffer,
  });
  return value;
}

function uploadRequest(value: File, category = "contract") {
  const form = new FormData();
  form.set("file", value);
  form.set("category", category);
  form.set("idempotencyKey", idempotencyKey);
  return { formData: async () => form, headers: { get: () => idempotencyKey } } as unknown as NextRequest;
}

function documentQuery(single = row, list = [row]) {
  const query: {
    select: jest.Mock;
    eq: jest.Mock;
    order: jest.Mock;
    maybeSingle: jest.Mock;
  } = {
    select: jest.fn(() => query),
    eq: jest.fn(() => query),
    order: jest.fn(async () => ({ data: list, error: null })),
    maybeSingle: jest.fn(async () => ({ data: single, error: null })),
  };
  return query;
}

function reservation(status: "active" | "finalized" = "active") {
  return { reservationId, documentId, objectPath, fileSize: 3, status, expiresAt: "2026-09-27T22:00:00Z" };
}

describe("/api/my/documents contracts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireEventAccess.mockResolvedValue({ userId, currentEvent: { eventId, accessRole: "owner" } });
    mockFrom.mockReturnValue(documentQuery());
    mockUpload.mockResolvedValue({ error: null });
    mockRemove.mockResolvedValue({ error: null });
    mockRpc.mockImplementation(async (name: string) => {
      if (name === "claim_expired_event_document_uploads") return { data: [], error: null };
      if (name === "reserve_event_document_upload") return { data: reservation(), error: null };
      if (name === "finalize_event_document_upload") return { data: { documentId }, error: null };
      return { data: {}, error: null };
    });
  });

  it("returns 401 before document reads when the session is absent", async () => {
    mockRequireEventAccess.mockRejectedValue({ status: 401, code: "AUTHENTICATION_REQUIRED" });
    const response = await GET({} as NextRequest);
    expect(response.status).toBe(401);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("lists only the authoritative event documents", async () => {
    const query = documentQuery();
    mockFrom.mockReturnValue(query);
    const response = await GET({} as NextRequest);
    expect(response.status).toBe(200);
    expect(query.eq).toHaveBeenCalledWith("event_id", eventId);
    expect(query.eq).toHaveBeenCalledWith("deletion_state", "active");
    await expect(response.json()).resolves.toMatchObject({ documents: [{ name: "contratto.pdf", fileSize: 3 }] });
  });

  it("returns event-scoped pending IDs for retry without exposing downloads or paths", async () => {
    const active = documentQuery(row, []);
    const pending = documentQuery(row, [row]);
    mockFrom.mockReturnValueOnce(active).mockReturnValueOnce(pending);
    const response = await GET({} as NextRequest);
    expect(pending.eq).toHaveBeenCalledWith("event_id", eventId);
    expect(pending.eq).toHaveBeenCalledWith("deletion_state", "pending_storage");
    await expect(response.json()).resolves.toMatchObject({ documents: [], pendingDeletions: [{ id: documentId, name: "contratto.pdf" }] });
  });

  it.each([
    [file("malware.exe", "application/octet-stream"), "DOCUMENT_TYPE_NOT_ALLOWED", 415],
    [file("bad.pdf", "application/pdf"), "DOCUMENT_FILE_TOO_LARGE", 413],
  ])("rejects invalid upload validation before reserving quota", async (value, error, status) => {
    if (error === "DOCUMENT_FILE_TOO_LARGE") Object.defineProperty(value, "size", { value: 10 * 1024 * 1024 + 1 });
    const response = await POST(uploadRequest(value));
    expect(response.status).toBe(status);
    await expect(response.json()).resolves.toEqual({ error });
    expect(mockRpc).not.toHaveBeenCalled();
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it("maps an atomic quota rejection before Storage upload", async () => {
    mockRpc.mockImplementation(async (name: string) => name === "claim_expired_event_document_uploads"
      ? { data: [], error: null }
      : { data: null, error: { code: "23514", message: "EVENT_DOCUMENT_QUOTA_EXCEEDED" } });
    const response = await POST(uploadRequest(file()));
    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({ error: "EVENT_DOCUMENT_QUOTA_EXCEEDED" });
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it("reserves, uploads and finalizes with the server-controlled object key", async () => {
    const response = await POST(uploadRequest(file()));
    expect(response.status).toBe(201);
    expect(mockRpc).toHaveBeenCalledWith("reserve_event_document_upload", expect.objectContaining({
      p_event_id: eventId, p_actor_id: userId, p_idempotency_key: idempotencyKey, p_file_size: 3,
    }));
    expect(mockUpload).toHaveBeenCalledWith(objectPath, expect.any(Uint8Array), expect.objectContaining({ upsert: false }));
    expect(mockRpc).toHaveBeenCalledWith("finalize_event_document_upload", expect.objectContaining({
      p_reservation_id: reservationId, p_object_path: objectPath,
    }));
    await expect(response.json()).resolves.toMatchObject({ document: { id: documentId }, idempotencyKey });
  });

  it("returns the existing document for a finalized idempotent replay", async () => {
    mockRpc.mockImplementation(async (name: string) => {
      if (name === "claim_expired_event_document_uploads") return { data: [], error: null };
      if (name === "reserve_event_document_upload") return { data: reservation("finalized"), error: null };
      return { data: {}, error: null };
    });
    const response = await POST(uploadRequest(file()));
    expect(response.status).toBe(200);
    expect(mockUpload).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({ idempotent: true, document: { id: documentId } });
  });

  it("finalizes an upload that timed out after Storage accepted the object", async () => {
    mockUpload.mockResolvedValue({ error: { message: "The resource already exists" } });
    const response = await POST(uploadRequest(file()));
    expect(response.status).toBe(200);
    expect(mockRpc).toHaveBeenCalledWith("finalize_event_document_upload", expect.objectContaining({
      p_reservation_id: reservationId,
      p_object_path: objectPath,
    }));
    expect(mockRemove).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({ idempotent: true, document: { id: documentId } });
  });

  it("preserves the reservation when upload reconciliation remains uncertain", async () => {
    mockUpload.mockResolvedValue({ error: { message: "Storage unavailable" } });
    mockRpc.mockImplementation(async (name: string) => {
      if (name === "claim_expired_event_document_uploads") return { data: [], error: null };
      if (name === "reserve_event_document_upload") return { data: reservation(), error: null };
      if (name === "finalize_event_document_upload") {
        return { data: null, error: { code: "23514", message: "DOCUMENT_STORAGE_OBJECT_MISMATCH" } };
      }
      return { data: { status: "released" }, error: null };
    });
    const response = await POST(uploadRequest(file()));
    expect(response.status).toBe(503);
    expect(mockRemove).not.toHaveBeenCalled();
    expect(mockRpc).not.toHaveBeenCalledWith("release_event_document_upload", expect.anything());
  });

  it("preserves the object when repeated finalization responses are uncertain", async () => {
    mockRpc.mockImplementation(async (name: string) => {
      if (name === "claim_expired_event_document_uploads") return { data: [], error: null };
      if (name === "reserve_event_document_upload") return { data: reservation(), error: null };
      if (name === "finalize_event_document_upload") {
        return { data: null, error: { code: "23514", message: "DOCUMENT_STORAGE_OBJECT_MISMATCH" } };
      }
      return { data: { status: "released" }, error: null };
    });
    const response = await POST(uploadRequest(file()));
    expect(response.status).toBe(503);
    expect(mockRemove).not.toHaveBeenCalled();
    expect(mockRpc).not.toHaveBeenCalledWith("release_event_document_upload", expect.anything());
  });
  it("reconciles a committed finalization after its response was lost", async () => {
    let attempts = 0;
    mockRpc.mockImplementation(async (name: string) => {
      if (name === "claim_expired_event_document_uploads") return { data: [], error: null };
      if (name === "reserve_event_document_upload") return { data: reservation(), error: null };
      if (name === "finalize_event_document_upload" && ++attempts === 1) return { data: null, error: { message: "response lost" } };
      return { data: { documentId }, error: null };
    });
    expect((await POST(uploadRequest(file()))).status).toBe(201);
    expect(attempts).toBe(2);
    expect(mockRemove).not.toHaveBeenCalled();
  });
});
