import WizardEntryGate from "@/components/routing/WizardEntryGate";
import { getOnboardingStatus } from "@/lib/onboardingClient";
import { render, waitFor } from "@testing-library/react";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({ useRouter: () => ({ replace: mockReplace }) }));
jest.mock("@/lib/onboardingClient", () => ({ getOnboardingStatus: jest.fn() }));

const mockedStatus = getOnboardingStatus as jest.MockedFunction<typeof getOnboardingStatus>;

describe("ingresso al Wizard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("avvia il Wizard per un utente autenticato senza evento", async () => {
    mockedStatus.mockResolvedValue({ kind: "needs-onboarding", accessToken: "token" });
    render(<WizardEntryGate locale="it" />);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/it/select-language"));
  });

  it("non riapre il Wizard se l'evento esiste", async () => {
    mockedStatus.mockResolvedValue({
      kind: "complete",
      accessToken: "token",
      event: { id: "event-id" },
    });
    render(<WizardEntryGate locale="it" />);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/it/dashboard"));
  });
});
