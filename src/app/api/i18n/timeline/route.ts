import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const event = searchParams.get("event");
  const locale = searchParams.get("locale") || "it";

  // Demo: restituisce timeline statica per BABY_SHOWER e PROPOSAL
  if (!event || !["BABY_SHOWER", "PROPOSAL"].includes(event)) {
    return NextResponse.json({ timeline: [] });
  }

  const demo = {
    BABY_SHOWER: [
      { code: "PLAN_6W", title: locale === "en" ? "6–8 weeks before" : "6–8 settimane prima", description: locale === "en" ? "Pick date, guest list, budget, theme." : "Scegli data, guest list, budget e tema.", sort: 10 },
      { code: "BOOK_4W", title: locale === "en" ? "4–6 weeks before" : "4–6 settimane prima", description: locale === "en" ? "Book venue/home setup, catering, photographer." : "Prenota location/casa, catering e fotografo.", sort: 20 },
      { code: "INVITES_3W", title: locale === "en" ? "3–4 weeks before" : "3–4 settimane prima", description: locale === "en" ? "Send invites, open RSVPs." : "Invia inviti, apri RSVP.", sort: 30 },
      { code: "DECOR_2W", title: locale === "en" ? "2 weeks before" : "2 settimane prima", description: locale === "en" ? "Order decor, balloons, cake." : "Ordina decor, palloncini, torta.", sort: 40 },
      { code: "FINAL_WEEK", title: locale === "en" ? "Event week" : "Settimana dell’evento", description: locale === "en" ? "Final confirms, setup, games." : "Conferme finali, allestimenti, giochi.", sort: 50 },
      { code: "DAY_OF", title: locale === "en" ? "Day of" : "Giorno evento", description: locale === "en" ? "Setup, welcome, photos, thank-you." : "Allestisci, accoglienza, foto e ringraziamenti.", sort: 60 },
    ],
    PROPOSAL: [
      { code: "PLAN", title: locale === "en" ? "Plan" : "Pianifica", description: locale === "en" ? "Define budget, style and timing." : "Definisci budget, stile e timing.", sort: 10 },
      { code: "BOOK", title: locale === "en" ? "Book" : "Prenota", description: locale === "en" ? "Venue, photographer, music." : "Location, fotografo, musica.", sort: 20 },
      { code: "PREP", title: locale === "en" ? "Prepare" : "Prepara", description: locale === "en" ? "Setup, script, cover story." : "Allestimento, copione, cover-story.", sort: 30 },
      { code: "DAY", title: locale === "en" ? "Day of" : "Il giorno", description: locale === "en" ? "Coordination and surprise." : "Coordinamento e sorpresa.", sort: 40 },
    ],
  };

  // Type-safe access per evitare errore TS
  type DemoKey = keyof typeof demo;
  const key = event as DemoKey;
  return NextResponse.json({ timeline: demo[key] ?? [] });
}
