import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";
import { sendSubscriptionActivated } from "@/lib/emailService";
import Stripe from "stripe";

// Initialize Stripe using account default API version to avoid mismatches
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
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

    // Handle Stripe events
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const metadata = session.metadata;
        if (!metadata) break;

        const { tier, billing_period, supplier_id, location_id, church_id } = metadata as Record<string, string>;
        const amount = (session.amount_total || 0) / 100;

        // Calculate start and expiry dates
        const startsAt = new Date();
        const expiresAt = new Date();

        if (billing_period === "monthly") {
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        } else {
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        }

        // Create transaction
        const transactionData: any = {
          tier,
          amount,
          currency: "EUR",
          billing_period,
          payment_provider: "stripe",
          payment_id: String(session.payment_intent || ""),
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

        // Update related entity with new tier
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

        // Send confirmation email
        if (entityEmail && entityName) {
          await sendSubscriptionActivated(
            entityEmail,
            entityName,
            tier,
            expiresAt,
            billing_period
          );
        }

        console.log("Subscription activated:", { tier, billing_period, supplier_id, location_id, church_id });
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error("Payment failed:", paymentIntent.id);

        // Update transaction as failed
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
  } catch (e: unknown) {
    const error = e as Error;
    console.error("STRIPE WEBHOOK error:", error);
    return NextResponse.json({ error: error?.message || "Webhook error" }, { status: 500 });
  }
}

