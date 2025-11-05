"use client";

import { formatDate } from "@/lib/locale";
import { useTranslations } from "next-intl";

export default function TerminiServizioPage() {
  const t = useTranslations("policies");
  return (
    <section className="pt-6 max-w-4xl mx-auto">
      <h1 className="font-serif text-4xl mb-8 text-center">{t("terms.title")}</h1>

      <div className="prose prose-lg max-w-none bg-white/70 rounded-2xl p-8 shadow-sm">
        <p className="text-sm text-gray-500 mb-6">
          <strong>{t("lastUpdated")}</strong> {formatDate(new Date())}
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("terms.s1.title")}</h2>
        <p>{t.rich("terms.s1.p1", { strong: (c) => <strong>{c}</strong> })}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("terms.s2.title")}</h2>
        <p>{t("terms.s2.p1")}</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>{t("terms.s2.items.i1")}</li>
          <li>{t("terms.s2.items.i2")}</li>
          <li>{t("terms.s2.items.i3")}</li>
          <li>{t("terms.s2.items.i4")}</li>
          <li>{t("terms.s2.items.i5")}</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("terms.s3.title")}</h2>
        <h3 className="text-xl font-semibold mt-4 mb-2">{t("terms.s3.req.title")}</h3>
        <p>{t("terms.s3.req.p1")}</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>{t("terms.s3.req.i1")}</li>
          <li>{t("terms.s3.req.i2")}</li>
          <li>{t("terms.s3.req.i3")}</li>
          <li>{t("terms.s3.req.i4")}</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2">{t("terms.s3.resp.title")}</h3>
        <p>{t("terms.s3.resp.p1")}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("terms.s4.title")}</h2>
        <h3 className="text-xl font-semibold mt-4 mb-2">{t("terms.s4.allowed.title")}</h3>
        <p>{t("terms.s4.allowed.p1")}</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>{t("terms.s4.allowed.i1")}</li>
          <li>{t("terms.s4.allowed.i2")}</li>
          <li>{t("terms.s4.allowed.i3")}</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2">{t("terms.s4.forbidden.title")}</h3>
        <p>{t("terms.s4.forbidden.p1")}</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>{t("terms.s4.forbidden.i1")}</li>
          <li>{t("terms.s4.forbidden.i2")}</li>
          <li>{t("terms.s4.forbidden.i3")}</li>
          <li>{t("terms.s4.forbidden.i4")}</li>
          <li>{t("terms.s4.forbidden.i5")}</li>
          <li>{t("terms.s4.forbidden.i6")}</li>
          <li>{t("terms.s4.forbidden.i7")}</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("terms.s5.title")}</h2>
        <h3 className="text-xl font-semibold mt-4 mb-2">{t("terms.s5.ownership.title")}</h3>
        <p>{t("terms.s5.ownership.p1")}</p>

        <h3 className="text-xl font-semibold mt-4 mb-2">{t("terms.s5.responsibility.title")}</h3>
        <p>{t("terms.s5.responsibility.p1")}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("terms.s6.title")}</h2>
        <p>{t.rich("terms.s6.p1", { strong: (c) => <strong>{c}</strong> })}</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>{t("terms.s6.items.i1")}</li>
          <li>{t("terms.s6.items.i2")}</li>
          <li>{t("terms.s6.items.i3")}</li>
          <li>{t("terms.s6.items.i4")}</li>
        </ul>
        <p className="mt-2">{t("terms.s6.note")}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("terms.s7.title")}</h2>
        <p>{t("terms.s7.p1")}</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>{t("terms.s7.items.i1")}</li>
          <li>{t("terms.s7.items.i2")}</li>
          <li>{t("terms.s7.items.i3")}</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("terms.s8.title")}</h2>
        <p>{t("terms.s8.p1")}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("terms.s9.title")}</h2>
        <p>{t.rich("terms.s9.p1", { quote: (c) => <span>&quot;{c}&quot;</span> })}</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>{t("terms.s9.items.i1")}</li>
          <li>{t("terms.s9.items.i2")}</li>
          <li>{t("terms.s9.items.i3")}</li>
          <li>{t("terms.s9.items.i4")}</li>
        </ul>
        <p className="mt-2">{t.rich("terms.s9.note", { strong: (c) => <strong>{c}</strong> })}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("terms.s10.title")}</h2>
        <p>{t("terms.s10.p1")}</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>{t("terms.s10.items.i1")}</li>
          <li>{t("terms.s10.items.i2")}</li>
          <li>{t("terms.s10.items.i3")}</li>
        </ul>
        <p className="mt-2">{t("terms.s10.note")}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("terms.s11.title")}</h2>
        <h3 className="text-xl font-semibold mt-4 mb-2">{t("terms.s11.you.title")}</h3>
        <p>{t("terms.s11.you.p1")}</p>

        <h3 className="text-xl font-semibold mt-4 mb-2">{t("terms.s11.us.title")}</h3>
        <p>{t("terms.s11.us.p1")}</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>{t("terms.s11.us.i1")}</li>
          <li>{t("terms.s11.us.i2")}</li>
          <li>{t("terms.s11.us.i3")}</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("terms.s12.title")}</h2>
        <p>{t("terms.s12.p1")}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("terms.s13.title")}</h2>
        <h3 className="text-xl font-semibold mt-4 mb-2">{t("terms.s13.severability.title")}</h3>
        <p>{t("terms.s13.severability.p1")}</p>

        <h3 className="text-xl font-semibold mt-4 mb-2">{t("terms.s13.assignment.title")}</h3>
        <p>{t("terms.s13.assignment.p1")}</p>

        <h3 className="text-xl font-semibold mt-4 mb-2">{t("terms.s13.comms.title")}</h3>
        <p>{t("terms.s13.comms.p1")}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("terms.s14.title")}</h2>
        <p className="leading-relaxed">
          {t("terms.s14.p1")}<br />
          {t.rich("terms.s14.email", { strong: (c) => <strong>{c}</strong> })}<br />
          {t.rich("terms.s14.pec", { strong: (c) => <strong>{c}</strong> })}
        </p>

        <div className="mt-12 p-6 bg-[#A3B59D]/10 rounded-lg border-l-4 border-[#A3B59D]">
          <p className="text-sm">
            {t.rich("terms.note", {
              strong: (c) => <strong>{c}</strong>,
              link: (c) => (
                <a href="/privacy-policy" className="text-[#A3B59D] underline ml-1">{c}</a>
              ),
            })}
          </p>
        </div>
      </div>
    </section>
  );
}
