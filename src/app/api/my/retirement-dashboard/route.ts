import { getRetirementTemplate } from "@/data/templates/retirement";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// GET: Fetch retirement dashboard data
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];

  if (!jwt) {
    // Demo mode: return empty structure
    const template = getRetirementTemplate("IT");
    return NextResponse.json({
      categories: template.map((cat) => ({ name: cat.name, subs: cat.subs })),
      subcategories: [],
      expenses: [],
    });
  }

  const db = getServiceClient();
  const { data: userData, error: authError } = await db.auth.getUser(jwt);

  if (authError || !userData.user) {
    return NextResponse.json(
      { error: "Invalid authentication" },
      { status: 401 }
    );
  }

  const userId = userData.user.id;

  // Get user's retirement event
  const { data: event } = await db
    .from("events")
    .select("id")
    .eq("user_id", userId)
    .eq("event_type", "retirement")
    .single();

  if (!event) {
    return NextResponse.json({ error: "No retirement event found" }, { status: 404 });
  }

  // Fetch categories, subcategories, and expenses
  const { data: categories } = await db
    .from("categories")
    .select("id, name")
    .eq("event_id", event.id)
    .order("display_order");

  const { data: subcategories } = await db
    .from("subcategories")
    .select("id, category_id, name, estimated_cost")
    .in(
      "category_id",
      categories?.map((c) => c.id) || []
    )
    .order("display_order");

  const { data: expenses } = await db
    .from("expenses")
    .select("id, subcategory_id, amount, spend_type, supplier, notes, date")
    .in(
      "subcategory_id",
      subcategories?.map((s) => s.id) || []
    )
    .order("date", { ascending: false });

  return NextResponse.json({
    categories: categories || [],
    subcategories: subcategories || [],
    expenses: expenses || [],
  });
}

// POST: Save retirement expense
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];

  if (!jwt) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const db = getServiceClient();
  const { data: userData, error: authError } = await db.auth.getUser(jwt);

  if (authError || !userData.user) {
    return NextResponse.json(
      { error: "Invalid authentication" },
      { status: 401 }
    );
  }

  const userId = userData.user.id;

  const body = await req.json();
  const { category, subcategory, supplier, amount, notes } = body;

  // Get user's retirement event
  const { data: event } = await db
    .from("events")
    .select("id")
    .eq("user_id", userId)
    .eq("event_type", "retirement")
    .single();

  if (!event) {
    return NextResponse.json(
      { error: "No retirement event found" },
      { status: 404 }
    );
  }

  // Upsert category
  const { data: cat } = await db
    .from("categories")
    .upsert(
      { event_id: event.id, name: category },
      { onConflict: "event_id,name" }
    )
    .select("id")
    .single();

  if (!cat) {
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }

  // Upsert subcategory
  const { data: sub } = await db
    .from("subcategories")
    .upsert(
      { category_id: cat.id, name: subcategory },
      { onConflict: "category_id,name" }
    )
    .select("id")
    .single();

  if (!sub) {
    return NextResponse.json(
      { error: "Failed to create subcategory" },
      { status: 500 }
    );
  }

  // Insert expense (single-budget: always "common")
  const { data: expense, error: expenseError } = await db
    .from("expenses")
    .insert({
      subcategory_id: sub.id,
      amount: parseFloat(amount),
      spend_type: "common", // Single-budget event
      supplier: supplier || "",
      notes: notes || "",
      date: new Date().toISOString().split("T")[0],
    })
    .select()
    .single();

  if (expenseError || !expense) {
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, expense });
}
