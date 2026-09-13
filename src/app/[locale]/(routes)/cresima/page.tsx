import React from "react";
import CresimaNav from "@/components/cresima/CresimaNav";
import CresimaTraditions from "@/components/cresima/CresimaTraditions";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("milestone9.runtime.confirmation");
  return { title: t("title") };
}

export default async function CresimaPage() {
  const t = await getTranslations("milestone9.runtime.confirmation");
  return (
    <main>
      <CresimaNav />
      <header className="mb-6">
        <h2 className="text-xl font-medium">{t("overview.title")}</h2>
        <p className="text-neutral-600 mt-1">
          {t("overview.description")}
        </p>
      </header>
      <CresimaTraditions />

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 p-5">
          <h2 className="text-xl font-medium">{t("event.title")}</h2>
          <p className="text-neutral-600 mt-2">
            {t("event.description")}
          </p>
          <ul className="list-disc ml-5 mt-3 text-neutral-700">
            <li>{t("event.items.date")}</li>
            <li>{t("event.items.venues")}</li>
            <li>{t("event.items.style")}</li>
          </ul>
        </div>

        <div className="rounded-lg border border-neutral-200 p-5">
          <h2 className="text-xl font-medium">{t("budget.title")}</h2>
          <p className="text-neutral-600 mt-2">
            {t("budget.description")}
          </p>
          <ul className="list-disc ml-5 mt-3 text-neutral-700">
            <li>{t("budget.items.venue")}</li>
            <li>{t("budget.items.clothing")}</li>
            <li>{t("budget.items.photography")}</li>
            <li>{t("budget.items.favors")}</li>
          </ul>
        </div>

        <div className="rounded-lg border border-neutral-200 p-5">
          <h2 className="text-xl font-medium">{t("guests.title")}</h2>
          <p className="text-neutral-600 mt-2">
            {t("guests.description")}
          </p>
          <ul className="list-disc ml-5 mt-3 text-neutral-700">
            <li>{t("guests.items.people")}</li>
            <li>{t("guests.items.rsvp")}</li>
            <li>{t("guests.items.needs")}</li>
          </ul>
        </div>

        <div className="rounded-lg border border-neutral-200 p-5">
          <h2 className="text-xl font-medium">{t("tasks.title")}</h2>
          <p className="text-neutral-600 mt-2">
            {t("tasks.description")}
          </p>
          <ul className="list-disc ml-5 mt-3 text-neutral-700">
            <li>{t("tasks.items.venues")}</li>
            <li>{t("tasks.items.menu")}</li>
            <li>{t("tasks.items.photography")}</li>
            <li>{t("tasks.items.invitations")}</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
