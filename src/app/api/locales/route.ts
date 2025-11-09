export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];
  if (!jwt) {
    // Demo fallback: elenco lingue statico
    return NextResponse.json({
      locales: [
        { code: "it", name: "Italian", native_name: "Italiano", rtl: false },
        { code: "en", name: "English", native_name: "English", rtl: false },
        { code: "fr", name: "French", native_name: "Français", rtl: false },
        { code: "de", name: "German", native_name: "Deutsch", rtl: false },
        { code: "es", name: "Spanish", native_name: "Español", rtl: false },
        { code: "pt", name: "Portuguese", native_name: "Português", rtl: false },
        { code: "ar", name: "Arabic", native_name: "العربية", rtl: true },
        { code: "ru", name: "Russian", native_name: "Русский", rtl: false },
        { code: "zh", name: "Chinese", native_name: "中文", rtl: false },
        { code: "ja", name: "Japanese", native_name: "日本語", rtl: false }
      ]
    });
  }
  const db = getServiceClient();
  const { error } = await db.auth.getUser(jwt);
  if (error) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { data, error: dbErr } = await db.from("languages").select("code, name, native_name, rtl");
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ locales: data });
}
