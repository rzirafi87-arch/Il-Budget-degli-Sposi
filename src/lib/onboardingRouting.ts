import type { OnboardingStatus } from "@/lib/onboardingClient";

export function onboardingDestination(status: OnboardingStatus): string {
  if (status.kind === "anonymous") return "/auth";
  if (status.kind === "complete") return "/dashboard";
  if (status.kind === "needs-event-selection") return "/select-event";
  if (status.nextStep === "country") return "/select-country";
  if (status.nextStep === "event-type") return "/select-event-type";
  return "/select-language";
}
