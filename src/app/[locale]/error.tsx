"use client";
import { useTranslations } from "next-intl";

export default function LocaleError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("milestone9.errorPage");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      <p className="max-w-lg text-muted-fg">{t("description")}</p>
      <button className="rounded-xl bg-primary px-5 py-3 font-semibold text-white" onClick={reset}>
        {t("retry")}
      </button>
    </main>
  );
}
