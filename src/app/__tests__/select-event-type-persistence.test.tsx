import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockReplace = jest.fn();
const mockGetSession = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
}));
jest.mock("@/lib/supabaseBrowser", () => ({
  getBrowserClient: () => ({ auth: { getSession: () => mockGetSession() } }),
}));
jest.mock("@/lib/onboardingClient", () => ({
  getOnboardingStatus: async () => ({ kind: "needs-onboarding", accessToken: "token" }),
}));

import SelectEventTypePage from "../[locale]/(routes)/select-event-type/page";

type ApiResponse = { ok: boolean; json: () => Promise<{ ok?: boolean; error?: string }> };
let resolveCreation: (response: ApiResponse) => void;
let mockFetch: jest.Mock;

beforeEach(() => {
  mockReplace.mockClear();
  mockGetSession.mockReset();
  mockGetSession.mockResolvedValue({ data: { session: { access_token: "token" } }, error: null });
  window.localStorage.clear();
  for (const cookie of document.cookie.split(";")) {
    document.cookie = `${cookie.split("=")[0].trim()}=; Path=/; Max-Age=0`;
  }
  localStorage.setItem("language", "it");
  localStorage.setItem("country", "it");
  localStorage.setItem("eventType", "baptism");
  document.cookie = "eventType=baptism; Path=/";
  const creation = new Promise<ApiResponse>(resolve => { resolveCreation = resolve; });
  mockFetch = jest.fn((input: RequestInfo | URL) => String(input).includes("traditions")
    ? Promise.resolve({ ok: true, json: async () => ({ traditions: [] }) })
    : creation);
  global.fetch = mockFetch as typeof fetch;
});

async function selectWedding() {
  render(<SelectEventTypePage />);
  const button = (await screen.findByText("events.wedding")).closest("button");
  fireEvent.click(button!);
  await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(
    "/api/event/ensure-default", expect.objectContaining({ method: "POST" }),
  ));
}

it("preserves the previous event during creation and after a rejected save", async () => {
  const changed = jest.fn();
  window.addEventListener("event-type-changed", changed);
  try {
    await selectWedding();
    expect(localStorage.getItem("eventType")).toBe("baptism");
    expect(document.cookie).toMatch(/eventType=baptism/);
    expect(changed).not.toHaveBeenCalled();

    resolveCreation({ ok: false, json: async () => ({ error: "SAVE_FAILED" }) });
    expect(await screen.findByRole("alert")).toHaveTextContent("loadError");
    expect(localStorage.getItem("eventType")).toBe("baptism");
    expect(document.cookie).toMatch(/eventType=baptism/);
    expect(changed).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalledWith("/it/dashboard");
  } finally {
    window.removeEventListener("event-type-changed", changed);
  }
});

it("commits both client stores and dispatches the saved type before navigation", async () => {
  const changed = jest.fn((event: Event) => {
    expect((event as CustomEvent).detail).toBe("wedding");
    expect(localStorage.getItem("eventType")).toBe("wedding");
    expect(document.cookie).toMatch(/eventType=wedding/);
    expect(mockReplace).not.toHaveBeenCalledWith("/it/dashboard");
  });
  window.addEventListener("event-type-changed", changed);
  try {
    await selectWedding();
    expect(localStorage.getItem("eventType")).toBe("baptism");
    resolveCreation({ ok: true, json: async () => ({ ok: true }) });
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/it/dashboard"));
    expect(changed).toHaveBeenCalledTimes(1);
  } finally {
    window.removeEventListener("event-type-changed", changed);
  }
});

it("preserves the previous event if authentication expires before saving", async () => {
  mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
  const changed = jest.fn();
  window.addEventListener("event-type-changed", changed);
  try {
    render(<SelectEventTypePage />);
    fireEvent.click((await screen.findByText("events.wedding")).closest("button")!);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/it/auth"));
    expect(localStorage.getItem("eventType")).toBe("baptism");
    expect(document.cookie).toMatch(/eventType=baptism/);
    expect(changed).not.toHaveBeenCalled();
    expect(mockFetch.mock.calls.some(([input]) => input === "/api/event/ensure-default")).toBe(false);
  } finally {
    window.removeEventListener("event-type-changed", changed);
  }
});
