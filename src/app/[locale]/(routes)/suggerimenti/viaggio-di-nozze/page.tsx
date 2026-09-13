"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import HoneymoonAdvisor from "@/components/honeymoon/HoneymoonAdvisor";

export default function ViaggioNozzePage() {
  const locale = useLocale();
  const t = useTranslations("milestone9.runtime.honeymoonTips");
  return (
    <section className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-4 flex justify-end">
        <Link href={`/${locale}/dashboard`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50">{t("backDashboard")}</Link>
      </div>
      <HoneymoonAdvisor />
    </section>
  );
}

