"use client";

import { AppCard } from "@/components/ui/AppCard";
import { getEventTypeCapability, normalizeEventType } from "@/lib/eventTypeCapabilities";
import { Clock3, ShieldCheck } from "lucide-react";
import { useLocale } from "next-intl";

const COPY = {
  it: {
    badge: "Coming Soon",
    title: "Tipo evento non ancora disponibile",
    legacyTitle: "Evento legacy preservato",
    legacyBody:
      "I dati di questo evento sono stati preservati. Finché il flusso dedicato non sarà completo, l’app limita i moduli per evitare di mostrare funzioni o tassonomie del Matrimonio non pertinenti.",
    noDataLoss: "Nessun dato dell’evento viene cancellato o convertito automaticamente.",
  },
  en: {
    badge: "Coming Soon",
    title: "Event type not available yet",
    legacyTitle: "Legacy event preserved",
    legacyBody:
      "This event’s data has been preserved. Until its dedicated workflow is complete, the app limits modules to avoid showing Wedding features or taxonomies that do not apply.",
    noDataLoss: "No event data is deleted or automatically converted.",
  },
  es: {
    badge: "Coming Soon",
    title: "Tipo de evento aún no disponible",
    legacyTitle: "Evento heredado preservado",
    legacyBody:
      "Los datos de este evento se han preservado. Hasta que el flujo específico esté completo, la app limita los módulos para evitar mostrar funciones o taxonomías de Boda que no correspondan.",
    noDataLoss: "No se elimina ni se convierte automáticamente ningún dato del evento.",
  },
} as const;

export default function EventAvailabilityNotice({
  eventType,
  legacy = false,
}: {
  eventType: string | null | undefined;
  legacy?: boolean;
}) {
  const locale = useLocale();
  const language = locale === "en" ? "en" : locale === "es" ? "es" : "it";
  const copy = COPY[language];
  const normalized = normalizeEventType(eventType);
  const capability = getEventTypeCapability(normalized);

  return (
    <AppCard className="mx-auto max-w-3xl" padding="lg">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <span className="app-page-header__icon shrink-0">
          <Clock3 size={24} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
              {copy.badge}
            </span>
            <span className="text-sm font-semibold text-muted-fg">{normalized}</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-fg">
            {legacy ? copy.legacyTitle : copy.title}
          </h1>
          <p className="mt-3 text-muted-fg">
            {legacy ? copy.legacyBody : capability.description[language]}
          </p>
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-3 text-sm text-muted-fg">
            <ShieldCheck size={18} className="mt-0.5 shrink-0" aria-hidden />
            <span>{copy.noDataLoss}</span>
          </div>
        </div>
      </div>
    </AppCard>
  );
}
