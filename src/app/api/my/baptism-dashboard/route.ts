import { getBaptismTemplate } from "@/data/templates/baptism";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

// GET /api/my/baptism-dashboard
// Returns all categories and subcategories for baptism event type
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];

  // Demo data for unauthenticated users
  if (!jwt) {
    const url = new URL(req.url);
    const country = url.searchParams.get("country") || "it";
    const template = getBaptismTemplate(country);
    
    const demoRows = template.flatMap(cat =>
      cat.subs.map(sub => ({
        category: cat.name,
        subcategory: sub,
        supplier: "",
        amount: 0,
        spendType: "common",
        notes: "",
      }))
    );

    return NextResponse.json({
      rows: demoRows,
      totalBudget: 0,
      eventDate: "",
    });
  }

  // Authenticated flow
  const db = getServiceClient();
  const { data: userData, error: authError } = await db.auth.getUser(jwt);
  
  if (authError || !userData?.user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const userId = userData.user.id;

  try {
    // Get user's baptism event (assuming one event per user)
    const { data: events, error: eventsError } = await db
      .from("events")
      .select("id, type_id, title, total_budget, event_date")
      .eq("owner_id", userId)
      .limit(1);

    if (eventsError) throw eventsError;

    if (!events || events.length === 0) {
      // No event yet - return empty template
      const url = new URL(req.url);
      const country = url.searchParams.get("country") || "it";
      const template = getBaptismTemplate(country);
      
      const emptyRows = template.flatMap(cat =>
        cat.subs.map(sub => ({
          category: cat.name,
          subcategory: sub,
          supplier: "",
          amount: 0,
          spendType: "common",
          notes: "",
        }))
      );

      return NextResponse.json({
        rows: emptyRows,
        totalBudget: 0,
        eventDate: "",
      });
    }

    const event = events[0];
    const eventId = event.id;

    // Get categories for this event type
    const { data: categories, error: catError } = await db
      .from("categories")
      .select("id, name, sort")
      .eq("type_id", event.type_id)
      .order("sort", { ascending: true });

    if (catError) throw catError;

    // Get all subcategories
    const categoryIds = categories?.map(c => c.id) || [];
    const { data: subcategories, error: subError } = await db
      .from("subcategories")
      .select("id, category_id, name, sort")
      .in("category_id", categoryIds)
      .order("sort", { ascending: true });

    if (subError) throw subError;

    // Get expenses for this event
    const { data: expenses, error: expError } = await db
      .from("expenses")
      .select("*")
      .eq("event_id", eventId);

    if (expError) throw expError;

    // Build rows: one per subcategory
    const rows = (categories || []).flatMap(cat => {
      const subs = (subcategories || []).filter(s => s.category_id === cat.id);
      return subs.map(sub => {
        // Find matching expense
        const exp = (expenses || []).find(e => e.subcategory_id === sub.id);
        return {
          id: exp?.id,
          category: cat.name,
          subcategory: sub.name,
          supplier: exp?.supplier || "",
          amount: exp?.amount || 0,
          spendType: "common", // Baptism always common
          notes: exp?.notes || "",
        };
      });
    });

    return NextResponse.json({
      rows,
      totalBudget: event.total_budget || 0,
      eventDate: event.event_date || "",
    });
  } catch (e: unknown) {
    console.error("/api/my/baptism-dashboard error", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Errore server" },
      { status: 500 }
    );
  }
}

// POST /api/my/baptism-dashboard
// Save all budget rows (upsert expenses)
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];

  if (!jwt) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const db = getServiceClient();
  const { data: userData, error: authError } = await db.auth.getUser(jwt);
  
  if (authError || !userData?.user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const userId = userData.user.id;
  const body = await req.json();
  const { rows, totalBudget, eventDate } = body;

  try {
    // Get user's event
    const { data: events, error: eventsError } = await db
      .from("events")
      .select("id, type_id")
      .eq("owner_id", userId)
      .limit(1);

    if (eventsError) throw eventsError;

    if (!events || events.length === 0) {
      return NextResponse.json({ error: "Nessun evento trovato" }, { status: 404 });
    }

    const event = events[0];
    const eventId = event.id;

    // Update event budget and date
    await db
      .from("events")
      .update({ total_budget: totalBudget, event_date: eventDate })
      .eq("id", eventId);

    // Get categories and subcategories for mapping
    const { data: categories } = await db
      .from("categories")
      .select("id, name")
      .eq("type_id", event.type_id);

    const categoryMap = new Map((categories || []).map(c => [c.name, c.id]));

    const { data: subcategories } = await db
      .from("subcategories")
      .select("id, category_id, name")
      .in("category_id", Array.from(categoryMap.values()));

    const subMap = new Map(
      (subcategories || []).map(s => [`${s.category_id}:${s.name}`, s.id])
    );

    // Upsert expenses
    for (const row of rows || []) {
      const catId = categoryMap.get(row.category);
      if (!catId) continue;

      const subId = subMap.get(`${catId}:${row.subcategory}`);
      if (!subId) continue;

      const expenseData = {
        event_id: eventId,
        subcategory_id: subId,
        supplier: row.supplier || "",
        amount: row.amount || 0,
        spend_type: "common", // Always common for baptism
        notes: row.notes || "",
      };

      if (row.id) {
        // Update existing
        await db.from("expenses").update(expenseData).eq("id", row.id);
      } else {
        // Insert new
        await db.from("expenses").insert(expenseData);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error("/api/my/baptism-dashboard POST error", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Errore server" },
      { status: 500 }
    );
  }
}
