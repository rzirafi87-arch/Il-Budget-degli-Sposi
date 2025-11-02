export const runtime = "nodejs";
import { getEighteenthTemplate } from "@/data/templates/eighteenth";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

type ExpenseRow = {
  id?: string;
  category: string;
  subcategory: string;
  subcategoryId: string;
  supplier: string;
  amount: number;
  spendType: string;
  notes: string;
};

// GET /api/my/eighteenth-dashboard
// Returns all categories and subcategories for eighteenth event type
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];

    // Demo mode - return empty template
    if (!jwt) {
      const { searchParams } = new URL(req.url);
      const country = searchParams.get("country") || "it";
      const template = getEighteenthTemplate(country);

      return NextResponse.json({
        event: {
          id: "demo",
          name: "Il mio Diciottesimo",
          event_date: null,
          total_budget: 0,
        },
        categories: template.map((cat) => ({
          category: cat.name,
          subcategory: "",
          supplier: "",
          amount: 0,
          spendType: "common",
          notes: "",
        })),
      });
    }

    // Authenticated mode
    const db = getServiceClient();
    const { data: userData, error: authError } = await db.auth.getUser(jwt);
    if (authError || !userData?.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const userId = userData.user.id;

    // Get user's eighteenth event (assuming one event per user)
    const { data: eventData, error: eventError } = await db
      .from("events")
      .select("*")
      .eq("user_id", userId)
      .limit(1)
      .single();

    if (eventError || !eventData) {
      // No event yet - return template
      const { searchParams } = new URL(req.url);
      const country = searchParams.get("country") || "it";
      const template = getEighteenthTemplate(country);

      return NextResponse.json({
        event: null,
        categories: template.map((cat) => ({
          category: cat.name,
          subcategory: "",
          supplier: "",
          amount: 0,
          spendType: "common",
          notes: "",
        })),
      });
    }

    const eventId = eventData.id;

    // Get event type for eighteenth
    const { data: eventType } = await db
      .from("event_types")
      .select("id")
      .eq("slug", "eighteenth")
      .single();

    if (!eventType) {
      return NextResponse.json(
        { error: "Eighteenth event type not configured" },
        { status: 500 }
      );
    }

    // Get categories
    const { data: categories } = await db
      .from("categories")
      .select("id, name, sort")
      .eq("type_id", eventType.id)
      .order("sort");

    if (!categories || categories.length === 0) {
      return NextResponse.json(
        { error: "No categories found for eighteenth" },
        { status: 500 }
      );
    }

    // Get subcategories
    const categoryIds = categories.map((c) => c.id);
    const { data: subcategories } = await db
      .from("subcategories")
      .select("id, category_id, name, sort")
      .in("category_id", categoryIds)
      .order("category_id")
      .order("sort");

    // Get expenses
    const { data: expenses } = await db
      .from("expenses")
      .select("*")
      .eq("event_id", eventId);

    // Build expense map by subcategory
    type ExpenseType = NonNullable<typeof expenses>[0];
    const expenseMap = new Map<string, ExpenseType>();
    if (expenses) {
      expenses.forEach((exp) => {
        if (exp.subcategory_id) {
          expenseMap.set(exp.subcategory_id, exp);
        }
      });
    }

    // Build rows
    const rows: ExpenseRow[] = [];
    categories.forEach((cat) => {
      const subs = subcategories?.filter((s) => s.category_id === cat.id) || [];
      
      subs.forEach((sub) => {
        const expense = expenseMap.get(sub.id);
        rows.push({
          id: expense?.id,
          category: cat.name,
          subcategory: sub.name,
          subcategoryId: sub.id,
          supplier: expense?.supplier || "",
          amount: expense?.amount || 0,
          spendType: "common", // Eighteenth always common
          notes: expense?.notes || "",
        });
      });
    });

    return NextResponse.json({
      event: {
        id: eventData.id,
        name: eventData.name || "Il mio Diciottesimo",
        event_date: eventData.event_date,
        total_budget: eventData.total_budget || 0,
      },
      categories: rows,
    });
  } catch (e) {
    console.error("/api/my/eighteenth-dashboard error", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/my/eighteenth-dashboard
// Save eighteenth budget and expenses
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];

    if (!jwt) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const db = getServiceClient();
    const { data: userData, error: authError } = await db.auth.getUser(jwt);
    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = userData.user.id;
    const body = await req.json();

    const { event, categories } = body;

    // Get or create event
    let { data: eventData } = await db
      .from("events")
      .select("*")
      .eq("user_id", userId)
      .limit(1)
      .single();

    if (!eventData) {
      // Create event
      const { data: newEvent, error: createError } = await db
        .from("events")
        .insert({
          user_id: userId,
          name: event?.name || "Il mio Diciottesimo",
          event_date: event?.event_date,
          total_budget: event?.total_budget || 0,
        })
        .select()
        .single();

      if (createError || !newEvent) {
        return NextResponse.json(
          { error: "Failed to create event" },
          { status: 500 }
        );
      }
      eventData = newEvent;
    } else {
      // Update event
      await db
        .from("events")
        .update({
          name: event?.name || eventData.name,
          event_date: event?.event_date,
          total_budget: event?.total_budget || 0,
        })
        .eq("id", eventData.id);
    }

    const eventId = eventData.id;

    // Save expenses
    if (categories && Array.isArray(categories)) {
      for (const row of categories) {
        if (!row.subcategoryId || row.amount === 0) continue;

        const expenseData = {
          event_id: eventId,
          subcategory_id: row.subcategoryId,
          supplier: row.supplier || "",
          amount: row.amount || 0,
          spend_type: "common", // Always common for eighteenth
          notes: row.notes || "",
          status: "approved",
          from_budget: true,
        };

        if (row.id) {
          // Update existing
          await db
            .from("expenses")
            .update(expenseData)
            .eq("id", row.id);
        } else {
          // Insert new
          await db.from("expenses").insert(expenseData);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Eighteenth dashboard saved successfully",
      eventId,
    });
  } catch (e) {
    console.error("/api/my/eighteenth-dashboard POST error", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
