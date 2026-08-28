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

  it("non decide il redirect se la verifica del progetto fallisce", async () => {
    getSession.mockResolvedValue({ data: { session: { access_token: "token" } }, error: null });
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

    await expect(getOnboardingStatus()).rejects.toThrow("Impossibile verificare il progetto");
  });
});
