"use client";

import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";

const supabase = getBrowserClient();

export default function WelcomePage() {
  const t = useTranslations("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
      setLoading(false);
    })();
  }, []);

  // Reindirizza dopo il render quando l'utente è loggato (evita mutazioni durante il render)
  useEffect(() => {
    if (!loading && isLoggedIn && typeof window !== "undefined") {
      window.location.assign("/");
    }
  }, [loading, isLoggedIn]);

  return (
    <main className="min-h-screen bg-linear-to-br from-[#FDFBF7] via-[#FAF8F5] to-[#F5F1EB]">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Payoff principale */}
          <div className="space-y-4">
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-gray-800 leading-tight">
              {t("hero.title1")}<br />
              <span className="text-[#A6B5A0]">{t("hero.title2Highlighted")}</span><br />
              {t("hero.title3")}<br />
              {t("hero.title4")}
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto" dangerouslySetInnerHTML={{ __html: t("hero.subtitleHtml") }} />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link
              href="/auth"
              className="w-full sm:w-auto bg-[#A6B5A0] text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-[#8a9d84] transition-all shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              {t("hero.ctaPrimary")}
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto bg-white text-[#A6B5A0] border-2 border-[#A6B5A0] px-10 py-5 rounded-full font-bold text-lg hover:bg-[#A6B5A0] hover:text-white transition-all shadow-lg hover:shadow-xl"
            >
              {t("hero.ctaSecondary")}
            </Link>
          </div>

          <p className="text-sm text-gray-500 pt-4">{t("hero.footnote")}</p>
        </div>
      </section>

      {/* USP - Unique Selling Points */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-center text-gray-800 mb-12">{t("usp.title")} 🌿</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Chiarezza */}
            <FeatureCard
              icon="🧭"
              title={t("usp.cards.clarity.title")}
              description={t("usp.cards.clarity.description")}
            />
            
            {/* Controllo */}
            <FeatureCard
              icon="📊"
              title={t("usp.cards.control.title")}
              description={t("usp.cards.control.description")}
            />
            
            {/* Ispirazione */}
            <FeatureCard
              icon="✨"
              title={t("usp.cards.inspiration.title")}
              description={t("usp.cards.inspiration.description")}
            />
          </div>
        </div>
      </section>

      {/* Funzionalità principali */}
      <section className="bg-white/60 backdrop-blur-sm py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-center text-gray-800 mb-12">{t("demo.title")}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FeatureListItem
                icon="💰"
                title={t("demo.features.budget.title")}
                description={t("demo.features.budget.description")}
              />
              <FeatureListItem
                icon="🏢"
                title={t("demo.features.suppliers.title")}
                description={t("demo.features.suppliers.description")}
              />
              <FeatureListItem
                icon="👥"
                title={t("demo.features.guests.title")}
                description={t("demo.features.guests.description")}
              />
              <FeatureListItem
                icon="📅"
                title={t("demo.features.timeline.title")}
                description={t("demo.features.timeline.description")}
              />
              <FeatureListItem
                icon="❤️"
                title={t("demo.features.favorites.title")}
                description={t("demo.features.favorites.description")}
              />
              <FeatureListItem
                icon="🎁"
                title={t("demo.features.gifts.title")}
                description={t("demo.features.gifts.description")}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & No spam */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto bg-linear-to-br from-[#EAD9D4]/40 to-[#E8E0D6]/40 rounded-3xl p-12 text-center border-2 border-[#E8E0D6] shadow-xl">
          <div className="text-5xl mb-6">🔒</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">{t("privacy.title")}</h3>
          <p className="text-gray-700 text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: t("privacy.textHtml") }} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl font-serif font-bold text-gray-800">{t("finalCta.title")}</h2>
          <p className="text-xl text-gray-600">{t("finalCta.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link
              href="/auth"
              className="w-full sm:w-auto bg-[#A6B5A0] text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-[#8a9d84] transition-all shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              {t("finalCta.button")} 💍
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 py-8">
        <div className="container mx-auto px-6 text-center text-sm text-gray-600">
          <p>MYBUDGETEVENTO © 2025 • Made with 💚 in Italia</p>
          <div className="mt-3 space-x-4">
            <Link href="/contatti" className="hover:text-[#A6B5A0] transition-colors">
              Contatti
            </Link>
            <span>•</span>
            <Link href="/" className="hover:text-[#A6B5A0] transition-colors">
              Demo
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-8 border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 transform">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureListItem({ icon, title, description }: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-[#A6B5A0] hover:shadow-md transition-all">
      <div className="text-3xl shrink-0">{icon}</div>
      <div>
        <h4 className="font-bold text-gray-800 mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
