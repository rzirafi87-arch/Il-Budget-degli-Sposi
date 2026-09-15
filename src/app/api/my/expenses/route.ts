import { getBearer } from "@/lib/apiAuth";
import {
  FinancialContractError,
  parseExpenseCreate,
  parseExpenseSupplierLink,
  type ExpenseInsert,
} from "@/lib/financialContracts";
import {
  financialErrorResponse,
  requireFinancialAccess,
  requireSameEventSavedSupplier,
} from "@/lib/financialAuthorization";
import { logger } from "@/lib/logger";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ExpenseResponse = {
  id?: string;
  category: string;
  subcategory: string;
  supplier: string;
  savedSupplierId: string | null;
  description: string;
  amount: number;
  committed?: number;
  paid?: number;
  spendType: "common" | "bride" | "groom";
  status: "pending" | "approved" | "rejected";
  date: string;
  notes: string;
  fromDashboard: boolean;
};

type ExpenseQueryRow = {
  id: string;
  supplier: string | null;
  saved_supplier_id: string | null;
  description: string | null;
  committed_amount: number | null;
  paid_amount: number | null;
  spend_type: string | null;
  status: string | null;
  expense_date: string | null;
  notes: string | null;
  from_dashboard: boolean | null;
  subcategory: {
    name: string | null;
    category: { name: string | null; event_id: string | null } | null;
  } | null;
};

export async function GET(req: NextRequest) {
  const jwt = getBearer(req);
  if (!jwt) {
    return NextResponse.json({
      expenses: [
        {
          id: "demo-1",
          category: "Location & Catering",
          subcategory: "Catering / Banqueting",
          supplier: "Catering Gourmet",
          savedSupplierId: null,
          description: "Acconto catering",
          amount: 2000,
          spendType: "common",
          status: "approved",
          date: "2025-10-15",
          notes: "Pagato con bonifico",
          fromDashboard: true,
        },
        {
          id: "demo-2",
          category: "Foto & Video",
          subcategory: "Servizio fotografico",
          supplier: "Studio Foto Arte",
          savedSupplierId: null,
          description: "Saldo fotografo",
          amount: 1500,
          spendType: "common",
          status: "pending",
          date: "2025-10-20",
          notes: "Da pagare entro fine mese",
          fromDashboard: true,
        },
      ],
    });
  }

  try {
    const { currentEvent } = await requireFinancialAccess(req, "read");
    const db = getServiceClient();
    const { data: expensesData, error } = await db
      .from("expenses")
      .select(`
        id,
        supplier,
        saved_supplier_id,
        description,
        committed_amount,
        paid_amount,
        spend_type,
        status,
        expense_date,
        notes,
        from_dashboard,
        subcategory:subcategories(
          name,
          category:categories(name, event_id)
        )
      `)
      .eq("event_id", currentEvent.eventId)
      .order("expense_date", { ascending: false });

    if (error) {
      logger.error("EXPENSES GET error", { code: error.code });
      return NextResponse.json({ error: "EXPENSES_READ_FAILED" }, { status: 500 });
    }

    const rows = (expensesData || []) as unknown as ExpenseQueryRow[];
    const expenses: ExpenseResponse[] = rows.map((expense) => ({
      id: expense.id,
      category: expense.subcategory?.category?.name || "",
      subcategory: expense.subcategory?.name || "",
      supplier: expense.supplier || "",
      savedSupplierId: expense.saved_supplier_id,
      description: expense.description || "",
      amount: Number(expense.paid_amount || expense.committed_amount || 0),
      committed: Number(expense.committed_amount || 0),
      paid: Number(expense.paid_amount || 0),
      spendType: (expense.spend_type || "common") as ExpenseResponse["spendType"],
      status: (expense.status || "pending") as ExpenseResponse["status"],
      date: expense.expense_date || new Date().toISOString().split("T")[0],
      notes: expense.notes || "",
      fromDashboard: expense.from_dashboard || false,
    }));

    return NextResponse.json({ expenses });
  } catch (error) {
    return financialErrorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { currentEvent } = await requireFinancialAccess(req, "mutate");
    const expense = parseExpenseCreate(await req.json());
    const db = getServiceClient();

    let { data: category } = await db
      .from("categories")
      .select("id")
      .eq("event_id", currentEvent.eventId)
      .eq("name", expense.category)
      .single();

    if (!category) {
      const { data: createdCategory } = await db
        .from("categories")
        .insert({ event_id: currentEvent.eventId, name: expense.category })
        .select("id")
        .single();
      category = createdCategory;
    }
    if (!category?.id) {
      return NextResponse.json({ error: "CATEGORY_CREATE_FAILED" }, { status: 500 });
    }

    let { data: subcategory } = await db
      .from("subcategories")
      .select("id")
      .eq("category_id", category.id)
      .eq("name", expense.subcategory)
      .single();

    if (!subcategory) {
      const { data: createdSubcategory } = await db
        .from("subcategories")
        .insert({ category_id: category.id, name: expense.subcategory })
        .select("id")
        .single();
      subcategory = createdSubcategory;
    }
    if (!subcategory?.id) {
      return NextResponse.json({ error: "SUBCATEGORY_CREATE_FAILED" }, { status: 500 });
    }

    const insert: ExpenseInsert = {
      event_id: currentEvent.eventId,
      category: expense.category,
      subcategory: expense.subcategory,
      subcategory_id: subcategory.id,
      supplier: expense.supplier,
      description: expense.description,
      amount: expense.amount,
      committed_amount: expense.amount,
      paid_amount: expense.status === "approved" ? expense.amount : 0,
      spend_type: expense.spendType,
      status: expense.status,
      expense_date: expense.date,
      notes: expense.notes,
      from_dashboard: expense.fromDashboard,
    };
    const { data: created, error } = await db
      .from("expenses")
      .insert(insert)
      .select()
      .single();

    if (error) {
      logger.error("EXPENSES POST error", { code: error.code });
      return NextResponse.json({ error: "EXPENSE_CREATE_FAILED" }, { status: 500 });
    }
    return NextResponse.json({ expense: created });
  } catch (error) {
    if (error instanceof FinancialContractError) {
      return NextResponse.json({ error: error.code }, { status: 400 });
    }
    return financialErrorResponse(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { currentEvent } = await requireFinancialAccess(req, "mutate");
    const link = parseExpenseSupplierLink(await req.json());
    const db = getServiceClient();

    if (link.savedSupplierId) {
      await requireSameEventSavedSupplier(
        db,
        currentEvent.eventId,
        link.savedSupplierId,
      );
    }

    const { data, error } = await db
      .from("expenses")
      .update({ saved_supplier_id: link.savedSupplierId })
      .eq("id", link.id)
      .eq("event_id", currentEvent.eventId)
      .select()
      .maybeSingle();

    if (error) {
      logger.error("EXPENSES PATCH error", { code: error.code });
      return NextResponse.json({ error: "EXPENSE_LINK_FAILED" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "EXPENSE_NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json({ expense: data });
  } catch (error) {
    if (error instanceof FinancialContractError) {
      return NextResponse.json({ error: error.code }, { status: 400 });
    }
    return financialErrorResponse(error);
  }
}
