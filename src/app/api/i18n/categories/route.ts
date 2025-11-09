import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const event = searchParams.get("event");
  const locale = searchParams.get("locale") || "it";

  // Demo: restituisce categorie statiche per BABY_SHOWER e PROPOSAL
  if (!event || !["BABY_SHOWER", "PROPOSAL"].includes(event)) {
    return NextResponse.json({ categories: [] });
  }

  // In produzione: query su Supabase
  // Qui demo hardcoded
  const demo = {
    BABY_SHOWER: [
      { code: "VENUE", name: locale === "en" ? "Venue & Space" : "Location & Spazio" },
      { code: "FOOD_DRINKS", name: locale === "en" ? "Food & Drinks" : "Cibo & Bevande" },
      { code: "DECOR", name: locale === "en" ? "Decor & Styling" : "Allestimenti & Decorazioni" },
      { code: "INVITES", name: locale === "en" ? "Invites & Stationery" : "Inviti & Grafica" },
      { code: "ENTERTAINMENT", name: locale === "en" ? "Entertainment & Games" : "Animazione & Giochi" },
      { code: "PHOTO_VIDEO", name: locale === "en" ? "Photo & Video" : "Foto & Video" },
      { code: "GIFTS_FAVORS", name: locale === "en" ? "Gifts & Favors" : "Regali & Bomboniere" },
      { code: "MISC", name: locale === "en" ? "Misc & Extras" : "Extra & Varie" },
    ],
    PROPOSAL: [
      { code: "LOCATION", name: locale === "en" ? "Location & Setup" : "Location & Setup" },
      { code: "PHOTO_VIDEO", name: locale === "en" ? "Photo & Video" : "Foto & Video" },
      { code: "EXPERIENCE", name: locale === "en" ? "Experience & Music" : "Esperienza & Musica" },
      { code: "RING", name: locale === "en" ? "Ring & Jewelry" : "Anello & Gioielli" },
      { code: "MISC", name: locale === "en" ? "Misc & Extras" : "Extra & Varie" },
    ],
  };

  // Type-safe access per evitare errore TS
  type DemoKey = keyof typeof demo;
  const key = event as DemoKey;
  return NextResponse.json({ categories: demo[key] ?? [] });
}
