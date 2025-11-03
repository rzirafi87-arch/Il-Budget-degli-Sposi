"use client";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import React from "react";

export default function PensionePage() {
  type LocalRow = { id?: string; category: string; subcategory: string; supplier?: string | null; amount?: number | null; spend_type?: string | null; notes?: string | null };
  const [rows, setRows] = React.useState<LocalRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [demo, setDemo] = React.useState<boolean | null>(null);
  const [eventName, setEventName] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
  const supabase = getBrowserClient();
  const { data } = await supabase.auth.getSession();
  const sessionData = data as { session?: { access_token?: string } } | null;
  const jwt = sessionData?.session?.access_token;
        const headers: HeadersInit = {};
        if (jwt) headers.Authorization = `Bearer ${jwt}`;

        const res = await fetch("/api/retirement", { headers });
        const json = await res.json();
        if (!mounted) return;
        setDemo(Boolean(json.demo));
        if (json.event?.name) setEventName(json.event.name);
        setRows(json.rows || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const total = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Festa di Pensionamento</h1>
      {loading ? (
        <p>Caricamento...</p>
      ) : (
        <>
          {demo === true && <p className="mb-4 text-sm text-gray-600">Esempio demo (utente non autenticato)</p>}
          {demo === false && !eventName && (
            <p className="mb-4 text-sm text-gray-700">Non hai ancora creato una Festa di Pensionamento &mdash; crea l&apos;evento dalla dashboard per iniziare.</p>
          )}
          {eventName && <p className="mb-4 text-sm text-gray-700">Evento: {eventName}</p>}

          <div className="bg-white border rounded-lg p-4">
            <h2 className="font-semibold">Voci di budget</h2>
            <ul className="mt-3 divide-y">
              {rows.length === 0 && <li className="py-3 text-sm text-gray-500">Nessuna voce</li>}
              {rows.map((r, idx) => (
                <li key={r.id ?? idx} className="py-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{r.category} — {r.subcategory}</div>
                    {r.supplier && <div className="text-sm text-gray-500">Fornitore: {r.supplier}</div>}
                    {r.notes && <div className="text-sm text-gray-500">Note: {r.notes}</div>}
                  </div>
                  <div className="text-right">
                    <div className="font-medium">€ {Number(r.amount || 0).toFixed(2)}</div>
                    {r.spend_type && <div className="text-sm text-gray-500">{r.spend_type}</div>}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex justify-end">
              <div className="font-semibold">Totale: € {total.toFixed(2)}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
