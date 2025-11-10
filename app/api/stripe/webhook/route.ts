import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export const config = { api: { bodyParser: false } } as any;

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature") as string;
  const rawBody = Buffer.from(await req.arrayBuffer());

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  // TODO: mappa lo stato su Supabase (profiles/subscriptions)
  // console.log("stripe event:", event.type);

  return NextResponse.json({ received: true });
}
