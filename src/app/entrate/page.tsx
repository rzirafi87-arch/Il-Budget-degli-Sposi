"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabaseServer";

const supabase = getBrowserClient();

type Income = {
  id?: string;
  name: string; // Nome persona/famiglia
  type: "busta" | "bonifico" | "regalo";
  incomeSource: "bride" | "groom" | "common"; // CHI riceve/porta l'entrata
  amount: number; // Solo per busta/bonifico
  notes: string; // Descrizione regalo o note
  date: string;
};

export default function EntratePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [newIncome, setNewIncome] = useState<Income>({
    name: "",
    type: "busta",
    incomeSource: "common",
    amount: 0,
    notes: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadIncomes();
  }, []);

  const loadIncomes = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;

      const headers: HeadersInit = {};
      if (jwt) {
        headers.Authorization = `Bearer ${jwt}`;
      }

      const r = await fetch("/api/my/incomes", { headers });
      const j = await r.json();

      setIncomes(j.incomes || []);
    } catch (err) {
      console.error("Errore caricamento:", err);
      setIncomes([]);
    } finally {
      setLoading(false);
    }
  };

  const addIncome = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;

      if (!jwt) {
        setMessage("❌ Devi essere autenticato per aggiungere entrate. Clicca su 'Registrati' in alto.");
        setSaving(false);
        return;
      }

      const r = await fetch("/api/my/incomes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(newIncome),
      });

      if (!r.ok) {
        const j = await r.json();
        setMessage(`❌ Errore: ${j.error || "Impossibile salvare"}`);
      } else {
        setMessage("✅ Entrata registrata con successo!");
        setShowForm(false);
        loadIncomes();
        // Reset form
        setNewIncome({
          name: "",
          type: "busta",
          incomeSource: "common",
          amount: 0,
          notes: "",
          date: new Date().toISOString().split("T")[0],
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error("Errore:", err);
      setMessage("❌ Errore di rete");
    } finally {
      setSaving(false);
    }
  };

  const deleteIncome = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questa entrata?")) return;

    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;

      if (!jwt) return;

      await fetch(`/api/my/incomes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${jwt}` },
      });

      loadIncomes();
      setMessage("✅ Entrata eliminata");
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Errore:", err);
    }
  };

  const totalBusta = incomes.filter(i => i.type === "busta").reduce((sum, i) => sum + i.amount, 0);
  const totalBonifico = incomes.filter(i => i.type === "bonifico").reduce((sum, i) => sum + i.amount, 0);
  const totalRegali = incomes.filter(i => i.type === "regalo").length;
  const totalMoney = totalBusta + totalBonifico;

  // Totali per fonte
  const totalBride = incomes.filter(i => i.incomeSource === "bride").reduce((sum, i) => sum + i.amount, 0);
  const totalGroom = incomes.filter(i => i.incomeSource === "groom").reduce((sum, i) => sum + i.amount, 0);
  const totalCommon = incomes.filter(i => i.incomeSource === "common").reduce((sum, i) => sum + i.amount, 0);

  if (loading) {
    return (
      <section className="pt-6">
        <h2 className="font-serif text-3xl mb-6">Entrate</h2>
        <p className="text-gray-500">Caricamento...</p>
      </section>
    );
  }

  return (
    <section className="pt-6">
      <h2 className="font-serif text-3xl mb-6">Entrate</h2>

      {message && (
        <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm">
          {message}
        </div>
      )}

      {/* Riepilogo */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-pink-50 border border-pink-200">
          <div className="text-sm text-gray-600">Entrate Sposa</div>
          <div className="text-2xl font-semibold">€ {formatEuro(totalBride)}</div>
        </div>
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
          <div className="text-sm text-gray-600">Entrate Sposo</div>
          <div className="text-2xl font-semibold">€ {formatEuro(totalGroom)}</div>
        </div>
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
          <div className="text-sm text-gray-600">Entrate Comuni</div>
          <div className="text-2xl font-semibold">€ {formatEuro(totalCommon)}</div>
        </div>
        <div className="p-4 rounded-lg bg-[#A3B59D]/20 border border-[#A3B59D]">
          <div className="text-sm text-gray-600">Totale denaro</div>
          <div className="text-2xl font-semibold">€ {formatEuro(totalMoney)}</div>
          <div className="text-xs text-gray-500 mt-1">Regali fisici: {totalRegali}</div>
        </div>
      </div>

      {/* Bottone aggiungi */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#A3B59D] text-white rounded-lg px-4 py-2 hover:bg-[#8a9d84]"
        >
          {showForm ? "Annulla" : "+ Aggiungi entrata"}
        </button>
      </div>

      {/* Form nuova entrata */}
      {showForm && (
        <div className="mb-6 p-6 rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
          <h3 className="font-semibold mb-4">Nuova entrata</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome persona/famiglia *</label>
              <input
                type="text"
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={newIncome.name}
                onChange={(e) => setNewIncome({ ...newIncome, name: e.target.value })}
                placeholder="Es. Famiglia Rossi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipologia *</label>
              <select
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={newIncome.type}
                onChange={(e) => setNewIncome({ ...newIncome, type: e.target.value as any })}
              >
                <option value="busta">Busta</option>
                <option value="bonifico">Bonifico</option>
                <option value="regalo">Regalo fisico</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fonte entrata *</label>
              <select
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={newIncome.incomeSource}
                onChange={(e) => setNewIncome({ ...newIncome, incomeSource: e.target.value as any })}
              >
                <option value="common">Comune</option>
                <option value="bride">Sposa</option>
                <option value="groom">Sposo</option>
              </select>
            </div>
            {(newIncome.type === "busta" || newIncome.type === "bonifico") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Importo (€) *</label>
                <input
                  type="number"
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                  value={newIncome.amount || ""}
                  onChange={(e) => setNewIncome({ ...newIncome, amount: Number(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                type="date"
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={newIncome.date}
                onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {newIncome.type === "regalo" ? "Descrizione regalo *" : "Note"}
              </label>
              <textarea
                className="border border-gray-300 rounded px-3 py-2 w-full"
                rows={2}
                value={newIncome.notes}
                onChange={(e) => setNewIncome({ ...newIncome, notes: e.target.value })}
                placeholder={newIncome.type === "regalo" ? "Es. Servizio piatti completo" : "Note aggiuntive..."}
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={addIncome}
              disabled={saving}
              className="bg-[#A3B59D] text-white rounded-lg px-6 py-2 hover:bg-[#8a9d84] disabled:opacity-50"
            >
              {saving ? "Salvataggio..." : "Salva entrata"}
            </button>
          </div>
        </div>
      )}

      {/* Tabella entrate */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="px-4 py-3 text-left font-medium text-gray-700">Data</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Nome</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">Tipologia</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">Fonte</th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">Importo (€)</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Note / Descrizione</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {incomes.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-gray-400">
                  Nessuna entrata registrata
                </td>
              </tr>
            ) : (
              incomes.map((income) => (
                <tr key={income.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                  <td className="px-4 py-3">{new Date(income.date).toLocaleDateString("it-IT")}</td>
                  <td className="px-4 py-3 font-medium">{income.name}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      income.type === "busta" ? "bg-green-100 text-green-800" :
                      income.type === "bonifico" ? "bg-blue-100 text-blue-800" :
                      "bg-purple-100 text-purple-800"
                    }`}>
                      {income.type === "busta" ? "💵 Busta" : 
                       income.type === "bonifico" ? "🏦 Bonifico" : 
                       "🎁 Regalo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      income.incomeSource === "bride" ? "bg-pink-100 text-pink-700" :
                      income.incomeSource === "groom" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {income.incomeSource === "bride" ? "👰 Sposa" :
                       income.incomeSource === "groom" ? "🤵 Sposo" :
                       "💑 Comune"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {income.type === "regalo" ? "—" : `€ ${formatEuro(income.amount)}`}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{income.notes || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => deleteIncome(income.id!)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Elimina
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatEuro(n: number) {
  return (n || 0).toLocaleString("it-IT", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
