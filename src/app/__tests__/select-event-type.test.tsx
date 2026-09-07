import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const replace = jest.fn();
const mockGetOnboardingStatus = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace }),
}));

jest.mock("@/lib/onboardingClient", () => ({
  getOnboardingStatus: () => mockGetOnboardingStatus(),
}));

beforeAll(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ traditions: [] }) })
  ) as unknown as typeof fetch;
});

import SelectEventTypePage from "../[locale]/(routes)/select-event-type/page";

describe("SelectEventTypePage", () => {
  beforeEach(() => {
    replace.mockClear();
    mockGetOnboardingStatus.mockReset();
    mockGetOnboardingStatus.mockResolvedValue({ kind: "needs-onboarding", accessToken: "token" });
    window.localStorage.clear();
    (document as unknown as { cookie: string }).cookie = "";
  });

  it("mantiene Matrimonio READY solo nel recupero per un account senza evento", async () => {
    window.localStorage.setItem("language", "it");
    window.localStorage.setItem("country", "it");

    render(<SelectEventTypePage />);

    const btn = (await screen.findByText("events.wedding")).closest("button");
    expect(btn).toBeTruthy();
    expect(btn).toBeEnabled();
    expect(btn).toHaveTextContent(/disponibile/i);
    fireEvent.click(btn!);

    await waitFor(() => {
      expect(window.localStorage.getItem("eventType")).toBe("wedding");
      expect(document.cookie).toMatch(/eventType=wedding/);
    });
  });

  it("non mostra la wizard a un utente con matrimonio già configurato", async () => {
    mockGetOnboardingStatus.mockResolvedValue({
      kind: "complete",
      accessToken: "token",
      event: { id: "event-a", event_type: "wedding" },
    });

    render(<SelectEventTypePage />);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/it/dashboard"));
    expect(screen.queryByText("events.wedding")).not.toBeInTheDocument();
  });

  it("rimanda la selezione multi-evento alle Impostazioni", async () => {
    mockGetOnboardingStatus.mockResolvedValue({
      kind: "needs-event-selection",
      accessToken: "token",
    });

    render(<SelectEventTypePage />);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/it/dashboard"));
    expect(screen.queryByText("events.wedding")).not.toBeInTheDocument();
  });
});
