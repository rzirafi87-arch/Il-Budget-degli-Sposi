"use client";


import LocaleSwitcher from "@/components/LocaleSwitcher";
import { useLocale } from "@/providers/LocaleProvider";
import { useEffect, useState } from "react";
import { Fragment } from "react";
  const [openCategory, setOpenCategory] = useState<string | null>(null);

type Category = { code: string; name: string };
type Subcategory = { code: string; name: string };
type TimelineStep = { code: string; title: string; description: string; sort: number };


export default function DashboardPage() {
  const { locale, country, eventType } = useLocale();
  const [categories, setCategories] = useState<Category[]>([]);
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);
  const [subcategories, setSubcategories] = useState<Record<string, Subcategory[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!eventType) {
      setCategories([]);
      setTimeline([]);
      setSubcategories({});
      return;
    }
    setLoading(true);
    Promise.all([
      fetch(`/api/i18n/categories?event=${eventType}&locale=${locale}`).then(r => r.json() as Promise<{ categories: Category[] }>),
      fetch(`/api/i18n/timeline?event=${eventType}&locale=${locale}`).then(r => r.json() as Promise<{ timeline: TimelineStep[] }>),
    ]).then(([cat, tl]) => {
      setCategories(cat.categories || []);
      setTimeline(tl.timeline || []);
      // Fetch subcategories for each category
      if (cat.categories) {
        Promise.all(
          cat.categories.map((c: Category) =>
            fetch(`/api/i18n/subcategories?event=${eventType}&category=${c.code}&locale=${locale}`)
              .then(r => r.json() as Promise<{ subcategories: Subcategory[] }>)
              .then((res) => [c.code, res.subcategories || []] as [string, Subcategory[]])
          )
        ).then((results) => {
          const map: Record<string, Subcategory[]> = {};
          results.forEach(([code, subs]) => { map[code] = subs; });
          setSubcategories(map);
        });
      } else {
        setSubcategories({});
      }
    }).finally(() => setLoading(false));
  }, [eventType, locale]);

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-2">Dashboard Demo</h1>
      <LocaleSwitcher />
      <div className="mt-4">
        <div className="mb-2">Lingua attiva: <b>{locale}</b></div>
        <div className="mb-2">Nazione selezionata: <b>{country || "—"}</b></div>
        <div className="mb-2">Tipo evento: <b>{eventType || "—"}</b></div>
      </div>
      <div className="mt-6 p-4 bg-gray-50 rounded-xl border">
        <p className="mb-2">Questa è una dashboard demo localizzata.<br/>Seleziona lingua, nazione ed evento dallo switcher sopra per vedere i valori aggiornarsi in tempo reale.</p>
        <p className="text-xs opacity-60">(Categorie e timeline sono caricate dinamicamente dalle API demo se selezioni un evento supportato)</p>
      </div>
      {loading && <div className="text-center text-sage-600">Caricamento…</div>}
      {eventType && !loading && (
        <>
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Categorie</h2>
            <ul className="divide-y divide-gray-200 border rounded-xl overflow-hidden">
              {categories.map((c) => (
                <li key={c.code}>
                  <button
                    className="w-full flex justify-between items-center px-4 py-3 bg-white hover:bg-sage-50 transition text-left"
                    onClick={() => setOpenCategory(openCategory === c.code ? null : c.code)}
                    aria-expanded={openCategory === c.code}
                  >
                    <span className="font-medium text-base">{c.name}</span>
                    <span className="ml-2 text-sage-600">{openCategory === c.code ? "▲" : "▼"}</span>
                  </button>
                  {openCategory === c.code && subcategories[c.code] && subcategories[c.code].length > 0 && (
                    <ul className="bg-sage-50 px-6 py-2 text-sm text-gray-700 animate-fade-in">
                      {subcategories[c.code].map((s) => (
                        <li key={s.code} className="py-1">{s.name}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Timeline</h2>
            <ol className="list-decimal ml-6">
              {timeline.map((t) => (
                <li key={t.code} className="mb-1"><b>{t.title}</b>: {t.description}</li>
              ))}
            </ol>
          </div>
        </>
      )}
    </main>
  );
}
