export const runtime = "nodejs";
import { BRAND_NAME } from "@/config/brand";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: BRAND_NAME,
    time: new Date().toISOString(),
    region: process.env.VERCEL_REGION ?? "local",
  });
}
