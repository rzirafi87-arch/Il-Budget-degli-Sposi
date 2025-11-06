"use client";

import React from "react";

export default function LaureaPage() {
  const [tasks, setTasks] = React.useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem("graduation.checklist");
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });
  const checklist: { id: string; label: string; required?: boolean }[] = [
    { id: "budget-date", label: "Definisci budget e data", required: true },
    { id: "location", label: "Scegli e prenota la location", required: true },
    { id: "catering", label: "Conferma catering e menÃ¹", required: true },
    { id: "inviti", label: "Inviti e raccolta RSVP" },
    { id: "musica", label: "DJ o playlist musicale" },
    { id: "foto", label: "Fotografo o amici foto/video" },
    { id: "torta", label: "Torta di laurea e brindisi" },
    { id: "decorazioni", label: "Decorazioni e allestimento" },
    { id: "gadget", label: "Gadget a tema (tocco, alloro)" },
    { id: "programma", label: "Programma della serata" },
  ];
  React.useEffect(() => {
    try { localStorage.setItem("graduation.checklist", JSON.stringify(tasks)); } catch {}
  }, [tasks]);
  function setGraduationEvent() {
    try {
      localStorage.setItem("eventType", "graduation");
      document.cookie = `eventType=graduation; Path=/; Max-Age=15552000; SameSite=Lax`;
      alert("Evento impostato su Laurea. Alcune sezioni avanzate arriveranno presto!");
    } catch {}
  }

  return (
    <section className="pt-4">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-serif font-bold">Laurea</h1>
        <p className="text-gray-700 mt-2">
          Strumenti e consigli per organizzare la tua festa di laurea: budget, location, catering, inviti e molto altro.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Budget Festa</h2>
          <p className="text-gray-700 mb-3">
            Definisci il budget totale e tieni traccia delle spese: affitto location, catering, torta, fotografo, musica, decorazioni.
          </p>
          <ul className="list-disc list-inside text-gray-800 space-y-1">
            <li>Stima iniziale e imprevisti</li>
            <li>Preventivi e pagamenti</li>
            <li>Condivisione con amici e famiglia</li>
          </ul>
        </div>

        <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Location & Catering</h2>
          <p className="text-gray-700 mb-3">
            Scegli il luogo ideale e un catering adatto al tuo stile: aperitivo informale, buffet, cena seduta.
          </p>
          <ul className="list-disc list-inside text-gray-800 space-y-1">
            <li>Sale eventi, terrazze, giardini</li>
            <li>MenÃ¹ e intolleranze</li>
            <li>Brindisi e torta di laurea</li>
          </ul>
        </div>

        <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Inviti & Ospiti</h2>
          <p className="text-gray-700 mb-3">
            Prepara una lista invitati e invia inviti digitali. Raccogli le conferme di partecipazione (RSVP).
          </p>
          <ul className="list-disc list-inside text-gray-800 space-y-1">
            <li>Inviti via email o WhatsApp</li>
            <li>Gestione RSVP</li>
            <li>Promemoria automatici</li>
          </ul>
        </div>

        <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Foto, Musica & Decorazioni</h2>
          <p className="text-gray-700 mb-3">
            Ricordi e atmosfera perfetta: fotografo, DJ/playlist e allestimenti a tema (tocco, corona dâ€™alloro, colori del corso).
          </p>
          <ul className="list-disc list-inside text-gray-800 space-y-1">
            <li>Servizi foto/video</li>
            <li>DJ o playlist</li>
            <li>Allestimenti e gadget</li>
          </ul>
        </div>
      </div>

      {/* Mini Checklist */}
      <div className="mt-6 p-5 rounded-2xl border-l-4 border-yellow-400 bg-yellow-50 shadow-sm">
        <h2 className="text-xl font-semibold mb-2 text-yellow-800">Mini Checklist</h2>
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
              {c.required ? <span className="text-xs text-yellow-700 ml-1">(obbligatorio)</span> : null}
            </li>
          ))}
        </ul>
        <div className="mt-3 text-sm text-yellow-800">
          Suggerimento: imposta prima budget e data, poi blocca location e catering.
        </div>
      </div>

      {/* Inviti Rapidi (tool locale) */
      }
      <QuickInvites />

      {/* Mini RSVP (locale) */}
      <QuickRSVP />

      {/* Suggerimenti & Consigli */}
      <div className="mt-6 p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Suggerimenti & Consigli</h2>
        <ul className="list-disc list-inside text-gray-800 space-y-1">
          <li>Prediligi location facili da raggiungere per amici e parenti.</li>
          <li>Conferma il catering almeno 2 settimane prima e verifica intolleranze.</li>
          <li>Prepara una scaletta semplice: discorso, brindisi, taglio torta, foto di gruppo.</li>
          <li>Se il budget Ã¨ limitato, opta per buffet + playlist curata.</li>
          <li>Personalizza con dettagli a tema (tocco, alloro, colore del corso).</li>
        </ul>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={setGraduationEvent}
          className="px-5 py-3 rounded-full text-white font-semibold shadow-sm"
          style={{ background: 'var(--color-sage)' }}
        >
          Imposta evento: Laurea
        </button>
        <a
          href="/idea-di-budget"
          className="px-5 py-3 rounded-full text-white font-semibold shadow-sm"
          style={{ background: '#6b7e65' }}
        >
          Apri Idea di Budget
        </a>
        <a
          href="/select-event-type"
          className="px-5 py-3 rounded-full border-2 border-[#A3B59D] text-[#2f4231] hover:bg-[#A3B59D] hover:text-white transition font-semibold"
        >
          Torna alla scelta evento
        </a>
      </div>

      <div className="mt-8 p-5 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900">
        <p className="text-sm">
          Stiamo ampliando le funzionalitÃ  per la Laurea. Alcune pagine avanzate (budget dettagliato, fornitori, timeline) saranno presto disponibili anche qui.
        </p>
      </div>
    </section>
  );
}

function QuickInvites() {
  const [input, setInput] = React.useState<string>("");
  const names = React.useMemo(() => input.split(/\r?\n/).map(s => s.trim()).filter(Boolean), [input]);
  function downloadCsv() {
    const header = 'Nome\\n';
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
          <h2 className="text-xl font-semibold mb-1">Inviti Rapidi</h2>
          <p className="text-sm text-gray-700">Incolla una lista di nomi (uno per riga) per creare velocemente gli inviti.</p>
        </div>
        <div className="text-sm text-gray-700">Totale: <span className="font-semibold">{names.length}</span></div>
      </div>
      <textarea
        className="mt-3 w-full min-h-[120px] border rounded-lg px-3 py-2"
        placeholder={"Es.\nMarco Rossi\nGiulia Bianchi\nLuigi Verdi"}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="mt-3 flex gap-2 flex-wrap">
        <button onClick={downloadCsv} className="px-4 py-2 rounded-full text-white" style={{ background: 'var(--color-sage)' }}>Scarica CSV</button>
        <button onClick={copyList} className="px-4 py-2 rounded-full border">Copia lista</button>
      </div>
    </div>
  );
}

function QuickRSVP() {
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
    const header = 'Nome,Contatto,Invitato,Confermato,Note\n';
    const csv = header + entries.map(e => [e.name, e.contact || '', e.invited ? 'si' : 'no', e.confirmed ? 'si' : 'no', e.notes || ''].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
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
      `Totale invitati: ${invitedCount}`,
      `Confermati: ${confirmedCount}`,
      '',
      ...entries.map(e => `${e.confirmed ? 'âœ…' : 'â³'} ${e.name}${e.contact ? ' ('+e.contact+')' : ''}`)
    ].join('\n');
    try { await navigator.clipboard.writeText(lines); } catch {}
  }

  return (
    <div className="mt-6 p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold mb-1">Mini RSVP</h2>
          <p className="text-sm text-gray-700">Gestisci rapidamente inviti e conferme per la tua festa di laurea.</p>
        </div>
        <div className="text-sm text-gray-700">
          Invitati: <span className="font-semibold">{invitedCount}</span> Â· Confermati: <span className="font-semibold">{confirmedCount}</span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Nome e cognome"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Contatto (email/telefono)"
          value={newContact}
          onChange={(e) => setNewContact(e.target.value)}
        />
        <button onClick={addEntry} className="px-4 py-2 rounded-full text-white font-semibold" style={{ background: 'var(--color-sage)' }}>Aggiungi</button>
      </div>
      {entries.length === 0 ? (
        <div className="mt-4 text-sm text-gray-500">Nessun invitato. Aggiungi un nominativo per iniziare.</div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Nome</th>
                <th className="p-2 text-left">Contatto</th>
                <th className="p-2 text-center">Invitato</th>
                <th className="p-2 text-center">RSVP</th>
                <th className="p-2 text-left">Note</th>
                <th className="p-2">Azioni</th>
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
                    <input className="border rounded px-2 py-1 w-full" value={e.notes || ''} onChange={(ev)=>updateEntry(e.id, { notes: ev.target.value })} placeholder="Note" />
                  </td>
                  <td className="p-2 text-center">
                    <button onClick={()=>removeEntry(e.id)} className="px-3 py-1 rounded border text-red-700 border-red-200 hover:bg-red-50">Rimuovi</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-3 flex gap-2 flex-wrap">
        <button onClick={exportCsv} className="px-4 py-2 rounded-full text-white" style={{ background: 'var(--color-sage)' }}>Esporta CSV</button>
        <button onClick={copySummary} className="px-4 py-2 rounded-full border">Copia riepilogo</button>
      </div>
    </div>
  );
}
