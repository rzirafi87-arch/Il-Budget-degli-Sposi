import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";
import { sendSubscriptionActivated } from "@/lib/emailService";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-09-30.clover" })
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const db = getServiceClient();

    // Gestisci eventi Stripe
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        const metadata = session.metadata;
        if (!metadata) break;

        const { user_id, tier, billing_period, supplier_id, location_id, church_id } = metadata;
        const amount = (session.amount_total || 0) / 100;

        // Calcola date di inizio e scadenza
        const startsAt = new Date();
        const expiresAt = new Date();
        
        if (billing_period === "monthly") {
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        } else {
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        }

        // Crea transazione
        const transactionData: any = {
          tier,
          amount,
          currency: "EUR",
          billing_period,
          payment_provider: "stripe",
          payment_id: session.payment_intent as string,
          status: "completed",
          starts_at: startsAt.toISOString(),
          expires_at: expiresAt.toISOString(),
        };

        if (supplier_id) transactionData.supplier_id = supplier_id;
        if (location_id) transactionData.location_id = location_id;
        if (church_id) transactionData.church_id = church_id;

        const { error: txError } = await db
          .from("subscription_transactions")
          .insert(transactionData);

        if (txError) {
          console.error("Error creating transaction:", txError);
          break;
        }

        // Aggiorna supplier/location/church con nuovo tier
        let entityEmail = "";
        let entityName = "";

        if (supplier_id) {
          const { data: supplier } = await db
            .from("suppliers")
            .update({
              subscription_tier: tier,
              subscription_expires_at: expiresAt.toISOString(),
            })
            .eq("id", supplier_id)
            .select("email, name")
            .single();
          
          if (supplier) {
            entityEmail = supplier.email || "";
            entityName = supplier.name || "";
          }
        } else if (location_id) {
          const { data: location } = await db
            .from("locations")
            .update({
              subscription_tier: tier,
              subscription_expires_at: expiresAt.toISOString(),
            })
            .eq("id", location_id)
            .select("email, name")
            .single();
          
          if (location) {
            entityEmail = location.email || "";
            entityName = location.name || "";
          }
        } else if (church_id) {
          const { data: church } = await db
            .from("churches")
            .update({
              subscription_tier: tier,
              subscription_expires_at: expiresAt.toISOString(),
            })
            .eq("id", church_id)
            .select("email, name")
            .single();
          
          if (church) {
            entityEmail = church.email || "";
            entityName = church.name || "";
          }
        }

        // Invia email di conferma
        if (entityEmail && entityName) {
          await sendSubscriptionActivated(
            entityEmail,
            entityName,
            tier,
            expiresAt,
            billing_period
          );
        }

        console.log("✓ Subscription activated:", { tier, billing_period, supplier_id, location_id, church_id });
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error("Payment failed:", paymentIntent.id);
        
        // Aggiorna transazione come failed
        await db
          .from("subscription_transactions")
          .update({ status: "failed" })
          .eq("payment_id", paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (e: any) {
    console.error("STRIPE WEBHOOK error:", e);
    return NextResponse.json({ error: e?.message || "Webhook error" }, { status: 500 });
  }
}
