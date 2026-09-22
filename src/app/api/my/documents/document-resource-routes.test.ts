const mockRequireEventAccess = jest.fn();
const mockRequireEventResource = jest.fn();
const mockRemove = jest.fn();
const mockCreateSignedUrl = jest.fn();
const mockFrom = jest.fn();

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
const context = { params: Promise.resolve({ id: documentId }) };

describe("document download and delete contracts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireEventAccess.mockResolvedValue({ currentEvent: { eventId, accessRole: "owner" } });
    mockRequireEventResource.mockResolvedValue({
      id: documentId,
      object_path: `${eventId}/${documentId}/contratto.pdf`,
      original_name: "contratto.pdf",
    });
    mockRemove.mockResolvedValue({ error: null });
    mockCreateSignedUrl.mockResolvedValue({ data: { signedUrl: "https://signed.invalid/doc" }, error: null });
  });

  it("returns a signed download URL limited to 60 seconds", async () => {
    const response = await DOWNLOAD({} as NextRequest, context);
    expect(response.status).toBe(200);
    expect(mockCreateSignedUrl).toHaveBeenCalledWith(
      `${eventId}/${documentId}/contratto.pdf`,
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

  it("deletes Storage and same-event metadata", async () => {
    const maybeSingle = jest.fn(async () => ({ data: { id: documentId }, error: null }));
    const eqEvent = jest.fn(() => ({ select: jest.fn(() => ({ maybeSingle })) }));
    const eqId = jest.fn(() => ({ eq: eqEvent }));
    mockFrom.mockReturnValue({ delete: jest.fn(() => ({ eq: eqId })) });
    const response = await DELETE({} as NextRequest, context);
    expect(response.status).toBe(200);
    expect(mockRemove).toHaveBeenCalledWith([`${eventId}/${documentId}/contratto.pdf`]);
    expect(eqId).toHaveBeenCalledWith("id", documentId);
    expect(eqEvent).toHaveBeenCalledWith("event_id", eventId);
  });

  it("returns 401 before resource or Storage access", async () => {
    mockRequireEventAccess.mockRejectedValue({ status: 401, code: "AUTHENTICATION_REQUIRED" });
    const response = await DELETE({} as NextRequest, context);
    expect(response.status).toBe(401);
    expect(mockRequireEventResource).not.toHaveBeenCalled();
    expect(mockRemove).not.toHaveBeenCalled();
  });
});
