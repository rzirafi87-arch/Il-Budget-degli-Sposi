export const runtime = "nodejs";
import { visibleLanguages } from "@/i18n/languageCapabilities";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    locales: visibleLanguages.map((language) => ({
      code: language.locale,
      name: language.label,
      native_name: language.nativeLabel,
      rtl: language.direction === "rtl",
      status: language.status,
      selectable: language.selectable,
    })),
  });
}
