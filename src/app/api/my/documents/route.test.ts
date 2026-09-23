const mockRequireEventAccess = jest.fn();
const mockFrom = jest.fn();
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
  apiSecurityErrorResponse: (error: { status?: number; code?: string }, fallback: string) => ({
    status: error?.status ?? 500,
    json: async () => ({ error: error?.code ?? fallback }),
  }),
}));

jest.mock("@/lib/supabaseServer", () => ({
  getServiceClient: () => ({
    from: (...args: unknown[]) => mockFrom(...args),
    storage: {
      from: () => ({ upload: mockUpload, remove: mockRemove }),
    },
  }),
}));

import type { NextRequest } from "next/server";
import { GET, POST } from "./route";

const eventId = "53110000-0000-4000-8000-000000000010";
const userId = "53110000-0000-4000-8000-000000000001";

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
  return { formData: async () => form } as unknown as NextRequest;
}

function quotaQuery(sizes: number[]) {
  return {
    select: jest.fn(() => ({
      eq: jest.fn(async () => ({ data: sizes.map((file_size) => ({ file_size })), error: null })),
    })),
  };
}

function insertQuery(result: { data: Record<string, unknown> | null; error: { code: string } | null }) {
  return {
    insert: jest.fn(() => ({
      select: jest.fn(() => ({ single: jest.fn(async () => result) })),
    })),
  };
}

describe("/api/my/documents contracts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireEventAccess.mockResolvedValue({
      userId,
      currentEvent: { eventId, accessRole: "owner" },
    });
    mockUpload.mockResolvedValue({ error: null });
    mockRemove.mockResolvedValue({ error: null });
  });

  it("returns 401 before document reads when the session is absent", async () => {
    mockRequireEventAccess.mockRejectedValue({ status: 401, code: "AUTHENTICATION_REQUIRED" });
    const response = await GET({} as NextRequest);
    expect(response.status).toBe(401);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("lists only the authoritative event documents", async () => {
    const eq = jest.fn(() => ({
      order: jest.fn(async () => ({
        data: [{ id: "doc", original_name: "a.pdf", category: "generic", mime_type: "application/pdf", file_size: "12", notes: null, created_at: "2026-09-22" }],
        error: null,
      })),
    }));
    mockFrom.mockReturnValue({ select: jest.fn(() => ({ eq })) });
    const response = await GET({} as NextRequest);
    expect(response.status).toBe(200);
    expect(eq).toHaveBeenCalledWith("event_id", eventId);
    await expect(response.json()).resolves.toMatchObject({ documents: [{ name: "a.pdf", fileSize: 12 }] });
  });

  it.each([
    [file("malware.exe", "application/octet-stream"), "DOCUMENT_TYPE_NOT_ALLOWED", 415],
    [file("bad.pdf", "application/pdf"), "DOCUMENT_FILE_TOO_LARGE", 413],
  ])("rejects invalid upload validation before Storage", async (value, error, status) => {
    if (error === "DOCUMENT_FILE_TOO_LARGE") {
      Object.defineProperty(value, "size", { value: 10 * 1024 * 1024 + 1 });
    }
    const response = await POST(uploadRequest(value));
    expect(response.status).toBe(status);
    await expect(response.json()).resolves.toEqual({ error });
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it("enforces the 100 MB event quota before uploading", async () => {
    mockFrom.mockReturnValue(quotaQuery([100 * 1024 * 1024]));
    const response = await POST(uploadRequest(file()));
    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({ error: "EVENT_DOCUMENT_QUOTA_EXCEEDED" });
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it("uploads and persists event-prefixed metadata", async () => {
    const row = { id: "doc", original_name: "contratto.pdf", category: "contract", mime_type: "application/pdf", file_size: 3, notes: null, created_at: "2026-09-22" };
    const insert = insertQuery({ data: row, error: null });
    mockFrom.mockReturnValueOnce(quotaQuery([])).mockReturnValueOnce(insert);
    const response = await POST(uploadRequest(file()));
    expect(response.status).toBe(201);
    const objectPath = mockUpload.mock.calls[0][0] as string;
    expect(objectPath.startsWith(`${eventId}/`)).toBe(true);
    expect(insert.insert).toHaveBeenCalledWith(expect.objectContaining({
      event_id: eventId,
      created_by: userId,
      object_path: objectPath,
    }));
  });

  it("removes the Storage object when metadata insertion fails", async () => {
    const insert = insertQuery({ data: null, error: { code: "23505" } });
    mockFrom.mockReturnValueOnce(quotaQuery([])).mockReturnValueOnce(insert);
    const response = await POST(uploadRequest(file()));
    expect(response.status).toBe(500);
    const objectPath = mockUpload.mock.calls[0][0] as string;
    expect(mockRemove).toHaveBeenCalledWith([objectPath]);
    await expect(response.json()).resolves.toEqual({ error: "EVENT_DOCUMENT_UPLOAD_FAILED" });
  });
});
