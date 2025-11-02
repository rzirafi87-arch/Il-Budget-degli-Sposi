"use client";

export type LocalizedWeddingData = {
  country_name: string;
  event_name: string;
  description?: string | null;
  timeline?: string[] | null;
  vendor_types?: string[] | null;
  main_colors?: string[] | null;
  rituals?: string[] | null;
  ceremony_types?: string[] | null;
  invitation_channel?: string[] | null;
  music_styles?: string[] | null;
  location_styles?: string[] | null;
  gifts?: string[] | null;
  food_notes?: string[] | null;
  budget_focus_pct?: {
    catering?: number;
    location?: number;
    attire?: number;
    photo_video?: number;
    decor?: number;
    entertainment?: number;
    stationery_gifts?: number;
  } | null;
};

type Props = {
  data: LocalizedWeddingData | null;
};

export default function LocalizedWeddingSection({ data }: Props) {
  if (!data) return null;

  const {
    country_name,
    event_name,
    description,
    timeline = [],
    vendor_types = [],
    main_colors = [],
    budget_focus_pct,
  } = data;

  const hasAny =
    (timeline && timeline.length > 0) ||
    (vendor_types && vendor_types.length > 0) ||
    (main_colors && main_colors.length > 0) ||
    !!budget_focus_pct ||
    !!description;

  if (!hasAny) return null;

  return (
    <section className="mt-8 grid gap-6">
      <header className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">
          Preset localizzati — {event_name} in {country_name}
        </h2>
        {description ? (
          <p className="mt-2 text-sm text-gray-700">{description}</p>
        ) : null}
      </header>

      {/* Timeline */}
      {timeline && timeline.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Timeline suggerita</h3>
          <ol className="list-decimal ml-5 space-y-1 text-gray-800">
            {timeline.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Vendor Types */}
      {vendor_types && vendor_types.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-lg mb-3">Fornitori consigliati</h3>
          <div className="flex flex-wrap gap-2">
            {vendor_types.map((v) => (
              <span key={v} className="px-3 py-1 rounded-full text-sm bg-sage-50 border border-sage-200 text-[#2f4231]">
                {v}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Colors */}
      {main_colors && main_colors.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-lg mb-3">Colori ricorrenti</h3>
          <div className="flex flex-wrap gap-2">
            {main_colors.map((c) => (
              <span key={c} className="px-3 py-1 rounded-full text-sm bg-gray-50 border border-gray-200 text-gray-900">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Budget focus */}
      {budget_focus_pct && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-lg mb-3">Focus di budget (percentuali)</h3>
          <ul className="space-y-2 text-gray-900">
            {Object.entries(budget_focus_pct).map(([k, v]) => (
              <li key={k} className="flex items-center gap-3">
                <span className="w-48 capitalize">{labelForBudgetKey(k)}</span>
                <div className="flex-1 h-3 bg-gray-100 rounded">
                  <div className="h-3 rounded" style={{ width: `${(v || 0)}%`, background: "var(--color-sage)" }} />
                </div>
                <span className="w-12 text-right tabular-nums">{(v || 0).toFixed(0)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function labelForBudgetKey(key: string): string {
  switch (key) {
    case "catering":
      return "Catering";
    case "location":
      return "Location";
    case "attire":
      return "Abiti";
    case "photo_video":
      return "Foto/Video";
    case "decor":
      return "Decor";
    case "entertainment":
      return "Intrattenimento";
    case "stationery_gifts":
      return "Stationery/Regali";
    default:
      return key;
  }
}
