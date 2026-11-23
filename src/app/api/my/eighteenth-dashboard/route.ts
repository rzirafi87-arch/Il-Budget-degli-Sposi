import { requireFinancialAccess, financialErrorResponse } from "@/lib/financialAuthorization";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { currentEvent } = await requireFinancialAccess(req, "read");
    if (currentEvent.eventType !== "eighteenth") {
      return NextResponse.json({ error: "EVENT_TYPE_MISMATCH" }, { status: 409 });
    }
    const db = getServiceClient();
    const { data: event, error } = await db.from("events")
      .select("id,name,event_date,total_budget,currency").eq("id", currentEvent.eventId).single();
    if (error || !event) return NextResponse.json({ error: "EVENT_READ_FAILED" }, { status: 500 });
    const { data: rows, error: expenseError } = await db.from("expenses")
      .select("id,committed_amount,paid_amount,status,subcategory:subcategories(name,category:categories(name))")
      .eq("event_id", currentEvent.eventId);
    if (expenseError) return NextResponse.json({ error: "EXPENSES_READ_FAILED" }, { status: 500 });
    const entries = (rows || []).map((row) => {
      const sub = (Array.isArray(row.subcategory) ? row.subcategory[0] : row.subcategory) as {category?: {name?: string} | {name?: string}[] | null} | null;
      const category = Array.isArray(sub?.category) ? sub.category[0] : sub?.category;
      return {id:row.id, category:category?.name || '',committed:Number(row.committed_amount || 0),paid:Number(row.paid_amount || 0),status:row.status};
    });
    return NextResponse.json({ event, entries });
  } catch (error) {
    return financialErrorResponse(error);
  }
}
