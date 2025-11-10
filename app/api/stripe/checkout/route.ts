import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const { priceLookupKey } = await req.json();
  const origin = process.env.APP_URL as string;

  const prices = await stripe.prices.list({ lookup_keys: [priceLookupKey], expand: ["data.product"] });
  const price = prices.data[0];
  if (!price) return NextResponse.json({ error: "Price not found" }, { status: 400 });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: price.id, quantity: 1 }],
    success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/billing/cancel`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
