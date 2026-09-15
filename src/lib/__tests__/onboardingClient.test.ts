import { getOnboardingStatus } from "@/lib/onboardingClient";
import { getBrowserClient } from "@/lib/supabaseBrowser";

jest.mock("@/lib/supabaseBrowser", () => ({
  getBrowserClient: jest.fn(),
}));

const getSession = jest.fn();
const mockedGetBrowserClient = getBrowserClient as jest.MockedFunction<typeof getBrowserClient>;

describe("getOnboardingStatus", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockedGetBrowserClient.mockReturnValue({ auth: { getSession } } as never);
    global.fetch = jest.fn();
  });

  it("riconosce un utente non autenticato", async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: null });

    await expect(getOnboardingStatus()).resolves.toEqual({ kind: "anonymous" });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("invia al Wizard un utente autenticato senza evento", async () => {
    getSession.mockResolvedValue({ data: { session: { access_token: "token" } }, error: null });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ event: null }),
    });

    await expect(getOnboardingStatus()).resolves.toEqual({
      kind: "needs-onboarding",
      accessToken: "token",
      nextStep: "language",
    });
  });

  it("riconosce come completo un utente con evento", async () => {
    const event = { id: "event-id", country: "it", event_type: "wedding" };
    getSession.mockResolvedValue({ data: { session: { access_token: "token" } }, error: null });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ event }),
    });

    await expect(getOnboardingStatus()).resolves.toEqual({
      kind: "complete",
      accessToken: "token",
      event,
    });
  });

  it("riprende dal primo campo persistito mancante", async () => {
    getSession.mockResolvedValue({ data: { session: { access_token: "token" } }, error: null });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        event: { id: "event-id", language: "it", country: null, event_type: "wedding" },
        onboarding: { complete: false, nextStep: "country" },
      }),
    });

    await expect(getOnboardingStatus()).resolves.toEqual({
      kind: "needs-onboarding", accessToken: "token", nextStep: "country",
    });
  });

  it("preserva gli eventi accessibili quando serve una selezione", async () => {
    const events = [{ id: "event-a" }, { id: "event-b" }];
    getSession.mockResolvedValue({ data: { session: { access_token: "token" } }, error: null });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ event: null, status: "SELECTION_REQUIRED", events }),
    });

    await expect(getOnboardingStatus()).resolves.toEqual({
      kind: "needs-event-selection", accessToken: "token", events,
    });
  });

  it("non decide il redirect se la verifica del progetto fallisce", async () => {
    getSession.mockResolvedValue({ data: { session: { access_token: "token" } }, error: null });
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

    await expect(getOnboardingStatus()).rejects.toMatchObject({
      name: "OnboardingError",
      code: "PROJECT_CHECK_FAILED",
    });
  });
});
