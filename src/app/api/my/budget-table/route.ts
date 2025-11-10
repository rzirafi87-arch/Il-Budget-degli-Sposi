import { getBearer, requireUser } from "@/lib/apiAuth";
import { calculateDifference, splitBudgetByType } from "@/lib/budgetCalc";
import { calculateResidual } from "@/lib/budgetUtils";
import { logger } from "@/lib/logger";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

/**
 * Ritorna:
 *  - rows: righe tabella (categoria, sottocategoria, tipo, budget, impegnato, pagato, residuo)
 *  - totals: { total, common, bride, groom }
 *
 * Se l'utente non ha spese o categorie, restituisce array vuoto e totali a zero (come nello screenshot).
 */
export async function GET(req: NextRequest) {
  try {
    const jwt = getBearer(req);

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
    const { userId } = await requireUser(req);

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
      logger.error("BUDGET-TABLE Query error", { error: e2 });
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
    (subs || []).forEach((s) => {
  const catName = (s.category && typeof s.category === 'object' && 'name' in s.category) ? String(s.category.name) : "";
      const subName = s.name;
      const expenses: Array<{committed_amount?: number; paid_amount?: number; spend_type?: string; status?: string; from_dashboard?: boolean}> = s.expenses || [];
      let budget = 0, committed = 0, paid = 0;
      let spendType: "common" | "bride" | "groom" = "common";
      expenses.forEach((e) => {
        const expenseSpendType = (e.spend_type as "common" | "bride" | "groom") || "common";
        budget += Number(e.committed_amount || 0);
        committed += Number(e.status === "committed" ? e.committed_amount || 0 : 0);
        paid     += Number(e.paid_amount || 0);
        if (expenseSpendType !== "common") spendType = expenseSpendType;
      });
      const residual = calculateResidual(budget, paid);
      const hasFromDashboard = expenses.some((e) => e.from_dashboard);
      const difference = calculateDifference(budget, paid);
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
    });

    // Calcolo split budget usando la utility
    const split = splitBudgetByType(rows.map(r => ({ budget: r.budget, spendType: r.spend_type })));
    const totals = split;



    return NextResponse.json({ rows, totals, eventId }, { status: 200 });
  } catch (e: unknown) {
    const err = e instanceof Error ? e : new Error(String(e));
    logger.error("BUDGET-TABLE Uncaught", { message: err.message });
    return NextResponse.json({
      rows: [],
      totals: { total: 0, common: 0, bride: 0, groom: 0 },
      eventId: null,
      error: err.message || "Unexpected",
    }, { status: 500 });
  }
}
