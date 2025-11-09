export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];
  if (!jwt) {
    // Demo fallback: elenco paesi statico
    return NextResponse.json({
      countries: [
        { code: "IT", name: "Italy", native_name: "Italia", region: "Europe" },
        { code: "FR", name: "France", native_name: "France", region: "Europe" },
        { code: "DE", name: "Germany", native_name: "Deutschland", region: "Europe" },
        { code: "ES", name: "Spain", native_name: "España", region: "Europe" },
        { code: "US", name: "United States", native_name: "United States", region: "Americas" },
        { code: "MX", name: "Mexico", native_name: "México", region: "Americas" },
        { code: "IN", name: "India", native_name: "भारत", region: "Asia" },
        { code: "CN", name: "China", native_name: "中国", region: "Asia" },
        { code: "JP", name: "Japan", native_name: "日本", region: "Asia" },
        { code: "BR", name: "Brazil", native_name: "Brasil", region: "Americas" }
      ]
    });
  }
  const db = getServiceClient();
  const { data: userData, error } = await db.auth.getUser(jwt);
  if (error) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { data, error: dbErr } = await db.from("countries").select("code, name, native_name, region");
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ countries: data });
}
