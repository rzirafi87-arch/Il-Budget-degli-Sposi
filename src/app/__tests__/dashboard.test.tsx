import AppEntryGate from "@/components/routing/AppEntryGate";
import { getOnboardingStatus } from "@/lib/onboardingClient";
import { render, waitFor } from "@testing-library/react";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({ useRouter: () => ({ replace: mockReplace }) }));
jest.mock("@/lib/onboardingClient", () => ({ getOnboardingStatus: jest.fn() }));

const mockedStatus = getOnboardingStatus as jest.MockedFunction<typeof getOnboardingStatus>;

describe("destinazione iniziale", () => {
  beforeEach(() => jest.clearAllMocks());

  it("porta alla Dashboard un utente con un evento", async () => {
    mockedStatus.mockResolvedValue({
      kind: "complete",
      accessToken: "token",
      event: { id: "event-id", country: "it", event_type: "wedding" },
    });
    render(<AppEntryGate locale="it" />);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/it/dashboard"));
  });

  it("mantiene il comportamento pubblico per un utente anonimo", async () => {
    mockedStatus.mockResolvedValue({ kind: "anonymous" });
    render(<AppEntryGate locale="it" />);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/it/welcome"));
  });
});
