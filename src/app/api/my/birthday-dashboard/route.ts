export const runtime = "nodejs";
import { getBirthdayTemplate } from "@/data/templates/birthday";
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

// GET /api/my/birthday-dashboard
// Returns all categories and subcategories for birthday event type
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];

    // Demo mode - return empty template
    if (!jwt) {
      const { searchParams } = new URL(req.url);
      const country = searchParams.get("country") || "it";
      const template = getBirthdayTemplate(country);

      return NextResponse.json({
        event: {
          id: "demo",
          name: "Il mio Compleanno",
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

    // Get user's birthday event
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
      const template = getBirthdayTemplate(country);

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

    // Get event type for birthday
    const { data: eventType } = await db
      .from("event_types")
      .select("id")
      .eq("slug", "birthday")
      .single();

    if (!eventType) {
      return NextResponse.json(
        { error: "Birthday event type not configured" },
        { status: 500 }
      );
    }

    // Get all categories and subcategories
    const { data: categories, error: catError } = await db
      .from("categories")
      .select(`
        id,
        name,
        subcategories (
          id,
          name
        )
      `)
      .eq("event_id", eventId)
      .order("name");

    if (catError) {
      console.error("Error fetching categories:", catError);
      return NextResponse.json(
        { error: "Failed to fetch categories" },
        { status: 500 }
      );
    }

    // Get all expenses for this event
    const { data: expenses, error: expError } = await db
      .from("expenses")
      .select(`
        id,
        amount,
        notes,
        supplier,
        spend_type,
        subcategory_id,
        subcategories (
          id,
          name,
          category_id,
          categories (
            id,
            name
          )
        )
      `)
      .eq("event_id", eventId);

    if (expError) {
      console.error("Error fetching expenses:", expError);
    }

    // Build expense map by subcategory
    const expenseMap = new Map<string, any>();
    if (expenses) {
      expenses.forEach((exp: any) => {
        const subId = exp.subcategory_id;
        if (!expenseMap.has(subId)) {
          expenseMap.set(subId, []);
        }
        expenseMap.get(subId)!.push({
          id: exp.id,
          amount: exp.amount || 0,
          notes: exp.notes || "",
          supplier: exp.supplier || "",
          spendType: exp.spend_type || "common",
        });
      });
    }

    // Build rows with all categories/subcategories
    const rows: ExpenseRow[] = [];
    categories?.forEach((cat: any) => {
      const subs = cat.subcategories || [];
      subs.forEach((sub: any) => {
        const expensesForSub = expenseMap.get(sub.id) || [];
        if (expensesForSub.length > 0) {
          expensesForSub.forEach((exp: any) => {
            rows.push({
              id: exp.id,
              category: cat.name,
              subcategory: sub.name,
              subcategoryId: sub.id,
              supplier: exp.supplier,
              amount: exp.amount,
              spendType: exp.spendType,
              notes: exp.notes,
            });
          });
        } else {
          // Empty row for subcategory
          rows.push({
            category: cat.name,
            subcategory: sub.name,
            subcategoryId: sub.id,
            supplier: "",
            amount: 0,
            spendType: "common",
            notes: "",
          });
        }
      });
    });

    return NextResponse.json({
      event: eventData,
      categories: rows,
    });
  } catch (error) {
    console.error("Birthday dashboard GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/my/birthday-dashboard
// Save all expense rows for birthday event
export async function POST(req: NextRequest) {
  try {
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
    if (authError || !userData?.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const userId = userData.user.id;

    // Get user's event
    const { data: eventData, error: eventError } = await db
      .from("events")
      .select("id")
      .eq("user_id", userId)
      .limit(1)
      .single();

    if (eventError || !eventData) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const eventId = eventData.id;

    // Parse request body
    const body = await req.json();
    const rows: ExpenseRow[] = body.rows || [];

    // Delete all existing expenses for this event
    await db.from("expenses").delete().eq("event_id", eventId);

    // Insert new expenses (only rows with amount > 0 or notes/supplier)
    const expensesToInsert = rows
      .filter((row) => row.amount > 0 || row.notes || row.supplier)
      .map((row) => ({
        event_id: eventId,
        subcategory_id: row.subcategoryId,
        amount: row.amount || 0,
        notes: row.notes || "",
        supplier: row.supplier || "",
        spend_type: "common", // Birthday is single-budget
        date: new Date().toISOString().split("T")[0],
      }));

    if (expensesToInsert.length > 0) {
      const { error: insertError } = await db
        .from("expenses")
        .insert(expensesToInsert);

      if (insertError) {
        console.error("Error inserting expenses:", insertError);
        return NextResponse.json(
          { error: "Failed to save expenses" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Birthday expenses saved successfully",
      count: expensesToInsert.length,
    });
  } catch (error) {
    console.error("Birthday dashboard POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
