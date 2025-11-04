"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import React, { useState } from "react";

export default function Footer() {
  const t = useTranslations("footer");
  const safe = (key: string, fallback: string) => {
    try {
      return t(key);
    } catch {
      return fallback;
    }
  };
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const loveByLocale: Record<string, string> = {
    it: "Fatto con ❤️ per le coppie italiane",
    en: "Made with ❤️ for Italian couples",
    es: "Hecho con ❤️ para parejas italianas",
    fr: "Fait avec ❤️ pour les couples italiens",
    de: "Mit ❤️ für italienische Paare",
    ru: "Сделано с ❤️ для итальянских пар",
    zh: "用 ❤️ 为意大利情侣打造",
    ja: "イタリアのカップルのために❤️を込めて",
    ar: "صُنع بحب ❤️ للأزواج الإيطاليين",
  };
  const currentLang = typeof document !== "undefined" ? document.documentElement.lang : "it";
  const madeWithLove = loveByLocale[currentLang] || t("madeWithLove", { default: "Made with ❤️ for Italian couples" });

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer className="bg-linear-to-br from-[#A3B59D] to-[#8a9d84] text-white mt-16" role="contentinfo">
      {/* Newsletter */}
      <div className="border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold mb-2">
                {t("newsletterTitle", { default: "Rimani aggiornato" })}
              </h3>
              <p className="text-sm sm:text-base text-white/90">
                {t("newsletterDesc", { default: "Ricevi consigli, checklist e offerte esclusive per il tuo matrimonio perfetto!" })}
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2" aria-label={t("newsletterFormLabel", { default: "Iscrizione newsletter" })}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder", { default: "La tua email..." })}
                aria-label={t("emailAriaLabel", { default: "Inserisci la tua email" })}
                className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white text-sm sm:text-base"
                required
              />
              <button type="submit" className="bg-white text-[#A3B59D] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base whitespace-nowrap">
                {t("subscribeBtn", { default: "Iscriviti" })}
              </button>
            </form>
            {subscribed && (
              <p className="text-sm text-white/90 md:col-span-2 text-center" role="status" aria-live="polite">
                {t("thankYouMsg", { default: "Grazie per esserti iscritto! Controlla la tua email." })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Column 1: About */}
          <div>
            <h4 className="font-serif text-lg sm:text-xl font-bold mb-3 sm:mb-4">
              {t("aboutTitle", { default: "MYBUDGETEVENTO" })}
            </h4>
            <p className="text-white/80 text-xs sm:text-sm mb-4">
              {t("aboutDesc", { default: "La piattaforma italiana per pianificare il budget del tuo matrimonio. Semplice, completa e gratuita." })}
            </p>
            <div className="flex gap-3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors" aria-label="Instagram">
                <span className="text-xl" aria-hidden="true">IG</span>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors" aria-label="Facebook">
                <span className="text-xl" aria-hidden="true">F</span>
              </a>
            </div>
          </div>

          {/* Column 2: Tools */}
          <div>
            <h4 className="font-serif text-lg sm:text-xl font-bold mb-3 sm:mb-4">{t("toolsTitle", { default: "Strumenti" })}</h4>
            <ul className="space-y-2 text-sm text-white/90">
              <li><Link href="/spese" className="hover:text-white transition-colors">{t("expenses", { default: "Gestione Spese" })}</Link></li>
              <li><Link href="/entrate" className="hover:text-white transition-colors">{t("incomes", { default: "Entrate e Regali" })}</Link></li>
              <li><Link href="/invitati" className="hover:text-white transition-colors">{t("guestsList", { default: "Lista Invitati" })}</Link></li>
            </ul>
          </div>

          {/* Column 3: Suppliers */}
          <div>
            <h4 className="font-serif text-lg sm:text-xl font-bold mb-3 sm:mb-4">{t("suppliersTitle", { default: "Trova Fornitori" })}</h4>
            <ul className="space-y-2 text-sm text-white/90">
              <li><Link href="/location" className="hover:text-white transition-colors">{t("locations", { default: "Location & Ville" })}</Link></li>
              <li><Link href="/chiese" className="hover:text-white transition-colors">{t("churches", { default: "Chiese" })}</Link></li>
              <li><Link href="/fornitori" className="hover:text-white transition-colors">{t("allSuppliers", { default: "Tutti i Fornitori" })}</Link></li>
            </ul>
          </div>

          {/* Column 4: Info & Legal */}
          <div>
            <h4 className="font-serif text-lg sm:text-xl font-bold mb-3 sm:mb-4">{t("infoTitle", { default: "Info & Supporto" })}</h4>
            <ul className="space-y-2 text-sm text-white/90 mb-4">
              <li><Link href="/chi-siamo" className="hover:text-white transition-colors">{t("aboutUs", { default: "Chi Siamo" })}</Link></li>
              <li><Link href="/come-funziona" className="hover:text-white transition-colors">{t("howItWorks", { default: "Come Funziona" })}</Link></li>
              <li><Link href="/contatti" className="hover:text-white transition-colors">{t("contacts", { default: "Contatti" })}</Link></li>
            </ul>
            <h4 className="font-serif text-lg sm:text-xl font-bold mb-3 sm:mb-2">{safe("legalTitle", "Legale")}</h4>
            <ul className="space-y-2 text-sm text-white/90">
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">{t("privacyPolicy", { default: "Privacy Policy" })}</Link></li>
              <li><Link href="/termini-servizio" className="hover:text-white transition-colors">{t("termsOfService", { default: "Termini di Servizio" })}</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-white transition-colors">{t("cookiePolicy", { default: "Cookie Policy" })}</Link></li>
            </ul>
          </div>
        </div>

        {/* Trust badges + copyright */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/20">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-4 sm:mb-6 text-xs sm:text-sm text-white/80">
            <span>{t("securePayments", { default: "Pagamenti Sicuri" })}</span>
            <span>{t("madeInItaly", { default: "Made in Italy" })}</span>
            <span>{t("gdprCompliant", { default: "GDPR Compliant" })}</span>
            <span>{t("free100", { default: "100% Gratuito" })}</span>
          </div>
          <div className="text-center text-xs sm:text-sm text-white/70">
            <p>© {new Date().getFullYear()} MYBUDGETEVENTO. {t("copyright", { default: "Tutti i diritti riservati." })}</p>
            <p className="mt-1 text-xs">{madeWithLove}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
