export {};

const mockRequireAdminSync = jest.fn();
const mockGetServiceClient = jest.fn();

jest.mock("@/lib/adminSyncAuth", () => ({
  requireAdminSync: (...args: unknown[]) => mockRequireAdminSync(...args),
}));

jest.mock("@/lib/supabaseServer", () => ({
  getServiceClient: () => mockGetServiceClient(),
}));

import { NextRequest } from "next/server";
import { POST as postPlaces } from "@/app/api/sync/places/route";
import { POST as postWikidata } from "@/app/api/sync/wikidata/route";
import { POST as postOsm } from "@/app/api/sync/osm/route";

function request(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/sync/test", {
    method: "POST",
    headers: {
      authorization: "Bearer test-admin-secret",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("protected sync routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdminSync.mockImplementation(() => undefined);
  });

  it.each([
    ["places", postPlaces],
    ["wikidata", postWikidata],
    ["osm", postOsm],
  ])("rejects an unauthorized %s sync before accessing Supabase", async (_name, handler) => {
    mockRequireAdminSync.mockImplementation(() => {
      throw new Error("Unauthorized");
    });

    const response = await handler(request({}));

    expect(response.status).toBe(401);
    expect(mockGetServiceClient).not.toHaveBeenCalled();
  });

  it("rejects a Google Places region outside the allowlist", async () => {
    const response = await postPlaces(
      request({ region: "Atlantide", type: "location" }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid region" });
    expect(mockGetServiceClient).not.toHaveBeenCalled();
  });

  it("rejects a Google Places type outside the allowlist", async () => {
    const response = await postPlaces(
      request({ region: "Sicilia", type: "anything" }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid type" });
    expect(mockGetServiceClient).not.toHaveBeenCalled();
  });

  it("rejects an unsafe OSM area before accessing Supabase", async () => {
    const response = await postOsm(
      request({ area: "Sicilia\";out;", type: "church", region: "Sicilia" }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid area" });
    expect(mockGetServiceClient).not.toHaveBeenCalled();
  });

  it("rejects an OSM type outside the allowlist", async () => {
    const response = await postOsm(
      request({ area: "Sicilia", type: "anything", region: "Sicilia" }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid type" });
    expect(mockGetServiceClient).not.toHaveBeenCalled();
  });

  it("rejects an OSM region outside the allowlist", async () => {
    const response = await postOsm(
      request({ area: "Sicilia", type: "church", region: "Atlantide" }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid region" });
    expect(mockGetServiceClient).not.toHaveBeenCalled();
  });
});
