"use client";

import React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export default function LaureaPage() {
  const locale = useLocale();
  const t = useTranslations("milestone9.runtime.graduation");
  const [tasks, setTasks] = React.useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem("graduation.checklist");
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });
  const checklist: { id: string; label: string; required?: boolean }[] = [
    { id: "budget-date", label: t("checklist.items.budgetDate"), required: true },
    { id: "location", label: t("checklist.items.location"), required: true },
    { id: "catering", label: t("checklist.items.catering"), required: true },
    { id: "inviti", label: t("checklist.items.invitations") },
    { id: "musica", label: t("checklist.items.music") },
    { id: "foto", label: t("checklist.items.photos") },
    { id: "torta", label: t("checklist.items.cake") },
    { id: "decorazioni", label: t("checklist.items.decorations") },
    { id: "gadget", label: t("checklist.items.gadgets") },
    { id: "programma", label: t("checklist.items.schedule") },
  ];
  React.useEffect(() => {
    try { localStorage.setItem("graduation.checklist", JSON.stringify(tasks)); } catch {}
  }, [tasks]);
  function setGraduationEvent() {
    try {
      localStorage.setItem("eventType", "graduation");
      document.cookie = `eventType=graduation; Path=/; Max-Age=15552000; SameSite=Lax`;
      alert(t("eventSetAlert"));
    } catch {}
  }

  return (
    <section className="pt-4">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-serif font-bold">{t("title")}</h1>
        <p className="text-gray-700 mt-2">
          {t("intro")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-2">{t("sections.budget.title")}</h2>
          <p className="text-gray-700 mb-3">
            {t("sections.budget.description")}
          </p>
          <ul className="list-disc list-inside text-gray-800 space-y-1">
            <li>{t("sections.budget.items.estimate")}</li>
            <li>{t("sections.budget.items.quotes")}</li>
            <li>{t("sections.budget.items.sharing")}</li>
          </ul>
        </div>

        <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-2">{t("sections.venue.title")}</h2>
          <p className="text-gray-700 mb-3">
            {t("sections.venue.description")}
          </p>
          <ul className="list-disc list-inside text-gray-800 space-y-1">
            <li>{t("sections.venue.items.spaces")}</li>
            <li>{t("sections.venue.items.menu")}</li>
            <li>{t("sections.venue.items.toast")}</li>
          </ul>
        </div>

        <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-2">{t("sections.guests.title")}</h2>
          <p className="text-gray-700 mb-3">
            {t("sections.guests.description")}
          </p>
          <ul className="list-disc list-inside text-gray-800 space-y-1">
            <li>{t("sections.guests.items.digital")}</li>
            <li>{t("sections.guests.items.rsvp")}</li>
            <li>{t("sections.guests.items.reminders")}</li>
          </ul>
        </div>

        <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-2">{t("sections.atmosphere.title")}</h2>
          <p className="text-gray-700 mb-3">
            {t("sections.atmosphere.description")}
          </p>
          <ul className="list-disc list-inside text-gray-800 space-y-1">
            <li>{t("sections.atmosphere.items.photos")}</li>
            <li>{t("sections.atmosphere.items.music")}</li>
            <li>{t("sections.atmosphere.items.decorations")}</li>
          </ul>
        </div>
      </div>

      {/* Mini Checklist */}
      <div className="mt-6 p-5 rounded-2xl border-l-4 border-yellow-400 bg-yellow-50 shadow-sm">
        <h2 className="text-xl font-semibold mb-2 text-yellow-800">{t("checklist.title")}</h2>
        <ul className="space-y-1">
          {checklist.map((c) => (
            <li key={c.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!tasks[c.id]}
                onChange={() => setTasks((prev) => ({ ...prev, [c.id]: !prev[c.id] }))}
                className="accent-yellow-600"
              />
              <span className={tasks[c.id] ? "line-through text-gray-400" : "font-medium text-yellow-900"}>{c.label}</span>
              {c.required ? <span className="text-xs text-yellow-700 ml-1">{t("checklist.required")}</span> : null}
            </li>
          ))}
        </ul>
        <div className="mt-3 text-sm text-yellow-800">
          {t("checklist.tip")}
        </div>
      </div>

      {/* Inviti Rapidi (tool locale) */
      }
      <QuickInvites />

      {/* Mini RSVP (locale) */}
      <QuickRSVP />

      {/* Suggerimenti & Consigli */}
      <div className="mt-6 p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-2">{t("tips.title")}</h2>
        <ul className="list-disc list-inside text-gray-800 space-y-1">
          <li>{t("tips.accessibleVenue")}</li>
          <li>{t("tips.confirmCatering")}</li>
          <li>{t("tips.simpleSchedule")}</li>
          <li>{t("tips.limitedBudget")}</li>
          <li>{t("tips.themeDetails")}</li>
        </ul>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={setGraduationEvent}
          className="px-5 py-3 rounded-full text-white font-semibold shadow-sm"
          style={{ background: 'var(--color-sage)' }}
        >
          {t("actions.setEvent")}
        </button>
        <Link
          href={`/${locale}/idea-di-budget`}
          className="px-5 py-3 rounded-full text-white font-semibold shadow-sm"
          style={{ background: '#6b7e65' }}
        >
          {t("actions.openBudgetIdea")}
        </Link>
        <Link
          href={`/${locale}/select-event-type`}
          className="px-5 py-3 rounded-full border-2 border-[#A3B59D] text-[#2f4231] hover:bg-[#A3B59D] hover:text-white transition font-semibold"
        >
          {t("actions.backToEventChoice")}
        </Link>
      </div>

      <div className="mt-8 p-5 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900">
        <p className="text-sm">
          {t("comingSoon")}
        </p>
      </div>
    </section>
  );
}

function QuickInvites() {
  const t = useTranslations("milestone9.runtime.graduation.quickInvites");
  const [input, setInput] = React.useState<string>("");
  const names = React.useMemo(() => input.split(/\r?\n/).map(s => s.trim()).filter(Boolean), [input]);
  function downloadCsv() {
    const header = `${t("csvName")}\\n`;
    const csv = header + names.map(n => n.replace(/"/g, '""')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inviti-laurea.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
  async function copyList() {
    try { await navigator.clipboard.writeText(names.join('\n')); } catch {}
  }
  return (
    <div className="mt-6 p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold mb-1">{t("title")}</h2>
          <p className="text-sm text-gray-700">{t("description")}</p>
        </div>
        <div className="text-sm text-gray-700">{t("total", { count: names.length })}</div>
      </div>
      <textarea
        className="mt-3 w-full min-h-[120px] border rounded-lg px-3 py-2"
        placeholder={t("placeholder")}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="mt-3 flex gap-2 flex-wrap">
        <button onClick={downloadCsv} className="px-4 py-2 rounded-full text-white" style={{ background: 'var(--color-sage)' }}>{t("downloadCsv")}</button>
        <button onClick={copyList} className="px-4 py-2 rounded-full border">{t("copyList")}</button>
      </div>
    </div>
  );
}

function QuickRSVP() {
  const t = useTranslations("milestone9.runtime.graduation.quickRsvp");
  type Entry = { id: string; name: string; contact?: string; invited: boolean; confirmed: boolean; notes?: string };
  const [entries, setEntries] = React.useState<Entry[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('graduation.rsvpList');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [newName, setNewName] = React.useState('');
  const [newContact, setNewContact] = React.useState('');
  const invitedCount = entries.filter(e => e.invited).length;
  const confirmedCount = entries.filter(e => e.confirmed).length;
  React.useEffect(() => {
    try { localStorage.setItem('graduation.rsvpList', JSON.stringify(entries)); } catch {}
  }, [entries]);

  function addEntry() {
    if (!newName.trim()) return;
    const e: Entry = { id: `g-${Date.now()}`, name: newName.trim(), contact: newContact.trim() || undefined, invited: true, confirmed: false };
    setEntries(prev => [...prev, e]);
    setNewName('');
    setNewContact('');
  }
  function updateEntry(id: string, patch: Partial<Entry>) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  }
  function removeEntry(id: string) {
    setEntries(prev => prev.filter(e => e.id !== id));
  }
  function exportCsv() {
    const header = `${t("csvHeaders")}\n`;
    const csv = header + entries.map(e => [e.name, e.contact || '', e.invited ? t("yes") : t("no"), e.confirmed ? t("yes") : t("no"), e.notes || ''].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rsvp-laurea.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
  async function copySummary() {
    const lines = [
      t("summaryInvited", { count: invitedCount }),
      t("summaryConfirmed", { count: confirmedCount }),
      '',
      ...entries.map(e => `${e.confirmed ? '✅' : '⏳'} ${e.name}${e.contact ? ' ('+e.contact+')' : ''}`)
    ].join('\n');
    try { await navigator.clipboard.writeText(lines); } catch {}
  }

  return (
    <div className="mt-6 p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold mb-1">{t("title")}</h2>
          <p className="text-sm text-gray-700">{t("description")}</p>
        </div>
        <div className="text-sm text-gray-700">
          {t("counts", { invited: invitedCount, confirmed: confirmedCount })}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          className="border rounded-lg px-3 py-2"
          placeholder={t("namePlaceholder")}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          className="border rounded-lg px-3 py-2"
          placeholder={t("contactPlaceholder")}
          value={newContact}
          onChange={(e) => setNewContact(e.target.value)}
        />
        <button onClick={addEntry} className="px-4 py-2 rounded-full text-white font-semibold" style={{ background: 'var(--color-sage)' }}>{t("add")}</button>
      </div>
      {entries.length === 0 ? (
        <div className="mt-4 text-sm text-gray-500">{t("empty")}</div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">{t("columns.name")}</th>
                <th className="p-2 text-left">{t("columns.contact")}</th>
                <th className="p-2 text-center">{t("columns.invited")}</th>
                <th className="p-2 text-center">RSVP</th>
                <th className="p-2 text-left">{t("columns.notes")}</th>
                <th className="p-2">{t("columns.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="p-2">
                    <input className="border rounded px-2 py-1 w-full" value={e.name} onChange={(ev)=>updateEntry(e.id, { name: ev.target.value })} />
                  </td>
                  <td className="p-2">
                    <input className="border rounded px-2 py-1 w-full" value={e.contact || ''} onChange={(ev)=>updateEntry(e.id, { contact: ev.target.value })} />
                  </td>
                  <td className="p-2 text-center">
                    <input type="checkbox" checked={e.invited} onChange={()=>updateEntry(e.id, { invited: !e.invited })} />
                  </td>
                  <td className="p-2 text-center">
                    <input type="checkbox" checked={e.confirmed} onChange={()=>updateEntry(e.id, { confirmed: !e.confirmed })} />
                  </td>
                  <td className="p-2">
                    <input className="border rounded px-2 py-1 w-full" value={e.notes || ''} onChange={(ev)=>updateEntry(e.id, { notes: ev.target.value })} placeholder={t("notesPlaceholder")} />
                  </td>
                  <td className="p-2 text-center">
                    <button onClick={()=>removeEntry(e.id)} className="px-3 py-1 rounded border text-red-700 border-red-200 hover:bg-red-50">{t("remove")}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-3 flex gap-2 flex-wrap">
        <button onClick={exportCsv} className="px-4 py-2 rounded-full text-white" style={{ background: 'var(--color-sage)' }}>{t("exportCsv")}</button>
        <button onClick={copySummary} className="px-4 py-2 rounded-full border">{t("copySummary")}</button>
      </div>
    </div>
  );
}
