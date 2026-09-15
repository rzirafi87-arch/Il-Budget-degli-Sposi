import type { OnboardingStatus } from "@/lib/onboardingClient";
import { onboardingDestination } from "@/lib/onboardingRouting";

describe("Branch 48 server-derived onboarding routing", () => {
  it.each<[OnboardingStatus, string]>([
    [{ kind: "anonymous" }, "/auth"],
    [{ kind: "needs-onboarding", accessToken: "token", nextStep: "language" }, "/select-language"],
    [{ kind: "needs-onboarding", accessToken: "token", nextStep: "country" }, "/select-country"],
    [{ kind: "needs-onboarding", accessToken: "token", nextStep: "event-type" }, "/select-event-type"],
    [{ kind: "needs-event-selection", accessToken: "token", events: [] }, "/select-event"],
    [{ kind: "complete", accessToken: "token", event: { id: "event" } }, "/dashboard"],
  ])("maps %o to %s", (status, expected) => {
    expect(onboardingDestination(status)).toBe(expected);
  });
});
