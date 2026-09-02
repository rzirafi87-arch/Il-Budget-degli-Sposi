/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireUser } from "@/lib/apiAuth";
import { getServiceClient } from "@/lib/supabaseServer";
import { requireServerCurrentEvent } from "@/lib/currentEvent";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const CARD_FIELDS = [
  "bride_name",
  "groom_name",
  "wedding_date",
  "church_name",
  "church_address",
  "location_name",
  "location_address",
  "iban",
  "bank_name",
  "ceremony_time",
  "reception_time",
  "font_family",
  "color_scheme",
  "template_style",
  "custom_message",
] as const;

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function sanitizeCard(body: Record<string, unknown>) {
  return Object.fromEntries(
    CARD_FIELDS.map((field) => [field, typeof body[field] === "string" ? body[field] : ""]),
  );
}

export async function GET(request: NextRequest) {
  let userId: string;
  try {
    ({ userId } = await requireUser(request));
  } catch {
    return unauthorized();
  }

  try {
    const supabase = getServiceClient();

    const current = await requireServerCurrentEvent(userId);
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select("id, wedding_date")
      .eq("id", current.eventId)
      .maybeSingle();

    if (eventError) {
      console.error("Error fetching owned event for wedding card:", eventError);
      return NextResponse.json({ error: "Unable to load wedding card" }, { status: 500 });
    }

    if (!eventData) {
      return NextResponse.json({ config: null });
    }

    const { data: config, error } = await supabase
      .from("wedding_cards")
      .select("*")
      .eq("event_id", eventData.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching wedding card:", error);
      return NextResponse.json({ error: "Unable to load wedding card" }, { status: 500 });
    }

    const finalConfig = config || {
      bride_name: "",
      groom_name: "",
      wedding_date: eventData.wedding_date || "",
      church_name: "",
      church_address: "",
      location_name: "",
      location_address: "",
      iban: "",
      bank_name: "",
      ceremony_time: "",
      reception_time: "",
      font_family: "Playfair Display",
      color_scheme: "classic",
      template_style: "elegant",
      custom_message: "",
    };

    return NextResponse.json({ config: finalConfig });
  } catch (err: any) {
    console.error("Unexpected wedding card GET error:", err);
    return NextResponse.json({ error: "Unable to load wedding card" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let userId: string;
  try {
    ({ userId } = await requireUser(request));
  } catch {
    return unauthorized();
  }

  try {
    const supabase = getServiceClient();
    const rawBody = (await request.json()) as Record<string, unknown>;
    const card = sanitizeCard(rawBody);

    const eventData = { id: (await requireServerCurrentEvent(userId)).eventId };

    if (card.wedding_date) {
      const { error: updateError } = await supabase
        .from("events")
        .update({ wedding_date: card.wedding_date })
        .eq("id", eventData.id)
        .eq("owner_id", userId);

      if (updateError) {
        console.error("Error updating owned event date:", updateError);
        return NextResponse.json({ error: "Unable to save wedding card" }, { status: 500 });
      }
    }

    const { data, error } = await supabase
      .from("wedding_cards")
      .upsert(
        {
          ...card,
          event_id: eventData.id,
        },
        {
          onConflict: "event_id",
        },
      )
      .select()
      .single();

    if (error) {
      console.error("Error saving wedding card:", error);
      return NextResponse.json({ error: "Unable to save wedding card" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Unexpected wedding card POST error:", err);
    return NextResponse.json({ error: "Unable to save wedding card" }, { status: 500 });
  }
}
