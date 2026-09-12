"use client";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { useLocale } from "@/providers/LocaleProvider";
import { buildLocalizedPath } from "@/lib/localizedPath";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function OnboardingPage() {
  const { locale } = useLocale();
  const t = useTranslations("milestone9.onboarding");
  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-2">{t("welcome")}</h1>
      <p className="mb-4">{t("description")}</p>
      <LocaleSwitcher />
      <div className="mt-6">
        <Link href={buildLocalizedPath(locale, "/wizard")} className="btn bg-sage-600 text-white px-4 py-2 rounded-xl">{t("configure")}</Link>
      </div>
    </main>
  );
}
