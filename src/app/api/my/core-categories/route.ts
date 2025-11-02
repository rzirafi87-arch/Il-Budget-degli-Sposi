export const runtime = "nodejs";
import { CORE_CATEGORIES, CORE_TO_EXISTING_CATEGORY_LABELS } from "@/constants/coreCategories";
import { NextRequest, NextResponse } from "next/server";

// Returns the global core categories (stable slugs) and a transitional
// mapping to existing dashboard category labels. Demo-friendly: no auth required.
export async function GET(req: NextRequest) {
  try {
    // For future: read ?country=IT&rite=catholic to attach localized presets
    const url = new URL(req.url);
    const country = (url.searchParams.get("country") || "").toUpperCase();
    const rite = url.searchParams.get("rite") || "";

    return NextResponse.json({
      ok: true,
      country,
      rite,
      categories: CORE_CATEGORIES,
      grouping: CORE_TO_EXISTING_CATEGORY_LABELS,
      // placeholder for future: traditions and localized subcategories
      localized: {
        traditions: [],
      },
    });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
