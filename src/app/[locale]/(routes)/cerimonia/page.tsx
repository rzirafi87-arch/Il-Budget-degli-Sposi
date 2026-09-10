"use client";

import { getBrowserClient } from "@/lib/supabaseBrowser";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Ceremony = {
  ceremony_type: "civil" | "religious" | "other" | "undecided";
  religion: string;
  denomination: string;
  ceremony_place_kind: string;
  ceremony_place_name: string;
  ceremony_place_address: string;
  ceremony_officiant: string;
};

const empty: Ceremony = { ceremony_type: "undecided", religion: "unspecified", denomination: "", ceremony_place_kind: "", ceremony_place_name: "", ceremony_place_address: "", ceremony_officiant: "" };
const types = [["civil", "Rito civile"], ["religious", "Rito religioso"], ["other", "Altro"], ["undecided", "Da definire"]] as const;
const religions = [["unspecified", "Non specificato"], ["catholic", "Cattolico"], ["christian_non_catholic", "Cristiano non cattolico"], ["islamic", "Islamico"], ["jewish", "Ebraico"], ["hindu", "Induista"], ["buddhist", "Buddhista"], ["other", "Altra religione o confessione"]];
const civilPlaces = ["Comune / Municipio", "Sala comunale", "Casa comunale", "Location per il rito", "Altra sede"];
const religiousPlaces = ["Chiesa", "Basilica", "Cattedrale", "Abbazia", "Santuario", "Cappella", "Moschea", "Sinagoga", "Tempio", "Altro luogo di culto"];

export default function CeremonyPage() {
  const { locale = "it" } = useParams<{ locale: string }>();
  const [form, setForm] = useState<Ceremony>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const update = (key: keyof Ceremony, value: string) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data } = await getBrowserClient().auth.getSession();
      const token = data.session?.access_token;
      const response = await fetch("/api/ceremony", { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const json = await response.json();
      if (active && json.ceremony) {
        const ceremony = json.ceremony;
        setForm({
          ...empty,
          ...ceremony,
          ceremony_type: ceremony.ceremony_type || (ceremony.church_id ? "religious" : "undecided"),
          ceremony_place_kind: ceremony.ceremony_place_kind || (ceremony.church_id ? "Chiesa" : ""),
          ceremony_place_name: ceremony.ceremony_place_name || ceremony.church_name || ceremony.location_name || "",
          ceremony_place_address: ceremony.ceremony_place_address || ceremony.church_address || ceremony.location_address || "",
        });
      }
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  async function save() {
    setSaving(true); setMessage("");
    const { data } = await getBrowserClient().auth.getSession();
    const response = await fetch("/api/ceremony", { method: "PUT", headers: { "Content-Type": "application/json", ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}) }, body: JSON.stringify(form) });
    setMessage(response.ok ? "Cerimonia salvata." : "Non è stato possibile salvare la cerimonia.");
    setSaving(false);
  }

  if (loading) return <p className="p-6 text-gray-600">Caricamento cerimonia…</p>;
  const placeOptions = form.ceremony_type === "civil" ? civilPlaces : religiousPlaces;
  return <main className="mx-auto max-w-4xl space-y-6 px-3 py-5 sm:p-6">
    <header><p className="text-sm font-semibold uppercase tracking-wide text-rose-700">Cerimonia</p><h1 className="font-serif text-3xl font-bold">Come celebrerete il matrimonio?</h1><p className="mt-2 text-gray-600">Puoi cambiare queste informazioni in qualsiasi momento. Nessuna scelta è obbligatoria.</p></header>
    <section className="grid gap-3 sm:grid-cols-2" aria-label="Tipo di cerimonia">
      {types.map(([value, label]) => <button key={value} type="button" aria-pressed={form.ceremony_type === value} onClick={() => update("ceremony_type", value)} className={`min-h-14 rounded-xl border px-4 text-left font-semibold ${form.ceremony_type === value ? "border-rose-600 bg-rose-50 text-rose-900" : "border-gray-300 bg-white"}`}>{label}</button>)}
    </section>
    {form.ceremony_type === "religious" && <section className="rounded-xl border bg-white p-4"><label className="block font-semibold">Religione o confessione<select value={form.religion} onChange={(e) => update("religion", e.target.value)} className="mt-2 min-h-12 w-full rounded-lg border px-3">{religions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="mt-4 block font-semibold">Dettaglio confessione (facoltativo)<input value={form.denomination} onChange={(e) => update("denomination", e.target.value)} className="mt-2 min-h-12 w-full rounded-lg border px-3" /></label></section>}
    {form.ceremony_type !== "undecided" && <section className="space-y-4 rounded-xl border bg-white p-4"><h2 className="text-xl font-bold">Luogo della cerimonia</h2><label className="block font-semibold">Tipo di luogo<select value={form.ceremony_place_kind} onChange={(e) => update("ceremony_place_kind", e.target.value)} className="mt-2 min-h-12 w-full rounded-lg border px-3"><option value="">Da definire</option>{placeOptions.map((value) => <option key={value}>{value}</option>)}</select></label><label className="block font-semibold">Nome del luogo<input value={form.ceremony_place_name} onChange={(e) => update("ceremony_place_name", e.target.value)} placeholder="Inserisci luogo manualmente" className="mt-2 min-h-12 w-full rounded-lg border px-3" /></label><label className="block font-semibold">Indirizzo (facoltativo)<input value={form.ceremony_place_address} onChange={(e) => update("ceremony_place_address", e.target.value)} className="mt-2 min-h-12 w-full rounded-lg border px-3" /></label><p className="text-sm text-gray-600">Il luogo inserito qui resta privato e appartiene soltanto al vostro evento.</p><div className="flex flex-wrap gap-3"><Link href={`/${locale}/chiese`} className="rounded-full border px-4 py-2 font-semibold">Cerca luoghi di culto</Link><Link href={`/${locale}/location`} className="rounded-full border px-4 py-2 font-semibold">Cerca location</Link></div></section>}
    <label className="block rounded-xl border bg-white p-4 font-semibold">Celebrante (facoltativo)<input value={form.ceremony_officiant} onChange={(e) => update("ceremony_officiant", e.target.value)} className="mt-2 min-h-12 w-full rounded-lg border px-3" /></label>
    <div className="sticky bottom-3 flex items-center justify-between gap-3 rounded-xl border bg-white/95 p-3 shadow"><span role="status" className="text-sm">{message}</span><button type="button" onClick={save} disabled={saving} className="min-h-12 rounded-full bg-rose-700 px-6 font-semibold text-white disabled:opacity-60">{saving ? "Salvataggio…" : "Salva cerimonia"}</button></div>
  </main>;
}
