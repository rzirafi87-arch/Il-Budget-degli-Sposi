import { BRAND_NAME } from "@/config/brand";
import { flags } from "@/config/flags";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
export const runtime = "nodejs";

// Initialize Stripe using the account's default API version to avoid mismatches
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

type CheckoutRequest = {
  tier: "base" | "premium" | "premium_plus";
  billing_period: "monthly" | "yearly";
  supplier_id?: string;
  location_id?: string;
  church_id?: string;
};

export async function POST(req: NextRequest) {
  try {
    if (!flags.payments_stripe) {
      return NextResponse.json({ error: "Pagamenti temporaneamente disabilitati" }, { status: 503 });
    }
    if (!stripe) {
      return NextResponse.json({ error: "Stripe non configurato" }, { status: 503 });
    }

    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];

    if (!jwt) {
      return NextResponse.json({ error: "Autenticazione richiesta" }, { status: 401 });
    }

    const db = getServiceClient();
    const { data: userData, error: authError } = await db.auth.getUser(jwt);
    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = (await req.json()) as CheckoutRequest;
    const { tier, billing_period, supplier_id, location_id, church_id } = body;

    // Validazione
    if (!tier || !billing_period) {
      return NextResponse.json({ error: "tier e billing_period richiesti" }, { status: 400 });
    }

    if (!supplier_id && !location_id && !church_id) {
      return NextResponse.json({ error: "Specificare supplier_id, location_id o church_id" }, { status: 400 });
    }

    // Ottieni prezzo dal database
    const { data: packageData, error: pkgError } = await db
      .from("subscription_packages")
      .select("price_monthly, price_yearly, name_it")
      .eq("tier", tier)
      .single();

    if (pkgError || !packageData) {
      return NextResponse.json({ error: "Pacchetto non trovato" }, { status: 404 });
    }

    const amount = billing_period === "monthly" 
      ? packageData.price_monthly 
      : packageData.price_yearly;

    const amountInCents = Math.round(amount * 100);

    // Crea Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `${packageData.name_it} - ${billing_period === "monthly" ? "Mensile" : "Annuale"}`,
              description: `Abbonamento ${tier} per ${BRAND_NAME}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/fornitori-dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/pacchetti-fornitori?payment=cancelled`,
      metadata: {
        user_id: userData.user.id,
        tier,
        billing_period,
        supplier_id: supplier_id || "",
        location_id: location_id || "",
        church_id: church_id || "",
      },
    });

    return NextResponse.json({ 
      sessionId: session.id, 
      url: session.url 
    });
  } catch (e: unknown) {
    const error = e as Error;
    console.error("STRIPE CHECKOUT error:", error);
    return NextResponse.json({ error: error?.message || "Errore creazione sessione" }, { status: 500 });
  }
}
