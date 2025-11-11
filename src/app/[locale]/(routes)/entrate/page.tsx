"use client";

import ImageCarousel from "@/components/ImageCarousel";
import PageInfoNote from "@/components/PageInfoNote";
import { getPageImages } from "@/lib/pageImages";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useTranslations } from "next-intl";


// ---------- Tipi ----------
type IncomeType = "busta" | "bonifico" | "regalo";
type IncomeSource = "bride" | "groom" | "common";

type Income = {
  id: string;
  name: string;
  type: IncomeType;
  incomeSource: IncomeSource;
  amount: number;
  date: string; // ISO (YYYY-MM-DD)
  notes?: string | null;
};

type NewIncome = {
  name: string;
  type: IncomeType;
  incomeSource: IncomeSource;
  amount: number;
  date: string; // ISO
  notes: string;
};

// ---------- Helpers ----------
function formatEuro(n: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("it-IT").format(d);
}

// ---------- Componente ----------
  // Stato filtri avanzati
  const [filter, setFilter] = useState({
    dateFrom: "",
    dateTo: "",
    type: "",
    incomeSource: "",
    search: "",
  });

  // Stato per budget pianificato (da /api/budget-items)
  const [plannedBudget, setPlannedBudget] = useState<{ bride: number; groom: number; common: number; total: number }>({ bride: 0, groom: 0, common: 0, total: 0 });
  const [overBudget, setOverBudget] = useState<{ bride: boolean; groom: boolean; common: boolean; total: boolean }>({ bride: false, groom: false, common: false, total: false });

  // Carica budget pianificato
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const jwt = data.session?.access_token;
        const headers: HeadersInit = {};
        if (jwt) headers.Authorization = `Bearer ${jwt}`;
        const country = (typeof window !== "undefined" ? localStorage.getItem("country") : "it") || "it";
        const res = await fetch(`/api/budget-items?country=${encodeURIComponent(country)}`, { headers });
        const json = await res.json();
        let bride = 0, groom = 0, common = 0;
        if (Array.isArray(json?.items)) {
          for (const it of json.items) {
            if (it.spend_type === "bride") bride += Number(it.amount || 0);
            else if (it.spend_type === "groom") groom += Number(it.amount || 0);
            else if (it.spend_type === "common") common += Number(it.amount || 0);
          }
        }
        setPlannedBudget({ bride, groom, common, total: bride + groom + common });
      } catch {
        setPlannedBudget({ bride: 0, groom: 0, common: 0, total: 0 });
      }
    })();
  }, []);

  // Calcola se ci sono superamenti budget
  useEffect(() => {
    setOverBudget({
      bride: totalBride > plannedBudget.bride && plannedBudget.bride > 0,
      groom: totalGroom > plannedBudget.groom && plannedBudget.groom > 0,
      common: totalCommon > plannedBudget.common && plannedBudget.common > 0,
      total: totalMoney > plannedBudget.total && plannedBudget.total > 0,
    });
  }, [totalBride, totalGroom, totalCommon, totalMoney, plannedBudget]);

  // Funzione di filtro
  const filteredIncomes = incomes.filter((income) => {
    // Filtro data da
    if (filter.dateFrom && income.date < filter.dateFrom) return false;
    // Filtro data a
    if (filter.dateTo && income.date > filter.dateTo) return false;
    // Filtro tipo
    if (filter.type && income.type !== filter.type) return false;
    // Filtro sorgente
    if (filter.incomeSource && income.incomeSource !== filter.incomeSource) return false;
    // Filtro testo libero su nome e note
    if (filter.search) {
      const s = filter.search.toLowerCase();
      if (!income.name.toLowerCase().includes(s) && !(income.notes || "").toLowerCase().includes(s)) return false;
    }
    return true;
  });
  const t = useTranslations();

  // TODO: sostituisci con i tuoi hook/contesto reali
  const locale = "it";
  const country = "it";
  const isWedding = true;
  const isSingleBudgetEvent = false;

  const supabase = getBrowserClient();

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);

  const [newIncome, setNewIncome] = useState<NewIncome>({
    name: "",
    type: "busta",
    incomeSource: "common",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // Caricamento entrate
  const loadIncomes = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;
      const headers: HeadersInit = {};
      if (jwt) headers.Authorization = `Bearer ${jwt}`;

      const res = await fetch("/api/my/incomes", { headers });
      const json = await res.json();
      setIncomes(Array.isArray(json.incomes) ? json.incomes : []);
    } catch (e) {
      console.error(e);
      setMessage("Errore nel caricamento delle entrate");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncomes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Aggiungi entrata
  const addIncome = async () => {
    setSaving(true);
    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;
      if (!jwt) {
        setMessage(t("auth.required", { fallback: "Devi effettuare l'accesso." }));
        setSaving(false);
        return;
      }

      const headers: HeadersInit = { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` };
      const res = await fetch("/api/my/incomes", {
        method: "POST",
        headers,
        body: JSON.stringify(newIncome),
      });

      if (!res.ok) throw new Error("create_failed");

      await loadIncomes();
      setShowForm(false);
      setNewIncome({
        name: "",
        type: "busta",
        incomeSource: "common",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setMessage(t("incomesPage.messages.saved", { fallback: "Salvato!" }));
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage(t("incomesPage.messages.networkError", { fallback: "Errore di rete." }));
    } finally {
      setSaving(false);
    }
  };

  // Elimina entrata
  const deleteIncome = async (id: string) => {
    if (!confirm(t("incomesPage.messages.confirmDelete", { fallback: "Confermi l'eliminazione?" }))) return;
    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;
      if (!jwt) return;

      await fetch(`/api/my/incomes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${jwt}` },
      });

      await loadIncomes();
      setMessage(t("incomesPage.messages.deleted", { fallback: "Eliminato." }));
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Esporta CSV
  const handleExportCSV = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;
      const headers: HeadersInit = {};
      if (jwt) headers.Authorization = `Bearer ${jwt}`;
      const res = await fetch("/api/my/incomes/export-csv", { headers });
      if (!res.ok) throw new Error("Errore nell'esportazione CSV");
      const blob = await res.blob();
      (await import("file-saver")).saveAs(blob, "entrate.csv");
    } catch {
      alert("Errore durante l'esportazione CSV");
    }
  };

  // Totali
  const totalBusta = incomes.filter(i => i.type === "busta").reduce((s, i) => s + (i.amount || 0), 0);
  const totalBonifico = incomes.filter(i => i.type === "bonifico").reduce((s, i) => s + (i.amount || 0), 0);
  const totalRegali = incomes.filter(i => i.type === "regalo").length;
  const totalMoney = totalBusta + totalBonifico;

  const totalBride = incomes.filter(i => i.incomeSource === "bride").reduce((s, i) => s + (i.amount || 0), 0);
  const totalGroom = incomes.filter(i => i.incomeSource === "groom").reduce((s, i) => s + (i.amount || 0), 0);
  const totalCommon = incomes.filter(i => i.incomeSource === "common").reduce((s, i) => s + (i.amount || 0), 0);

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
      {/* Banner superamento budget */}
      {(overBudget.bride || overBudget.groom || overBudget.common || overBudget.total) && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-300 text-red-800 shadow-sm">
          <div className="font-semibold mb-1 flex items-center gap-2">
            <span>⚠️</span>
            <span>Attenzione: hai superato il budget pianificato per alcune voci!</span>
          </div>
          <ul className="list-disc pl-6 text-sm">
            {overBudget.bride && <li><span className="font-medium">Sposa</span>{plannedBudget.bride ? <span className="ml-2 text-xs text-gray-500">(Budget: {formatEuro(plannedBudget.bride)})</span> : null}</li>}
            {overBudget.groom && <li><span className="font-medium">Sposo</span>{plannedBudget.groom ? <span className="ml-2 text-xs text-gray-500">(Budget: {formatEuro(plannedBudget.groom)})</span> : null}</li>}
            {overBudget.common && <li><span className="font-medium">Comune</span>{plannedBudget.common ? <span className="ml-2 text-xs text-gray-500">(Budget: {formatEuro(plannedBudget.common)})</span> : null}</li>}
            {overBudget.total && <li><span className="font-medium">Totale</span>{plannedBudget.total ? <span className="ml-2 text-xs text-gray-500">(Budget: {formatEuro(plannedBudget.total)})</span> : null}</li>}
          </ul>
          <div className="mt-2 text-xs">
            <Link href="/budget" className="underline text-red-700 hover:text-red-900">Vai al dettaglio budget</Link>
          </div>
        </div>
      )}
      {/* Barra filtri avanzati */}
      <div className="mb-6 flex flex-wrap gap-4 items-end bg-white/80 border border-gray-200 rounded-xl p-4 shadow-sm">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Data da</label>
          <input
            type="date"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={filter.dateFrom}
            onChange={e => setFilter(f => ({ ...f, dateFrom: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Data a</label>
          <input
            type="date"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={filter.dateTo}
            onChange={e => setFilter(f => ({ ...f, dateTo: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
          <select
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={filter.type}
            onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}
          >
            <option value="">Tutti</option>
            <option value="busta">Busta</option>
            <option value="bonifico">Bonifico</option>
            <option value="regalo">Regalo</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Sorgente</label>
          <select
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={filter.incomeSource}
            onChange={e => setFilter(f => ({ ...f, incomeSource: e.target.value }))}
          >
            <option value="">Tutte</option>
            <option value="common">Comune</option>
            {!isSingleBudgetEvent && <option value="bride">Sposa</option>}
            {!isSingleBudgetEvent && <option value="groom">Sposo</option>}
          </select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-gray-600 mb-1">Ricerca</label>
          <input
            type="text"
            className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
            placeholder="Nome o note..."
            value={filter.search}
            onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
          />
        </div>
        <button
          type="button"
          className="ml-auto bg-gray-200 hover:bg-gray-300 text-gray-700 rounded px-3 py-1 text-xs"
          onClick={() => setFilter({ dateFrom: "", dateTo: "", type: "", incomeSource: "", search: "" })}
        >
          Reset filtri
        </button>
      </div>
      <div className="flex items-start justify-between mb-2">
        <h2 className="font-serif text-3xl">{t("incomesPage.title")}</h2>
        <div className="flex gap-2">
          {isWedding && (
            <Link
              href={`/${locale}/lista-nozze`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50"
            >
              {t("incomesPage.toolbar.giftList")}
            </Link>
          )}
          <Link
            href={`/${locale}/dashboard`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50"
          >
            {t("incomesPage.toolbar.backDashboard")}
          </Link>
        </div>
      </div>

      <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
        {t("incomesPage.info.lead")}
      </p>

      <PageInfoNote
        icon="💵"
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
          <div className="text-xs text-gray-500 mt-1">
            {t("incomesPage.summary.physicalGifts")}: {totalRegali}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-[#A3B59D] text-white rounded-lg px-4 py-2 hover:bg-[#8a9d84]"
        >
          {showForm ? t("incomesPage.buttons.cancel") : t("incomesPage.buttons.add")}
        </button>
        <button
          onClick={handleExportCSV}
          className="ml-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded shadow text-sm"
        >
          Esporta CSV
        </button>
      </div>

      {/* Form nuova entrata */}
      {showForm && (
        <div className="mb-6 p-6 rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
          <h3 className="font-semibold mb-4">{t("incomesPage.form.new")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("incomesPage.form.name")}
              </label>
              <input
                type="text"
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={newIncome.name}
                onChange={(e) => setNewIncome({ ...newIncome, name: e.target.value })}
                placeholder={t("incomesPage.form.placeholders.name")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("incomesPage.form.type")}
              </label>
              <select
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={newIncome.type}
                onChange={(e) => setNewIncome({ ...newIncome, type: e.target.value as IncomeType })}
              >
                <option value="busta">{t("incomesPage.form.typeOptions.busta")}</option>
                <option value="bonifico">{t("incomesPage.form.typeOptions.bonifico")}</option>
                <option value="regalo">{t("incomesPage.form.typeOptions.regalo")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("incomesPage.form.incomeSource")}
              </label>
              <select
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={newIncome.incomeSource}
                onChange={(e) =>
                  setNewIncome({ ...newIncome, incomeSource: e.target.value as IncomeSource })
                }
              >
                <option value="common">{t("incomesPage.form.sourceOptions.common")}</option>
                {!isSingleBudgetEvent && (
                  <option value="bride">{t("incomesPage.form.sourceOptions.bride")}</option>
                )}
                {!isSingleBudgetEvent && (
                  <option value="groom">{t("incomesPage.form.sourceOptions.groom")}</option>
                )}
              </select>
            </div>
            {(newIncome.type === "busta" || newIncome.type === "bonifico") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("incomesPage.form.amount")}
                </label>
                <input
                  type="number"
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                  value={newIncome.amount || 0}
                  onChange={(e) =>
                    setNewIncome({ ...newIncome, amount: Number(e.target.value) || 0 })
                  }
                  placeholder={t("incomesPage.form.placeholders.amount")}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("incomesPage.form.date")}
              </label>
              <input
                type="date"
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={newIncome.date}
                onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {newIncome.type === "regalo"
                  ? t("incomesPage.form.giftDescription")
                  : t("incomesPage.form.notes")}
              </label>
              <textarea
                className="border border-gray-300 rounded px-3 py-2 w-full"
                rows={2}
                value={newIncome.notes}
                onChange={(e) => setNewIncome({ ...newIncome, notes: e.target.value })}
                placeholder={
                  newIncome.type === "regalo"
                    ? t("incomesPage.form.placeholders.gift")
                    : t("incomesPage.form.placeholders.notes")
                }
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
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                {t("incomesPage.table.date")}
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                {t("incomesPage.table.name")}
              </th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">
                {t("incomesPage.table.type")}
              </th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">
                {t("incomesPage.table.source")}
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">
                {t("incomesPage.table.amount")}
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                {t("incomesPage.table.notes")}
              </th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">
                {t("incomesPage.table.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredIncomes.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-gray-400">
                  {t("incomesPage.empty")}
                </td>
              </tr>
            ) : (
              filteredIncomes.map((income) => (
                <tr key={income.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                  <td className="px-4 py-3">{formatDate(new Date(income.date))}</td>
                  <td className="whitespace-nowrap px-4 py-2 font-medium">{income.name}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        income.type === "busta"
                          ? "bg-green-100 text-green-800"
                          : income.type === "bonifico"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {income.type === "busta"
                        ? t("incomesPage.badges.type.busta")
                        : income.type === "bonifico"
                        ? t("incomesPage.badges.type.bonifico")
                        : t("incomesPage.badges.type.regalo")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        income.incomeSource === "bride"
                          ? "bg-pink-100 text-pink-700"
                          : income.incomeSource === "groom"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {income.incomeSource === "bride"
                        ? t("incomesPage.badges.source.bride")
                        : income.incomeSource === "groom"
                        ? t("incomesPage.badges.source.groom")
                        : t("incomesPage.badges.source.common")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {income.type === "regalo" ? "—" : formatEuro(income.amount)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{income.notes || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => deleteIncome(income.id)}
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
