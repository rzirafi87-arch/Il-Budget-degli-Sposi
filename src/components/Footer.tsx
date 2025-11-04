"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import React, { useState } from "react";

export default function Footer() {
  const t = useTranslations("footer");
  const safe = (key: string, fallback: string) => {
    try {
      return t(key as any);
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
    <footer className="bg-gradient-to-br from-[#A3B59D] to-[#8a9d84] text-white mt-16" role="contentinfo">
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
              <a href="https://wa.me/393001234567" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors" aria-label="WhatsApp">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors" aria-label="Instagram">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors" aria-label="Facebook">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
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
