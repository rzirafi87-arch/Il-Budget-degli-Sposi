import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { defaultLocale, locales, type Locale } from "@/i18n/config";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const event = searchParams.get("event");
  const requestedLocale = searchParams.get("locale");
  const locale = locales.includes(requestedLocale as Locale) ? requestedLocale as Locale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "milestone7.timeline.demo" });

  // Demo: restituisce timeline statica per BABY_SHOWER e PROPOSAL
  if (!event || !["BABY_SHOWER", "PROPOSAL"].includes(event)) {
    return NextResponse.json({ timeline: [] });
  }

  const demo = {
    BABY_SHOWER: [
      { code: "PLAN_6W", title: t("baby.plan.title"), description: t("baby.plan.description"), sort: 10 },
      { code: "BOOK_4W", title: t("baby.book.title"), description: t("baby.book.description"), sort: 20 },
      { code: "INVITES_3W", title: t("baby.invites.title"), description: t("baby.invites.description"), sort: 30 },
      { code: "DECOR_2W", title: t("baby.decor.title"), description: t("baby.decor.description"), sort: 40 },
      { code: "FINAL_WEEK", title: t("baby.final.title"), description: t("baby.final.description"), sort: 50 },
      { code: "DAY_OF", title: t("baby.day.title"), description: t("baby.day.description"), sort: 60 },
    ],
    PROPOSAL: [
      { code: "PLAN", title: t("proposal.plan.title"), description: t("proposal.plan.description"), sort: 10 },
      { code: "BOOK", title: t("proposal.book.title"), description: t("proposal.book.description"), sort: 20 },
      { code: "PREP", title: t("proposal.prepare.title"), description: t("proposal.prepare.description"), sort: 30 },
      { code: "DAY", title: t("proposal.day.title"), description: t("proposal.day.description"), sort: 40 },
    ],
  };

  // Type-safe access per evitare errore TS
  type DemoKey = keyof typeof demo;
  const key = event as DemoKey;
  return NextResponse.json({ timeline: demo[key] ?? [] });
}
