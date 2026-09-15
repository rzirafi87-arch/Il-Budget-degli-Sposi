import { getBearer } from "@/lib/apiAuth";
import {
  FinancialContractError,
  parseBudgetItemCreate,
  type BudgetItemInsert,
} from "@/lib/financialContracts";
import {
  financialErrorResponse,
  requireFinancialAccess,
  requireSameEventSavedSupplier,
} from "@/lib/financialAuthorization";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get("country") || "mx";
  const traditionId = req.nextUrl.searchParams.get("tradition_id");
  const db = getServiceClient();
  const jwt = getBearer(req);

  if (jwt) {
    try {
      const { currentEvent } = await requireFinancialAccess(req, "read");
      let userQuery = db
        .from("budget_items")
        .select("*")
        .eq("country_code", country)
        .eq("event_id", currentEvent.eventId);
      if (traditionId) userQuery = userQuery.eq("tradition_id", traditionId);
      const { data, error } = await userQuery;
      if (error) {
        return NextResponse.json({ error: "BUDGET_ITEMS_READ_FAILED" }, { status: 500 });
      }
      return NextResponse.json({ items: data });
    } catch (error) {
      return financialErrorResponse(error);
    }
  }

  let publicQuery = db
    .from("budget_items")
    .select("*")
    .eq("country_code", country)
    .is("event_id", null);
  if (traditionId) publicQuery = publicQuery.eq("tradition_id", traditionId);
  const { data, error } = await publicQuery;
  if (error) {
    return NextResponse.json({ error: "BUDGET_ITEMS_READ_FAILED" }, { status: 500 });
  }
  return NextResponse.json({ items: data });
}

export async function POST(req: NextRequest) {
  try {
    const { currentEvent } = await requireFinancialAccess(req, "mutate");
    const body: unknown = await req.json();
    const rows = Array.isArray(body) ? body : [body];
    if (rows.length === 0 || rows.length > 100) {
      return NextResponse.json({ error: "INVALID_FINANCIAL_PAYLOAD" }, { status: 400 });
    }

    const creates = rows.map(parseBudgetItemCreate);
    const db = getServiceClient();
    const savedSupplierIds = new Set(
      creates
        .map((row) => row.saved_supplier_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0),
    );
    for (const savedSupplierId of savedSupplierIds) {
      await requireSameEventSavedSupplier(db, currentEvent.eventId, savedSupplierId);
    }

    const payload: BudgetItemInsert[] = creates.map((row) => ({
      ...row,
      event_id: currentEvent.eventId,
    }));
    const { data, error } = await db.from("budget_items").insert(payload).select();
    if (error) {
      return NextResponse.json({ error: "BUDGET_ITEM_CREATE_FAILED" }, { status: 500 });
    }
    return NextResponse.json({ item: data?.[0] ?? null });
  } catch (error) {
    if (error instanceof FinancialContractError) {
      return NextResponse.json({ error: error.code }, { status: 400 });
    }
    return financialErrorResponse(error);
  }
}
