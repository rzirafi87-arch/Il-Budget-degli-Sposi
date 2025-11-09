"use client";

import { useEffect, useState } from "react";

type Row = {
  id: number;
  ts: string;
  event_type: string;
  locale: string;
  categories_expected: number;
  categories_actual: number;
  subcategories_expected: number;
  subcategories_actual: number;
  timeline_expected: number;
  timeline_actual: number;
  images_expected: number;
  images_actual: number;
  ok: boolean;
};

export default function HealthPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/health/latest", { cache: "no-store" });
      const payload = await res.json();
      if (!payload.ok) {
        throw new Error(payload.error || "Unable to load health data");
      }
      setRows(payload.data ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/health/refresh", { method: "POST" });
      const payload = await res.json();
      if (!payload.ok) {
        throw new Error(payload.error || "Unable to recompute health data");
      }
      setRows(payload.data ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const pct = (actual: number, expected: number) => {
    if (expected === 0) return 0;
    return Math.round((actual / expected) * 100);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">App Health Dashboard</h1>
        <div className="space-x-2">
          <button onClick={load} className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">
            Reload
          </button>
          <button
            onClick={refresh}
            className="px-3 py-2 rounded-lg bg-black text-white hover:bg-gray-800"
          >
            Recompute
          </button>
        </div>
      </div>

      {err && <div className="p-3 rounded bg-red-100 text-red-800">{err}</div>}
      {loading && <div>Loading…</div>}

      {!loading && !err && rows.length === 0 && (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
          Nessun dato disponibile. Premi <span className="font-medium">Recompute</span> per generare il primo snapshot.
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Event</th>
                <th className="px-3 py-2 text-left">Locale</th>
                <th className="px-3 py-2 text-left">Categories</th>
                <th className="px-3 py-2 text-left">Subcategories</th>
                <th className="px-3 py-2 text-left">Timeline</th>
                <th className="px-3 py-2 text-left">Images</th>
                <th className="px-3 py-2 text-left">OK</th>
                <th className="px-3 py-2 text-left">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const c = pct(row.categories_actual, row.categories_expected);
                const s = pct(row.subcategories_actual, row.subcategories_expected);
                const t = pct(row.timeline_actual, row.timeline_expected);
                const i = pct(row.images_actual, row.images_expected);
                const badgeColor = row.ok
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800";

                return (
                  <tr key={row.id} className="border-t">
                    <td className="px-3 py-2 font-medium">{row.event_type}</td>
                    <td className="px-3 py-2">{row.locale}</td>
                    <td className="px-3 py-2">
                      {row.categories_actual}/{row.categories_expected} ({c}%)
                    </td>
                    <td className="px-3 py-2">
                      {row.subcategories_actual}/{row.subcategories_expected} ({s}%)
                    </td>
                    <td className="px-3 py-2">
                      {row.timeline_actual}/{row.timeline_expected} ({t}%)
                    </td>
                    <td className="px-3 py-2">
                      {row.images_actual}/{row.images_expected} ({i}%)
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded ${badgeColor}`}>
                        {row.ok ? "OK" : "Needs work"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {new Date(row.ts).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
