"use client";

import { AppCard } from "@/components/ui/AppCard";
import { normalizeEventType } from "@/lib/eventTypeCapabilities";
import { Clock3, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export default function EventAvailabilityNotice({
  eventType,
  legacy = false,
}: {
  eventType: string | null | undefined;
  legacy?: boolean;
}) {
  const t = useTranslations("milestone9.availability");
  const normalized = normalizeEventType(eventType);

  return (
    <AppCard className="mx-auto max-w-3xl" padding="lg">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <span className="app-page-header__icon shrink-0">
          <Clock3 size={24} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
              {t("badge")}
            </span>
            <span className="text-sm font-semibold text-muted-fg">{normalized}</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-fg">
            {legacy ? t("legacyTitle") : t("title")}
          </h1>
          <p className="mt-3 text-muted-fg">
            {legacy ? t("legacyBody") : t("description", {event: normalized})}
          </p>
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-3 text-sm text-muted-fg">
            <ShieldCheck size={18} className="mt-0.5 shrink-0" aria-hidden />
            <span>{t("noDataLoss")}</span>
          </div>
        </div>
      </div>
    </AppCard>
  );
}
