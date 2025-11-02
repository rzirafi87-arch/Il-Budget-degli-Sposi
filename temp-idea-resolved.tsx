"use client";


// Struttura dati per idea di budget
export type BudgetIdeaRow = {
  id?: string;
  category: string;
  subcategory: string;
  spendType: string;
  amount: number;
  supplier?: string;
  notes?: string;
};


  const [contingencyPct, setContingencyPct] = useState<number>(() => {
    const v = typeof window !== "undefined" ? Number(localStorage.getItem("budgetIdea.contingencyPct") || 0) : 0;
    return Number.isFinite(v) ? v : 0;
  });
  const [compactView, setCompactView] = useState<boolean>(() =>
    typeof window !== "undefined" ? localStorage.getItem("budgetIdea.compactView") === "1" : false
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("budgetIdea.currency", currency);
      localStorage.setItem("budgetIdea.contingencyPct", String(contingencyPct));
      localStorage.setItem("budgetIdea.compactView", compactView ? "1" : "0");
    }
  }, [currency, contingencyPct, compactView]);

  // Persist budget per contributor (e compatibilit+� dashboard esistente)
  useEffect(() => {
    if (typeof window === "undefined") return;
    eventConfig.contributors.forEach(({ value }) => {
      const amount = contributorBudgets[value] || 0;
      localStorage.setItem(`budgetIdea.budget.${eventType}.${value}`, String(amount));
    });
    const first = eventConfig.contributors[0]?.value;
    const second = eventConfig.contributors[1]?.value;
    if (first) localStorage.setItem("brideBudget", String(contributorBudgets[first] || 0));
    if (second) {
      localStorage.setItem("groomBudget", String(contributorBudgets[second] || 0));
    } else {
      localStorage.setItem("groomBudget", "0");
    }
  }, [contributorBudgets, eventConfig.contributors, eventType]);

  // Persist data evento (compatibile con dashboard)
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(`budgetIdea.eventDate.${eventType}`, eventDate || "");
    localStorage.setItem("weddingDate", eventDate || "");
  }, [eventDate, eventType]);

  const spendTypeOptions: SpendTypeOption[] = useMemo(() => {
    const base = eventConfig.spendTypes;
    const extras = Array.from(
      new Set(
        rows
          .map((row) => row.spendType)
          .filter((value) => value && !base.some((opt) => opt.value === value))
      )
    ).map((value) => ({ value, label: value }));
    return [...base, ...extras];
  }, [eventConfig.spendTypes, rows]);


    setRows((prev) => prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  }

  function handleBudgetChange(key: string, value: number) {
    setContributorBudgets((prev) => ({ ...prev, [key]: value }));
  }

  const plannedBySpendType = useMemo(() => {
    return rows.reduce<Record<string, number>>((acc, row) => {
      const amount = Number(row.amount) || 0;
      acc[row.spendType] = (acc[row.spendType] || 0) + amount;
      return acc;
    }, {});
  }, [rows]);

  const plannedTotal = useMemo(
    () => rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0),
    [rows]
  );

  const totalBudget = useMemo(
    () => eventConfig.contributors.reduce((sum, c) => sum + (contributorBudgets[c.value] || 0), 0),
    [contributorBudgets, eventConfig.contributors]
  );

  const extraSpendItems = useMemo(() => {
    const contributorSet = new Set(eventConfig.contributors.map((c) => c.value));
    return Object.entries(plannedBySpendType)
      .filter(([value]) => !contributorSet.has(value))
      .map(([value, amount]) => ({ value, amount }));
  }, [eventConfig.contributors, plannedBySpendType]);

  // Salva su Supabase (tabella budget_ideas)
  async function handleSave() {
    setSaving(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const jwt = sessionData.session?.access_token;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (jwt) headers["Authorization"] = `Bearer ${jwt}`;

    const ideaPayload = rows.map((row) => ({
      category: row.category,
      subcategory: row.subcategory,
      spendType: row.spendType,
      idea_amount: row.amount,
      supplier: row.supplier,
      notes: row.notes,
    }));

    const res = await fetch("/api/idea-di-budget", {
      method: "POST",
      headers,
      body: JSON.stringify(ideaPayload),
    });
    if (!res.ok) {
      setSaving(false);
      alert("Errore nel salvataggio!");
      return;
    }

    const firstContributor = eventConfig.contributors[0]?.value;
    const secondContributor = eventConfig.contributors[1]?.value;
    const firstBudget = firstContributor ? contributorBudgets[firstContributor] || 0 : 0;
    const secondBudget = secondContributor ? contributorBudgets[secondContributor] || 0 : 0;

    await fetch("/api/my/dashboard", {
      method: "POST",
      headers,
      body: JSON.stringify({
        totalBudget,
        brideBudget: firstBudget,
        groomBudget: secondBudget,
        weddingDate: eventDate,
        rows: [],
      }),
    }).catch(() => {});

    setSaving(false);
    alert("Idea di budget salvata!");
  }

  // Applica le idee al budget (crea/aggiorna voci in budget_items)
  async function handleApplyToBudget() {
    setSaving(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const jwt = sessionData.session?.access_token;
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
    const country = (typeof window !== "undefined" ? localStorage.getItem("country") : "it") || "it";
    const res = await fetch(`/api/idea-di-budget/apply?country=${encodeURIComponent(country)}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ country, rows }),
    });
    setSaving(false);
    if (res.ok) {
      const json = await res.json();
      alert(`Applicazione completata: ${json.inserted ?? 0} voci aggiornate.`);
    } else {
      alert("Errore nell'applicazione al Budget");
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-start justify-between mb-4">
        <h1 className="text-3xl font-serif font-bold">Idea di Budget</h1>
        <div className="flex gap-2">

          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Caricamento idee di budget...</div>
      ) : (
        <>
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>

              </div>
            </div>
            <div className="mt-4 text-sm text-gray-900">
              {(() => {
                const base = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
                const extra = (base * (contingencyPct || 0)) / 100;
                const total = base + extra;
                return (
                  <div className="flex flex-wrap gap-4">

                  </div>
                );
              })()}
            </div>
          </div>

          <table className={`w-full border ${compactView ? "text-xs" : "text-sm"} mb-6`}>
            <thead>
              <tr className="bg-gray-100">

              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="border-b">
                  <td className="p-2">{row.category}</td>
                  <td className="p-2">{row.subcategory}</td>
                  <td className="p-2">
                    <input
                      type="text"
                      className={`border rounded px-2 py-1 ${compactView ? "w-28" : "w-32"}`}
                      value={row.supplier || ""}
                      onChange={(e) => handleChange(idx, "supplier", e.target.value)}
                      placeholder="Fornitore"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className={`border rounded px-2 py-1 ${compactView ? "w-20" : "w-24"}`}
                      value={row.amount}
                      min={0}
                      onChange={(e) => handleChange(idx, "amount", Number(e.target.value))}
                    />
                  </td>
                  <td className="p-2">
                    <select
                      className={`border rounded px-2 py-1 ${compactView ? "w-28" : "w-32"}`}
                      value={row.spendType}
                      onChange={(e) => handleChange(idx, "spendType", e.target.value)}
                    >

                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      className={`border rounded px-2 py-1 ${compactView ? "w-28" : "w-32"}`}
                      value={row.notes || ""}
                      onChange={(e) => handleChange(idx, "notes", e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-wrap gap-3">
            <button
              className="px-6 py-2 bg-[#A3B59D] text-white rounded font-bold"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Salvataggio..." : "Salva idea di budget"}
            </button>
            <button
              className="px-6 py-2 bg-[#6b7e65] text-white rounded font-bold"
              onClick={handleApplyToBudget}
              disabled={saving || rows.length === 0}
              title="Crea/Aggiorna le voci di Budget dalla tua Idea"
            >
              {saving ? "Attendere..." : "Applica a Budget"}
            </button>
            {eventType === "baptism" && (
              <button
                className="px-6 py-2 bg-[#3b82f6] text-white rounded font-bold"
                onClick={async () => {
                  setSaving(true);
                  try {
                    const { data: sessionData } = await supabase.auth.getSession();
                    const jwt = sessionData.session?.access_token;
                    const headers: HeadersInit = { "Content-Type": "application/json" };
                    if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
                    const country = typeof window !== 'undefined' ? (localStorage.getItem('country') || 'it') : 'it';
                    await fetch(`/api/baptism/seed?country=${encodeURIComponent(country)}`, { method: "POST", headers });
                    // Ricarica categorie e righe dopo il seed
                    setCategoriesMap(resolveCategories());
                    await fetchBudgetIdeas();
                  } finally {
                    setSaving(false);
                  }
                }}
                title="Crea categorie e sottocategorie Battesimo per l'evento corrente"
              >
                Applica Template Battesimo
              </button>
            )}
            {eventType === "baptism" && (
              <button
                className="px-6 py-2 bg-[#2563eb] text-white rounded font-bold"
                onClick={suggestBaptismAmounts}
                title="Suggerisci importi per categoria in base alle percentuali Battesimo"
              >
                Suggerisci importi (Battesimo)
              </button>
            )}
            {eventType === "graduation" && (
              <button
                className="px-6 py-2 bg-[#2563eb] text-white rounded font-bold"
                onClick={suggestGraduationAmounts}
                title="Suggerisci importi per categoria in base alle percentuali Laurea"
              >
                Suggerisci importi (Laurea)
              </button>
            )}
            {eventType === "confirmation" && (
              <button
                className="px-6 py-2 bg-[#2563eb] text-white rounded font-bold"
                onClick={suggestConfirmationAmounts}
                title="Suggerisci importi per categoria in base alle percentuali Cresima"
              >
                Suggerisci importi (Cresima)
              </button>
            )}
            {eventType === "communion" && (
              <button
                className="px-6 py-2 bg-[#2563eb] text-white rounded font-bold"
                onClick={suggestCommunionAmounts}
                title="Suggerisci importi per categoria in base alle percentuali Comunione"
              >
                Suggerisci importi (Comunione)
              </button>
            )}
            {eventType === "eighteenth" && (
              <button
                className="px-6 py-2 bg-[#2563eb] text-white rounded font-bold"
                onClick={suggestEighteenthAmounts}
                title="Suggerisci importi per categoria in base alle percentuali Diciottesimo"
              >
                Suggerisci importi (Diciottesimo)
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

