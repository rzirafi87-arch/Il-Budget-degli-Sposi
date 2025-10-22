import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

/**
 * Ritorna:
 *  - rows: righe tabella (categoria, sottocategoria, tipo, budget, impegnato, pagato, residuo)
 *  - totals: { total, common, bride, groom }
 *
 * Se l'utente non ha spese o categorie, restituisce array vuoto e totali a zero (come nello screenshot).
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];

    if (!jwt) {
      // Restituisci dati di esempio per utenti non autenticati
      return NextResponse.json({
        rows: [
          {
            category: "Cerimonia",
            subcategory: "Location cerimonia",
            spend_type: "common",
            budget: 3000,
            committed: 1500,
            paid: 1500,
            residual: 1500,
            fromDashboard: true,
            difference: -1500,
          },
          {
            category: "Cerimonia",
            subcategory: "Fiori e decorazioni",
            spend_type: "bride",
            budget: 1500,
            committed: 800,
            paid: 0,
            residual: 1500,
            fromDashboard: false,
            difference: -1500,
          },
          {
            category: "Ricevimento",
            subcategory: "Catering",
            spend_type: "common",
            budget: 8000,
            committed: 4000,
            paid: 2000,
            residual: 6000,
            fromDashboard: true,
            difference: -6000,
          },
          {
            category: "Ricevimento",
            subcategory: "Torta nuziale",
            spend_type: "bride",
            budget: 500,
            committed: 500,
            paid: 500,
            residual: 0,
            fromDashboard: true,
            difference: 0,
          },
          {
            category: "Abbigliamento",
            subcategory: "Abito sposa",
            spend_type: "bride",
            budget: 2500,
            committed: 2500,
            paid: 1000,
            residual: 1500,
            fromDashboard: true,
            difference: -1500,
          },
          {
            category: "Abbigliamento",
            subcategory: "Abito sposo",
            spend_type: "groom",
            budget: 800,
            committed: 800,
            paid: 800,
            residual: 0,
            fromDashboard: true,
            difference: 0,
          },
          {
            category: "Fotografia",
            subcategory: "Fotografo",
            spend_type: "common",
            budget: 2000,
            committed: 1000,
            paid: 500,
            residual: 1500,
            fromDashboard: true,
            difference: -1500,
          },
          {
            category: "Intrattenimento",
            subcategory: "Musica dal vivo",
            spend_type: "common",
            budget: 1200,
            committed: 0,
            paid: 0,
            residual: 1200,
            fromDashboard: false,
            difference: -1200,
          },
        ],
        totals: {
          total: 19500,
          common: 14200,
          bride: 4500,
          groom: 800,
        },
        eventId: "demo",
      });
    }

    const db = getServiceClient();

    // verifica token
    const { data: userData, error: authError } = await db.auth.getUser(jwt);
    if (authError || !userData?.user) {
      return NextResponse.json({
        rows: [],
        totals: { total: 0, common: 0, bride: 0, groom: 0 },
        eventId: null,
      });
    }

    const userId = userData.user.id;

    // 1) prendi il PRIMO evento dell'utente (evento attivo di default)
    const { data: ev, error: e1 } = await db
      .from("events")
      .select("id")
      .eq("owner_id", userId)
      .order("inserted_at", { ascending: true })
      .limit(1)
      .single();

    if (e1 || !ev?.id) {
      return NextResponse.json({
        rows: [],
        totals: { total: 0, common: 0, bride: 0, groom: 0 },
        eventId: null,
      });
    }

    const eventId = ev.id as string;

    // 2) join categorie/sottocategorie + somme spese (se non ci sono, viene tutto null → gestiamo a 0)
    const { data: subs, error: e2 } = await db
      .from("subcategories")
      .select(`
        id,
        name,
        category:categories!inner(id, name, event_id),
        expenses(status, committed_amount, paid_amount, spend_type)
      `)
      .eq("category.event_id", eventId)
      .order("name");

    if (e2) {
      console.error("BUDGET-TABLE – Query error:", e2);
      return NextResponse.json({
        rows: [],
        totals: { total: 0, common: 0, bride: 0, groom: 0 },
        eventId,
        error: e2.message,
      }, { status: 200 });
    }

    // 3) costruisci righe e totali
    type Row = {
      category: string;
      subcategory: string;
      spend_type: "common" | "bride" | "groom";
      budget: number;
      committed: number;
      paid: number;
      residual: number;
      fromDashboard: boolean;
      difference: number; // differenza tra budget pianificato e speso reale
    };

    const rows: Row[] = [];
    let totalCommon = 0, totalBride = 0, totalGroom = 0;

    (subs || []).forEach((s: any) => {
      const catName = s.category?.name || "";
      const subName = s.name;
      const expenses = s.expenses || [];

      // somma i campi per sottocategoria (se non esistono spese, 0)
      let budget = 0, committed = 0, paid = 0, residual = 0;
      let spendType = "common" as "common" | "bride" | "groom";

      expenses.forEach((e: any) => {
        // "budget": usiamo committed_amount per i planned/committed (è la colonna già in schema)
        const expenseSpendType = (e.spend_type as "common" | "bride" | "groom") || "common";
        budget += Number(e.committed_amount || 0);
        committed += Number(e.status === "committed" ? e.committed_amount || 0 : 0);
        paid     += Number(e.paid_amount || 0);
        // prendi l'ultimo tipo (o il primo non-common se c'è)
        if (expenseSpendType !== "common") spendType = expenseSpendType;
      });
      residual = Math.max(0, budget - paid);

      // Verifica se almeno una spesa era from_dashboard
      const hasFromDashboard = expenses.some((e: any) => e.from_dashboard);
      const difference = paid - budget; // negativo = sotto budget, positivo = sopra budget

      rows.push({
        category: catName,
        subcategory: subName,
        spend_type: spendType,
        budget,
        committed,
        paid,
        residual,
        fromDashboard: hasFromDashboard,
        difference,
      });

      if (spendType === "bride") totalBride += budget;
      else if (spendType === "groom") totalGroom += budget;
      else totalCommon += budget;
    });

    const totals = {
      total: totalCommon + totalBride + totalGroom,
      common: totalCommon,
      bride: totalBride,
      groom: totalGroom,
    };

    return NextResponse.json({ rows, totals, eventId }, { status: 200 });
  } catch (e: any) {
    console.error("BUDGET-TABLE – Uncaught:", e);
    return NextResponse.json({
      rows: [],
      totals: { total: 0, common: 0, bride: 0, groom: 0 },
      eventId: null,
      error: e?.message || "Unexpected",
    }, { status: 500 });
  }
}
