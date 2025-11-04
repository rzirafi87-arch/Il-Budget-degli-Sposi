"use client";

import { formatDate } from "@/lib/locale";
import { useTranslations } from "next-intl";

export default function PrivacyPolicyPage() {
  const t = useTranslations("policies");
  return (
    <section className="pt-6 max-w-4xl mx-auto">
      <h1 className="font-serif text-4xl mb-8 text-center">{t("privacy.title")}</h1>

      <div className="prose prose-lg max-w-none bg-white/70 rounded-2xl p-8 shadow-sm">
        <p className="text-sm text-gray-500 mb-6">
          <strong>{t("lastUpdated")}</strong> {formatDate(new Date())}
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("privacy.s1.title")}</h2>
        <p>{t("privacy.s1.p1")}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("privacy.s2.title")}</h2>
        <p className="leading-relaxed">
          {t("privacy.s2.lead")}<br />
          <strong>MYBUDGETEVENTO</strong><br />
          <strong>{t("privacy.s2.emailLabel")}</strong> privacy@ilbudgetdeglisposi.it<br />
          <strong>{t("privacy.s2.pecLabel")}</strong> ilbudgetdeglisposi@pec.it
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("privacy.s3.title")}</h2>
        <p>{t("privacy.s3.p1")}</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>{t("privacy.s3.items.reg.title")}</strong> {t("privacy.s3.items.reg.desc")}</li>
          <li><strong>{t("privacy.s3.items.event.title")}</strong> {t("privacy.s3.items.event.desc")}</li>
          <li><strong>{t("privacy.s3.items.nav.title")}</strong> {t("privacy.s3.items.nav.desc")}</li>
          <li><strong>{t("privacy.s3.items.guests.title")}</strong> {t("privacy.s3.items.guests.desc")}</li>
          <li><strong>{t("privacy.s3.items.pay.title")}</strong> {t("privacy.s3.items.pay.desc")}</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("privacy.s4.title")}</h2>
        <p>{t("privacy.s4.p1")}</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>{t("privacy.s4.items.i1")}</li>
          <li>{t("privacy.s4.items.i2")}</li>
          <li>{t("privacy.s4.items.i3")}</li>
          <li>{t("privacy.s4.items.i4")}</li>
          <li>{t("privacy.s4.items.i5")}</li>
          <li>{t("privacy.s4.items.i6")}</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("privacy.s5.title")}</h2>
        <p>{t("privacy.s5.p1")}</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>{t("privacy.s5.items.contract.title")}</strong> {t("privacy.s5.items.contract.desc")}</li>
          <li><strong>{t("privacy.s5.items.consent.title")}</strong> {t("privacy.s5.items.consent.desc")}</li>
          <li><strong>{t("privacy.s5.items.interest.title")}</strong> {t("privacy.s5.items.interest.desc")}</li>
          <li><strong>{t("privacy.s5.items.legal.title")}</strong> {t("privacy.s5.items.legal.desc")}</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("privacy.s6.title")}</h2>
        <p>{t("privacy.s6.p1")}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("privacy.s7.title")}</h2>
        <p>{t("privacy.s7.p1")}</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>{t("privacy.s7.items.providers.title")}</strong> {t("privacy.s7.items.providers.desc")}</li>
          <li><strong>{t("privacy.s7.items.partners.title")}</strong> {t("privacy.s7.items.partners.desc")}</li>
          <li><strong>{t("privacy.s7.items.authorities.title")}</strong> {t("privacy.s7.items.authorities.desc")}</li>
        </ul>
        <p className="mt-2">{t.rich("privacy.s7.note", { strong: (c) => <strong>{c}</strong> })}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("privacy.s8.title")}</h2>
        <p>{t("privacy.s8.p1")}</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>{t("privacy.s8.items.access.title")}</strong> {t("privacy.s8.items.access.desc")}</li>
          <li><strong>{t("privacy.s8.items.rect.title")}</strong> {t("privacy.s8.items.rect.desc")}</li>
          <li><strong>{t("privacy.s8.items.erase.title")}</strong> {t("privacy.s8.items.erase.desc")}</li>
          <li><strong>{t("privacy.s8.items.limit.title")}</strong> {t("privacy.s8.items.limit.desc")}</li>
          <li><strong>{t("privacy.s8.items.port.title")}</strong> {t("privacy.s8.items.port.desc")}</li>
          <li><strong>{t("privacy.s8.items.object.title")}</strong> {t("privacy.s8.items.object.desc")}</li>
          <li><strong>{t("privacy.s8.items.withdraw.title")}</strong> {t("privacy.s8.items.withdraw.desc")}</li>
        </ul>
        <p className="mt-4">{t.rich("privacy.s8.contact", { strong: (c) => <strong>{c}</strong> })}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("privacy.s9.title")}</h2>
        <p>{t("privacy.s9.p1")}</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>{t("privacy.s9.items.i1")}</li>
          <li>{t("privacy.s9.items.i2")}</li>
          <li>{t("privacy.s9.items.i3")}</li>
          <li>{t("privacy.s9.items.i4")}</li>
          <li>{t("privacy.s9.items.i5")}</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("privacy.s10.title")}</h2>
        <p>
          {t.rich("privacy.s10.p1", {
            link: (chunks) => (
              <a href="/cookie-policy" className="text-[#A3B59D] underline">{chunks}</a>
            ),
          })}
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("privacy.s11.title")}</h2>
        <p>{t("privacy.s11.p1")}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("privacy.s12.title")}</h2>
        <p>{t("privacy.s12.p1")}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("privacy.s13.title")}</h2>
        <p>{t("privacy.s13.p1")}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("privacy.s14.title")}</h2>
        <p className="leading-relaxed">
          {t("privacy.s14.p1")}<br />
          <strong>{t("privacy.s14.authName")}</strong><br />
          {t("privacy.s14.addr")}<br />
          {t("privacy.s14.email")}<br />
          {t("privacy.s14.phone")}
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("privacy.s15.title")}</h2>
        <p className="leading-relaxed">
          {t("privacy.s15.p1")}<br />
          {t.rich("privacy.s15.email", { strong: (c) => <strong>{c}</strong> })}<br />
          {t("privacy.s15.sla")}
        </p>
      </div>
    </section>
  );
}
