"use client";

import { formatDate } from "@/lib/locale";
import { useTranslations } from "next-intl";

export default function CookiePolicyPage() {
  const t = useTranslations("policies");
  return (
    <section className="pt-6 max-w-4xl mx-auto">
      <h1 className="font-serif text-4xl mb-8 text-center">{t("cookie.title")}</h1>

      <div className="prose prose-lg max-w-none bg-white/70 rounded-2xl p-8 shadow-sm">
        <p className="text-sm text-gray-500 mb-6">
          <strong>{t("lastUpdated")}</strong> {formatDate(new Date())}
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("cookie.s1.title")}</h2>
        <p>{t("cookie.s1.p1")}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("cookie.s2.title")}</h2>
        
        <h3 className="text-xl font-semibold mt-6 mb-3">{t("cookie.s2.tech.title")}</h3>
        <p>{t("cookie.s2.tech.p1")}</p>
        <div className="bg-gray-50 p-4 rounded-lg mt-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">{t("cookie.table.headers.name")}</th>
                <th className="text-left py-2">{t("cookie.table.headers.purpose")}</th>
                <th className="text-left py-2">{t("cookie.table.headers.duration")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2"><code>session_token</code></td>
                <td className="py-2">{t("cookie.table.rows.session_token.purpose")}</td>
                <td className="py-2">{t("cookie.table.rows.session")}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2"><code>auth_token</code></td>
                <td className="py-2">{t("cookie.table.rows.auth_token.purpose")}</td>
                <td className="py-2">{t("cookie.table.rows.30d")}</td>
              </tr>
              <tr>
                <td className="py-2"><code>csrf_token</code></td>
                <td className="py-2">{t("cookie.table.rows.csrf_token.purpose")}</td>
                <td className="py-2">{t("cookie.table.rows.session")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-semibold mt-6 mb-3">{t("cookie.s2.prefs.title")}</h3>
        <p>{t("cookie.s2.prefs.p1")}</p>
        <div className="bg-gray-50 p-4 rounded-lg mt-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">{t("cookie.table.headers.name")}</th>
                <th className="text-left py-2">{t("cookie.table.headers.purpose")}</th>
                <th className="text-left py-2">{t("cookie.table.headers.duration")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2"><code>user_preferences</code></td>
                <td className="py-2">{t("cookie.table.rows.user_preferences.purpose")}</td>
                <td className="py-2">{t("cookie.table.rows.1y")}</td>
              </tr>
              <tr>
                <td className="py-2"><code>cookie_consent</code></td>
                <td className="py-2">{t("cookie.table.rows.cookie_consent.purpose")}</td>
                <td className="py-2">{t("cookie.table.rows.1y")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-semibold mt-6 mb-3">{t("cookie.s2.analytics.title")}</h3>
        <p>{t("cookie.s2.analytics.p1")}</p>
        <div className="bg-yellow-50 p-4 rounded-lg mt-2 border-l-4 border-yellow-400">
          <p className="text-sm">{t("cookie.s2.analytics.note")}</p>
        </div>

        <h3 className="text-xl font-semibold mt-6 mb-3">{t("cookie.s2.marketing.title")}</h3>
        <p>{t("cookie.s2.marketing.p1")}</p>
        <div className="bg-green-50 p-4 rounded-lg mt-2 border-l-4 border-green-400">
          <p className="text-sm">{t("cookie.s2.marketing.status")}</p>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("cookie.s3.title")}</h2>
        <p>{t("cookie.s3.p1")}</p>
        
        <h3 className="text-xl font-semibold mt-4 mb-2">{t("cookie.s3.supabase.title")}</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>{t("cookie.common.purposeLabel")}</strong> {t("cookie.s3.supabase.purpose")}</li>
          <li><strong>{t("cookie.common.privacyLabel")}</strong> <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#A3B59D] underline">supabase.com/privacy</a></li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2">{t("cookie.s3.vercel.title")}</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>{t("cookie.common.purposeLabel")}</strong> {t("cookie.s3.vercel.purpose")}</li>
          <li><strong>{t("cookie.common.privacyLabel")}</strong> <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#A3B59D] underline">vercel.com/legal/privacy-policy</a></li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("cookie.s4.title")}</h2>
        
        <h3 className="text-xl font-semibold mt-4 mb-2">{t("cookie.s4.banner.title")}</h3>
        <p>{t("cookie.s4.banner.p1")}</p>

        <h3 className="text-xl font-semibold mt-4 mb-2">{t("cookie.s4.browser.title")}</h3>
        <p>{t("cookie.s4.browser.p1")}</p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li><strong>Chrome:</strong> {t("cookie.s4.browser.chrome")}</li>
          <li><strong>Firefox:</strong> {t("cookie.s4.browser.firefox")}</li>
          <li><strong>Safari:</strong> {t("cookie.s4.browser.safari")}</li>
          <li><strong>Edge:</strong> {t("cookie.s4.browser.edge")}</li>
        </ul>

        <div className="bg-red-50 p-4 rounded-lg mt-4 border-l-4 border-red-400">
          <p className="text-sm">{t("cookie.s4.warning")}</p>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("cookie.s5.title")}</h2>
        <p>{t("cookie.s5.p1")}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("cookie.s6.title")}</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <ul className="space-y-2 text-sm">
            <li><strong>{t("cookie.s6.items.session.title")}</strong> {t("cookie.s6.items.session.desc")}</li>
            <li><strong>{t("cookie.s6.items.persistent.title")}</strong> {t("cookie.s6.items.persistent.desc")}</li>
            <li><strong>{t("cookie.s6.items.analytics.title")}</strong> {t("cookie.s6.items.analytics.desc")}</li>
          </ul>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("cookie.s7.title")}</h2>
        <p>{t("cookie.s7.p1")}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("cookie.s8.title")}</h2>
        <p>{t("cookie.s8.p1")}</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>{t("cookie.s8.items.i1")}</li>
          <li>{t("cookie.s8.items.i2")}</li>
          <li>{t("cookie.s8.items.i3")}</li>
          <li>{t("cookie.s8.items.i4")}</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("cookie.s9.title")}</h2>
        <p>{t("cookie.s9.p1")}</p>

        <div className="mt-12 p-6 bg-[#A3B59D]/10 rounded-lg">
          <h3 className="font-semibold mb-3">{t("cookie.summary.title")}</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-semibold mb-1">{t("cookie.summary.tech.title")}</div>
              <div className="text-gray-600">{t("cookie.summary.tech.value")}</div>
            </div>
            <div>
              <div className="font-semibold mb-1">{t("cookie.summary.prefs.title")}</div>
              <div className="text-gray-600">{t("cookie.summary.prefs.value")}</div>
            </div>
            <div>
              <div className="font-semibold mb-1">{t("cookie.summary.marketing.title")}</div>
              <div className="text-gray-600">{t("cookie.summary.marketing.value")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
