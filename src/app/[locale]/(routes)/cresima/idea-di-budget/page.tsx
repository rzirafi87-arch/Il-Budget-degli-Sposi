import React from "react";
import CresimaNav from "@/components/cresima/CresimaNav";
import { getTranslations } from "next-intl/server";

export const metadata = { title: "Cresima - Idea di budget" };

export default async function CresimaIdeaDiBudgetPage() {
  const t = await getTranslations("confirmationIdea");
  return (
    <main>
      <CresimaNav />
      <section className="rounded-xl border border-neutral-200 bg-white/70 p-5">
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <p className="text-neutral-600 mt-2">
          {t("description")}
        </p>
        <ul className="list-disc ml-5 mt-3 text-neutral-700">
          <li>{t("categories.venue")}</li>
          <li>{t("categories.clothing")}</li>
          <li>{t("categories.photo")}</li>
          <li>{t("categories.favors")}</li>
          <li>{t("categories.invitations")}</li>
        </ul>
        <div className="mt-4 text-sm text-neutral-600">
          {t("tip")}
        </div>
      </section>
    </main>
  );
}
