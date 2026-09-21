"use client";

import { AppButton } from "@/components/ui/AppButton";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

type Endpoint = { scope: "saved" | "private"; resourceId: string };
type TimelineSummary = { id: string; title: string; completed: boolean | null };
type AppointmentSummary = { id: string; title: string; date: string };

export function SupplierWorkSummary({ endpoint }: { endpoint: Endpoint | null }) {
  const t = useTranslations("branch52M4.inverse");
  const locale = useLocale();
  const [state, setState] = useState<
    | { kind: "idle" | "loading" | "error" }
    | { kind: "ready"; timeline: TimelineSummary[]; appointments: AppointmentSummary[] }
  >({ kind: "idle" });

  const load = useCallback(async () => {
    if (!endpoint) {
      setState({ kind: "idle" });
      return;
    }
    setState({ kind: "loading" });
    try {
      const { data } = await getBrowserClient().auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("AUTHENTICATION_REQUIRED");
      const query = `supplier_scope=${endpoint.scope}&supplier_resource_id=${endpoint.resourceId}`;
      const headers = { authorization: `Bearer ${token}` };
      const [timelineResponse, appointmentsResponse] = await Promise.all([
        fetch(`/api/my/timeline?${query}`, { headers, cache: "no-store" }),
        fetch(`/api/my/appointments?${query}`, { headers, cache: "no-store" }),
      ]);
      if (!timelineResponse.ok || !appointmentsResponse.ok) throw new Error("SUPPLIER_WORK_READ_FAILED");
      const timelineBody = await timelineResponse.json() as { items?: TimelineSummary[] };
      const appointmentsBody = await appointmentsResponse.json() as { appointments?: AppointmentSummary[] };
      setState({
        kind: "ready",
        timeline: timelineBody.items ?? [],
        appointments: appointmentsBody.appointments ?? [],
      });
    } catch {
      setState({ kind: "error" });
    }
  }, [endpoint]);

  useEffect(() => { void load(); }, [load]);

  const query = endpoint ? `supplier_scope=${endpoint.scope}&supplier_resource_id=${endpoint.resourceId}` : "";
  return (
    <section className="app-card app-card--md space-y-5" data-testid="supplier-work-summary">
      <h2 className="font-serif text-2xl text-fg">{t("title")}</h2>
      {!endpoint ? <p className="text-sm text-muted-fg">{t("saveFirst")}</p> : state.kind === "loading" ? (
        <p className="text-sm text-muted-fg" aria-live="polite">{t("loading")}</p>
      ) : state.kind === "error" ? (
        <div className="flex flex-wrap items-center gap-3 text-sm text-red-700 dark:text-red-300" role="alert">
          <span>{t("error")}</span>
          <AppButton variant="outline" onClick={() => void load()}><RefreshCw size={16} aria-hidden />{t("retry")}</AppButton>
        </div>
      ) : state.kind === "ready" ? (
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-fg">{t("timelineTitle")}</h3>
              <Link className="text-sm text-primary underline" href={`/${locale}/timeline?${query}`}>{t("openTimeline")}</Link>
            </div>
            {state.timeline.length === 0 ? <p className="mt-2 text-sm text-muted-fg">{t("timelineEmpty")}</p> : (
              <ul className="mt-2 space-y-2">
                {state.timeline.map((item) => <li key={item.id} className="rounded-lg border border-border bg-bg p-2 text-sm text-fg">{item.title}</li>)}
              </ul>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-fg">{t("appointmentsTitle")}</h3>
              <Link className="text-sm text-primary underline" href={`/${locale}/documenti/appuntamenti?${query}`}>{t("openAppointments")}</Link>
            </div>
            {state.appointments.length === 0 ? <p className="mt-2 text-sm text-muted-fg">{t("appointmentsEmpty")}</p> : (
              <ul className="mt-2 space-y-2">
                {state.appointments.map((item) => <li key={item.id} className="rounded-lg border border-border bg-bg p-2 text-sm text-fg"><span className="font-medium">{item.title}</span><span className="ml-2 text-muted-fg">{item.date}</span></li>)}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
