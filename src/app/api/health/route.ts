export const runtime = "nodejs";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "Il Budget degli Sposi",
    time: new Date().toISOString(),
    region: process.env.VERCEL_REGION ?? "local",
  });
}
