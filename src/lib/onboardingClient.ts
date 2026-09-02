import { getBrowserClient } from "@/lib/supabaseBrowser";

export type EventSummary = {
  id: string;
  language?: string | null;
  country?: string | null;
  event_type?: string | null;
};

export type OnboardingStatus =
  | { kind: "anonymous" }
  | { kind: "needs-onboarding"; accessToken: string }
  | { kind: "needs-event-selection"; accessToken: string }
  | { kind: "complete"; accessToken: string; event: EventSummary };

export async function getOnboardingStatus(): Promise<OnboardingStatus> {
  const supabase = getBrowserClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message || "Impossibile verificare la sessione");
  }

  const accessToken = data.session?.access_token;
  if (!accessToken) return { kind: "anonymous" };

  const response = await fetch("/api/event/resolve", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Impossibile verificare il progetto dell'utente");
  }

  const payload = (await response.json()) as { event?: EventSummary | null; status?: string };
  if (payload.status === "SELECTION_REQUIRED") return { kind: "needs-event-selection", accessToken };
  if (!payload.event) return { kind: "needs-onboarding", accessToken };

  return { kind: "complete", accessToken, event: payload.event };
}
