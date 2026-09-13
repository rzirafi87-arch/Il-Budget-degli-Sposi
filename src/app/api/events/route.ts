export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";

export async function GET(req: NextRequest) {
  const locale = req.headers.get("accept-language")?.split(",")[0]?.split("-")[0] || "it";
  const t = await getTranslations({ locale, namespace: "milestone9.runtime.eventTypes" });
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];
  if (!jwt) {
    // Demo fallback: elenco eventi statico
    return NextResponse.json({
      events: [
        { code: "wedding", name: t("wedding.name"), description: t("wedding.description") },
        { code: "birthday", name: t("birthday.name"), description: t("birthday.description") },
        { code: "baptism", name: t("baptism.name"), description: t("baptism.description") },
        { code: "communion", name: t("communion.name"), description: t("communion.description") },
        { code: "confirmation", name: t("confirmation.name"), description: t("confirmation.description") },
        { code: "engagement-party", name: t("engagementParty.name"), description: t("engagementParty.description") },
        { code: "anniversary", name: t("anniversary.name"), description: t("anniversary.description") },
        { code: "baby-shower", name: t("babyShower.name"), description: t("babyShower.description") },
        { code: "genderreveal", name: t("genderReveal.name"), description: t("genderReveal.description") },
        { code: "fifty", name: t("fifty.name"), description: t("fifty.description") }
      ]
    });
  }
  const db = getServiceClient();
  const { error } = await db.auth.getUser(jwt);
  if (error) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { data, error: dbErr } = await db.from("event_types").select("code, name, description");
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ events: data });
}
