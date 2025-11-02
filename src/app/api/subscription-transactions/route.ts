export const runtime = "nodejs";

import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

type SubscriptionTransactionInput = {
  entity_type: "supplier" | "location" | "church";
  entity_id: string;
  tier: "base" | "premium" | "premium_plus";
  billing_period: "monthly" | "yearly";
  payment_provider?: string;
  payment_id?: string;
};

/**
 * GET /api/subscription-transactions
 * Returns user's subscription transactions
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];

  if (!jwt) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const db = getServiceClient();
    const { data: userData, error: authError } = await db.auth.getUser(jwt);

    if (authError || !userData?.user) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 }
      );
    }

    const userId = userData.user.id;

    // Get all transactions for user's suppliers/locations/churches
    const { data: transactions, error } = await db
      .from("subscription_transactions")
      .select(`
        *,
        supplier:suppliers(id, name, category),
        location:locations(id, name, location_type),
        church:churches(id, name, city)
      `)
      .or(
        `supplier_id.in.(SELECT id FROM suppliers WHERE user_id = '${userId}'),` +
        `location_id.in.(SELECT id FROM locations WHERE user_id = '${userId}'),` +
        `church_id.in.(SELECT id FROM churches WHERE user_id = '${userId}')`
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error);
      return NextResponse.json(
        { error: "Failed to fetch transactions" },
        { status: 500 }
      );
    }

    return NextResponse.json({ transactions: transactions || [] });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subscription-transactions
 * Creates a new subscription transaction (after payment)
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];

  if (!jwt) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const db = getServiceClient();
    const { data: userData, error: authError } = await db.auth.getUser(jwt);

    if (authError || !userData?.user) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 }
      );
    }

    const userId = userData.user.id;
    const body: SubscriptionTransactionInput = await req.json();

    const { entity_type, entity_id, tier, billing_period, payment_provider, payment_id } = body;

    // Validate required fields
    if (!entity_type || !entity_id || !tier || !billing_period) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify ownership of the entity
    const tableName = entity_type === "supplier" ? "suppliers" : entity_type === "location" ? "locations" : "churches";
    const { data: entity, error: entityError } = await db
      .from(tableName)
      .select("id, user_id")
      .eq("id", entity_id)
      .single();

    if (entityError || !entity || entity.user_id !== userId) {
      return NextResponse.json(
        { error: "Entity not found or access denied" },
        { status: 403 }
      );
    }

    // Get package pricing
    const { data: pkg, error: pkgError } = await db
      .from("subscription_packages")
      .select("price_monthly, price_yearly")
      .eq("tier", tier)
      .single();

    if (pkgError || !pkg) {
      return NextResponse.json(
        { error: "Invalid subscription tier" },
        { status: 400 }
      );
    }

    const amount = billing_period === "monthly" ? pkg.price_monthly : pkg.price_yearly;
    const now = new Date();
    const expiresAt = new Date(now);
    
    if (billing_period === "monthly") {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    // Create transaction
    const transactionData: Record<string, unknown> = {
      tier,
      amount,
      currency: "EUR",
      billing_period,
      payment_provider,
      payment_id,
      status: "completed", // Assume payment already processed
      starts_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    };

    // Set the correct entity ID
    if (entity_type === "supplier") {
      transactionData.supplier_id = entity_id;
    } else if (entity_type === "location") {
      transactionData.location_id = entity_id;
    } else {
      transactionData.church_id = entity_id;
    }

    const { data: transaction, error: txError } = await db
      .from("subscription_transactions")
      .insert(transactionData)
      .select()
      .single();

    if (txError) {
      console.error("Error creating transaction:", txError);
      return NextResponse.json(
        { error: "Failed to create transaction" },
        { status: 500 }
      );
    }

    // Update entity subscription status
    const { error: updateError } = await db
      .from(tableName)
      .update({
        subscription_tier: tier,
        subscription_expires_at: expiresAt.toISOString(),
      })
      .eq("id", entity_id);

    if (updateError) {
      console.error("Error updating entity subscription:", updateError);
      // Don't fail the request, transaction was created
    }

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
