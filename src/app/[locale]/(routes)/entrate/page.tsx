"use client";

import ImageCarousel from "@/components/ImageCarousel";
import PageInfoNote from "@/components/PageInfoNote";
import { getUserCountrySafe } from "@/constants/geo";
import { formatCurrency, formatDate } from "@/lib/locale";
import { getPageImages } from "@/lib/pageImages";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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
  const t = useTranslations();
  const locale = useLocale() || "it";
  const country = getUserCountrySafe();
  const userEventType = typeof window !== "undefined" ? (localStorage.getItem("eventType") || "wedding") : "wedding";
  const isBaptism = userEventType === "baptism";
  const isCommunion = userEventType === "communion";
  const isConfirmation = userEventType === "confirmation";
  const isBirthday = userEventType === "birthday";
  const isEighteenth = userEventType === "eighteenth";
  const isGraduation = userEventType === "graduation";
  const isFifty = userEventType === "fifty";
  const isRetirement = userEventType === "retirement";
  const isBabyShower = userEventType === "babyshower";
  const isProposal = userEventType === "proposal";
  const isCorporate = userEventType === "corporate";
  const isBarMitzvah = userEventType === "bar-mitzvah";
  const isQuinceanera = userEventType === "quinceanera";
  const isCharityGala = userEventType === "charity-gala";
  const isSingleBudgetEvent = isBaptism || isCommunion || isConfirmation || isBirthday || isEighteenth || isGraduation || isFifty || isRetirement || isBabyShower || isProposal || isCorporate || isBarMitzvah || isQuinceanera || isCharityGala;
  const isWedding = userEventType === "wedding";
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

    // For single-budget events (baptism, communion), force incomeSource to common
  useEffect(() => {
    if (isSingleBudgetEvent && newIncome.incomeSource !== "common") {
      setNewIncome((prev) => ({ ...prev, incomeSource: "common" }));
    }
  }, [isSingleBudgetEvent, newIncome.incomeSource]);

  const loadIncomes = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;

      const headers: HeadersInit = {};
      if (jwt) {
        headers.Authorization = `Bearer ${jwt}`;
      }

      const r = await fetch("/api/my/incomes", { headers });
      const j = await r.json();

      type IncomeRow = {
        id: string;
        name: string;
        type: "busta" | "bonifico" | "regalo";
        amount: number;
        notes: string;
        date: string;
        incomeSource: "bride" | "groom" | "common";
      };
      const raw: IncomeRow[] = j.incomes || [];
      // For Battesimo, Comunione, and Cresima: force incomeSource to 'common' on UI side
      const mapped: Income[] = isSingleBudgetEvent
        ? raw.map((i) => ({
            id: i.id,
            name: i.name,
            type: i.type,
            amount: i.amount,
            notes: i.notes,
            date: i.date,
            incomeSource: "common" as const
          }))
        : raw.map(i => ({
            id: i.id,
            name: i.name,
            type: i.type,
            amount: i.amount,
            notes: i.notes,
            date: i.date,
            incomeSource: i.incomeSource
          }));
      setIncomes(mapped);
    } catch (err) {
      console.error("Errore caricamento:", err);
      setIncomes([]);
    } finally {
      setLoading(false);
    }
  }, [isSingleBudgetEvent]);

  useEffect(() => {
    loadIncomes();
  }, [loadIncomes]);

  const addIncome = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;

      if (!jwt) {
        setMessage(t("incomesPage.messages.mustAuthAdd"));
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
        setMessage(`${t("incomesPage.messages.networkError")}: ${j.error || "Impossibile salvare"}`);
      } else {
        setMessage(t("incomesPage.messages.successAdded"));
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
      setMessage(t("incomesPage.messages.networkError"));
    } finally {
      setSaving(false);
    }
  };

  const deleteIncome = async (id: string) => {
  if (!confirm(t("incomesPage.messages.confirmDelete"))) return;

    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;

      if (!jwt) return;

      await fetch(`/api/my/incomes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${jwt}` },
      });

      loadIncomes();
      setMessage(t("incomesPage.messages.deleted"));
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
        <h2 className="font-serif text-3xl mb-6">{t("incomesPage.title")}</h2>
        <p className="text-gray-500">{t("incomesPage.loading")}</p>
      </section>
    );
  }

  return (
    <section className="pt-6">
      <div className="flex items-start justify-between mb-2">
        <h2 className="font-serif text-3xl">{t("incomesPage.title")}</h2>
        <div className="flex gap-2">
          {isWedding && (
            <Link href={`/${locale}/lista-nozze`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50">{t("incomesPage.toolbar.giftList")}</Link>
          )}
          <Link href={`/${locale}/dashboard`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50">{t("incomesPage.toolbar.backDashboard")}</Link>
        </div>
      </div>
      {/* titolo rimosso: giÃ  presente nella toolbar sopra */}
      <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">{t("incomesPage.info.lead")}</p>

      <PageInfoNote
        icon="ðŸ’µ"
        title={t("incomesPage.info.title")}
        description={t("incomesPage.info.description")}
        tips={[
          t("incomesPage.info.tips.tip1"),
          t("incomesPage.info.tips.tip2"),
          t("incomesPage.info.tips.tip3"),
          t("incomesPage.info.tips.tip4"),
        ]}
        eventTypeSpecific={{
          wedding: t("incomesPage.info.eventTypeSpecific.wedding"),
          baptism: t("incomesPage.info.eventTypeSpecific.baptism"),
          birthday: t("incomesPage.info.eventTypeSpecific.birthday"),
          graduation: t("incomesPage.info.eventTypeSpecific.graduation"),
        }}
      />

      {/* Carosello immagini */}
      <ImageCarousel images={getPageImages("entrate", country)} height="280px" />

      {message && (
        <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm">
          {message}
        </div>
      )}

      {/* Riepilogo */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-pink-50 border border-pink-200">
          <div className="text-sm text-gray-600">{t("incomesPage.summary.bride")}</div>
          <div className="text-2xl font-semibold">{formatEuro(totalBride)}</div>
        </div>
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
          <div className="text-sm text-gray-600">{t("incomesPage.summary.groom")}</div>
          <div className="text-2xl font-semibold">{formatEuro(totalGroom)}</div>
        </div>
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
          <div className="text-sm text-gray-600">{t("incomesPage.summary.common")}</div>
          <div className="text-2xl font-semibold">{formatEuro(totalCommon)}</div>
        </div>
        <div className="p-4 rounded-lg bg-[#A3B59D]/20 border border-[#A3B59D]">
          <div className="text-sm text-gray-600">{t("incomesPage.summary.totalMoney")}</div>
          <div className="text-2xl font-semibold">{formatEuro(totalMoney)}</div>
          <div className="text-xs text-gray-500 mt-1">{t("incomesPage.summary.physicalGifts")}: {totalRegali}</div>
        </div>
      </div>

      {/* Bottone aggiungi */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#A3B59D] text-white rounded-lg px-4 py-2 hover:bg-[#8a9d84]"
        >
          {showForm ? t("incomesPage.buttons.cancel") : t("incomesPage.buttons.add")}
        </button>
      </div>

      {/* Form nuova entrata */}
      {showForm && (
        <div className="mb-6 p-6 rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
          <h3 className="font-semibold mb-4">{t("incomesPage.form.new")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("incomesPage.form.name")}</label>
              <input
                type="text"
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={newIncome.name}
                onChange={(e) => setNewIncome({ ...newIncome, name: e.target.value })}
                placeholder={t("incomesPage.form.placeholders.name")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("incomesPage.form.type")}</label>
              <select
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={newIncome.type}
                onChange={(e) => setNewIncome({ ...newIncome, type: e.target.value as Income["type"] })}
              >
                <option value="busta">{t("incomesPage.form.typeOptions.busta")}</option>
                <option value="bonifico">{t("incomesPage.form.typeOptions.bonifico")}</option>
                <option value="regalo">{t("incomesPage.form.typeOptions.regalo")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("incomesPage.form.incomeSource")}</label>
              <select
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={newIncome.incomeSource}
                onChange={(e) => setNewIncome({ ...newIncome, incomeSource: e.target.value as "common" | "bride" | "groom" })}
              >
                <option value="common">{t("incomesPage.form.sourceOptions.common")}</option>
                {!isSingleBudgetEvent && <option value="bride">{t("incomesPage.form.sourceOptions.bride")}</option>}
                {!isSingleBudgetEvent && <option value="groom">{t("incomesPage.form.sourceOptions.groom")}</option>}
              </select>
            </div>
            {(newIncome.type === "busta" || newIncome.type === "bonifico") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("incomesPage.form.amount")}</label>
                <input
                  type="number"
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                  value={newIncome.amount || ""}
                  onChange={(e) => setNewIncome({ ...newIncome, amount: Number(e.target.value) || 0 })}
                  placeholder={t("incomesPage.form.placeholders.amount")}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("incomesPage.form.date")}</label>
              <input
                type="date"
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={newIncome.date}
                onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {newIncome.type === "regalo" ? t("incomesPage.form.giftDescription") : t("incomesPage.form.notes")}
              </label>
              <textarea
                className="border border-gray-300 rounded px-3 py-2 w-full"
                rows={2}
                value={newIncome.notes}
                onChange={(e) => setNewIncome({ ...newIncome, notes: e.target.value })}
                placeholder={newIncome.type === "regalo" ? t("incomesPage.form.placeholders.gift") : t("incomesPage.form.placeholders.notes")}
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={addIncome}
              disabled={saving}
              className="bg-[#A3B59D] text-white rounded-lg px-6 py-2 hover:bg-[#8a9d84] disabled:opacity-50"
            >
              {saving ? t("loading", { fallback: "Salvataggio..." }) : t("incomesPage.buttons.save")}
            </button>
          </div>
        </div>
      )}

      {/* Tabella entrate */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
        <table className="w-full min-w-[920px] text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="px-4 py-3 text-left font-medium text-gray-700">{t("incomesPage.table.date")}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">{t("incomesPage.table.name")}</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">{t("incomesPage.table.type")}</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">{t("incomesPage.table.source")}</th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">{t("incomesPage.table.amount")}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">{t("incomesPage.table.notes")}</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">{t("incomesPage.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {incomes.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-gray-400">
                  {t("incomesPage.empty")}
                </td>
              </tr>
            ) : (
              incomes.map((income) => (
                <tr key={income.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                  <td className="px-4 py-3">{formatDate(new Date(income.date))}</td>
                  <td className="px-4 py-3 font-medium">{income.name}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      income.type === "busta" ? "bg-green-100 text-green-800" :
                      income.type === "bonifico" ? "bg-blue-100 text-blue-800" :
                      "bg-purple-100 text-purple-800"
                    }`}>
                      {income.type === "busta" ? t("incomesPage.badges.type.busta") :
                       income.type === "bonifico" ? t("incomesPage.badges.type.bonifico") :
                       t("incomesPage.badges.type.regalo")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      income.incomeSource === "bride" ? "bg-pink-100 text-pink-700" :
                      income.incomeSource === "groom" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {income.incomeSource === "bride" ? t("incomesPage.badges.source.bride") :
                       income.incomeSource === "groom" ? t("incomesPage.badges.source.groom") :
                       t("incomesPage.badges.source.common")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {income.type === "regalo" ? "â€”" : formatEuro(income.amount)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{income.notes || "â€”"}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => deleteIncome(income.id!)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      {t("incomesPage.buttons.delete")}
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
  return formatCurrency(n, "EUR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
