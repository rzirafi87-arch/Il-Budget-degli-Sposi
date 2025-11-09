import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const event = searchParams.get("event");
  const category = searchParams.get("category");
  const locale = searchParams.get("locale") || "it";

  // Demo: restituisce sottocategorie statiche per BABY_SHOWER e PROPOSAL
  if (!event || !category || !["BABY_SHOWER", "PROPOSAL"].includes(event)) {
    return NextResponse.json({ subcategories: [] });
  }

  // Demo hardcoded
  const demo = {
    BABY_SHOWER: {
      VENUE: [
        { code: "ROOM_RENTAL", name: locale === "en" ? "Room / Space rental" : "Affitto sala / spazio" },
        { code: "FURNITURE", name: locale === "en" ? "Furniture & Linens" : "Sedie, tavoli, tovagliato" },
      ],
      FOOD_DRINKS: [
        { code: "BUFFET", name: locale === "en" ? "Buffet / Catering" : "Buffet / Catering" },
        { code: "DESSERT", name: locale === "en" ? "Cake & Dessert table" : "Torta & Dessert table" },
        { code: "DRINKS", name: locale === "en" ? "Drinks (non-alcoholic)" : "Bevande (analcolici)" },
      ],
      DECOR: [
        { code: "BALLOONS", name: locale === "en" ? "Balloons & Backdrop" : "Palloncini & Backdrop" },
        { code: "FLORALS", name: locale === "en" ? "Florals & Centerpieces" : "Fiori & Centrotavola" },
        { code: "THEME_PROPS", name: locale === "en" ? "Theme props / Baby items" : "Props a tema / Nascita" },
      ],
      INVITES: [
        { code: "DESIGN_PRINT", name: locale === "en" ? "Invites (design & print)" : "Inviti (design & stampa)" },
        { code: "DIGITAL_RSVP", name: locale === "en" ? "Digital RSVP / Landing" : "RSVP digitale / Landing" },
      ],
      ENTERTAINMENT: [
        { code: "GAMES", name: locale === "en" ? "Games & Game kits" : "Giochi & Kit gioco" },
        { code: "HOST", name: locale === "en" ? "Host / Entertainer" : "Presentatore / Animatore" },
      ],
      PHOTO_VIDEO: [
        { code: "PHOTOGRAPHER", name: locale === "en" ? "Photographer" : "Fotografo" },
        { code: "PHOTO_CORNER", name: locale === "en" ? "Photo corner / Instant cam" : "Angolo foto / Polaroid" },
      ],
      GIFTS_FAVORS: [
        { code: "FAVORS", name: locale === "en" ? "Favors" : "Bomboniere / Favor" },
        { code: "GIFT_LIST", name: locale === "en" ? "Gift list / Vouchers" : "Lista regali / Buoni" },
      ],
      MISC: [
        { code: "TRANSPORT", name: locale === "en" ? "Transport & Hauling" : "Trasporti & Carico" },
        { code: "CONTINGENCY", name: locale === "en" ? "Contingency fund" : "Fondo imprevisti" },
      ],
    },
    PROPOSAL: {
      LOCATION: [
        { code: "PRIVATE_SETUP", name: locale === "en" ? "Private setup / scenography" : "Allestimento privato / scenografia" },
        { code: "FLOWERS", name: locale === "en" ? "Flowers & Candles" : "Fiori & Candles" },
      ],
      PHOTO_VIDEO: [
        { code: "PHOTOGRAPHER", name: locale === "en" ? "Photographer / Videographer" : "Fotografo / Videomaker" },
      ],
      EXPERIENCE: [
        { code: "MUSICIAN", name: locale === "en" ? "Musician / Violinist" : "Musicista / Violinista" },
        { code: "DINNER", name: locale === "en" ? "Dinner / Champagne" : "Cena / Champagne" },
      ],
      RING: [
        { code: "RING", name: locale === "en" ? "Ring (purchase / insurance)" : "Anello (acquisto / assicurazione)" },
      ],
      MISC: [
        { code: "CONTINGENCY", name: locale === "en" ? "Contingency fund" : "Fondo imprevisti" },
      ],
    },
  };

  // Type-safe access per evitare errore TS
  type DemoEventKey = keyof typeof demo;
  type DemoCategoryKey = keyof (typeof demo)[DemoEventKey];
  const eventKey = event as DemoEventKey;
  const catKey = category as DemoCategoryKey;
  const subcats = demo[eventKey]?.[catKey] ?? [];
  return NextResponse.json({ subcategories: subcats });
}
