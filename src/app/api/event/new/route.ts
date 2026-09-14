import { NextResponse } from "next/server";
import { POST as canonicalCreate } from "../ensure-default/route";
export const POST = canonicalCreate;
export async function GET() {
  return NextResponse.json({ ok: false, code: "METHOD_NOT_ALLOWED", error: "METHOD_NOT_ALLOWED" }, {
    status: 405, headers: { Allow: "POST" },
  });
}
