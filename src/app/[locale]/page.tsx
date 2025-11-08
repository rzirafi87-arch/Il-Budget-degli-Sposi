"use client";
import OnboardingSelector from "@/components/OnboardingSelector";
import { formatCurrency, formatDate } from "@/lib/locale";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";

const supabase = getBrowserClient();

type EventData = {
  weddingDate?: string;
  totalBudget?: number;
  spentAmount?: number;
  hasSuppliers?: boolean;
  hasGuests?: boolean;
};

export default function Home() {
  const t = useTranslations("home");
  const locale = useLocale();
  const localizedAuthPath = `/${locale}/auth`;
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const jwt = sessionData.session?.access_token;

        if (!jwt) {
          setLoading(false);
          setIsLoggedIn(false);
          return;
        }
        
        setIsLoggedIn(true);

        const res = await fetch("/api/event/resolve", {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        const json = await res.json();
        
        if (json.event) {
          setEvent({
            weddingDate: json.event.wedding_date,
            totalBudget: json.event.total_budget || 0,
            spentAmount: json.event.spent_amount || 0,
            hasSuppliers: json.event.has_suppliers || false,
            hasGuests: json.event.has_guests || false,
          });

          if (json.event.wedding_date) {
            const wedding = new Date(json.event.wedding_date);
            const today = new Date();
            const diff = Math.ceil((wedding.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            setDaysLeft(diff > 0 ? diff : 0);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const progress = event?.totalBudget 
    ? Math.min(100, ((event.spentAmount || 0) / event.totalBudget) * 100)
    : 0;

  // Mostra welcome page per utenti non loggati
  if (!loading && !isLoggedIn) {
    return (
      <main className="min-h-screen bg-linear-to-br from-[#FDFBF7] via-[#FAF8F5] to-[#F5F1EB] -mt-20 -mx-6">
        {/* Onboarding Selector */}
        <section className="container mx-auto px-6 pt-28 pb-12">
          <OnboardingSelector />
        </section>

        {/* Hero Section */}
        <section className="container mx-auto px-6 pb-24 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-gray-800 leading-tight">
                {t("hero.title1")}<br />
                <span className="text-[#A6B5A0]">{t("hero.title2Highlighted")}</span><br />
                {t("hero.title3")}<br />
                {t("hero.title4")}
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto">
                {t("hero.subtitle")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link
                href={localizedAuthPath}
                className="w-full sm:w-auto bg-[#A6B5A0] text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-[#8a9d84] transition-all shadow-xl hover:shadow-2xl hover:scale-105 transform"
              >
                {t("hero.ctaPrimary")}
              </Link>
              <button
                onClick={() => {
                  // Scroll to demo section
                  document.getElementById("demo-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full sm:w-auto bg-white text-[#A6B5A0] border-2 border-[#A6B5A0] px-10 py-5 rounded-full font-bold text-lg hover:bg-[#A6B5A0] hover:text-white transition-all shadow-lg hover:shadow-xl"
              >
                {t("hero.ctaSecondary")}
              </button>
            </div>

            <p className="text-sm text-gray-500 pt-4">{t("hero.footnote")}</p>
          </div>
        </section>

        {/* USP Cards */}
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-center text-gray-800 mb-12">{t("usp.title")}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <USPCard
                icon="🧭"
                title={t("usp.cards.clarity.title")}
                description={t("usp.cards.clarity.description")}
              />
              <USPCard
                icon="📊"
                title={t("usp.cards.control.title")}
                description={t("usp.cards.control.description")}
              />
              <USPCard
                icon="✨"
                title={t("usp.cards.inspiration.title")}
                description={t("usp.cards.inspiration.description")}
              />
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo-section" className="bg-white/60 backdrop-blur-sm py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-serif font-bold text-center text-gray-800 mb-4">{t("demo.title")}</h2>
              <p className="text-center text-gray-600 mb-12">{t("demo.subtitle")}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DemoFeature
                  icon="💰"
                  title={t("demo.features.budget.title")}
                  description={t("demo.features.budget.description")}
                  href={t("demo.features.budget.href")}
                />
                <DemoFeature
                  icon="📅"
                  title={t("demo.features.timeline.title")}
                  description={t("demo.features.timeline.description")}
                  href={t("demo.features.timeline.href")}
                />
                <DemoFeature
                  icon="👥"
                  title={t("demo.features.guests.title")}
                  description={t("demo.features.guests.description")}
                  href={t("demo.features.guests.href")}
                />
                <DemoFeature
                  icon="🏢"
                  title={t("demo.features.suppliers.title")}
                  description={t("demo.features.suppliers.description")}
                  href={t("demo.features.suppliers.href")}
                />
                <DemoFeature
                  icon="❤️"
                  title={t("demo.features.favorites.title")}
                  description={t("demo.features.favorites.description")}
                  href={t("demo.features.favorites.href")}
                />
                <DemoFeature
                  icon="🎁"
                  title={t("demo.features.gifts.title")}
                  description={t("demo.features.gifts.description")}
                  href={t("demo.features.gifts.href")}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-3xl mx-auto bg-linear-to-br from-[#EAD9D4]/40 to-[#E8E0D6]/40 rounded-3xl p-12 text-center border-2 border-[#E8E0D6] shadow-xl">
            <div className="text-5xl mb-6">🔒</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">{t("privacy.title")}</h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              {t("privacy.text")}
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-4xl font-serif font-bold text-gray-800">{t("finalCta.title")}</h2>
            <p className="text-xl text-gray-600">{t("finalCta.subtitle")}</p>
            <Link
              href="/auth"
              className="inline-block bg-[#A6B5A0] text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-[#8a9d84] transition-all shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              {t("finalCta.button")}
            </Link>
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-3xl mx-auto text-center bg-white rounded-2xl shadow-2xl border-2 border-[#A3B59D]/20 p-12">
            <div className="mb-6">
              <span className="inline-block text-6xl mb-4">🚀</span>
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                Prossimamente
              </h2>
              <div className="w-24 h-1 bg-[#A3B59D] mx-auto mb-6 rounded-full"></div>
            </div>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Stiamo lavorando a nuove funzionalità incredibili per rendere
              l&apos;organizzazione del tuo evento ancora più semplice e completa!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start gap-3 p-4 bg-[#A3B59D]/5 rounded-lg">
                <span className="text-2xl">📱</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">App Mobile</h3>
                  <p className="text-sm text-gray-600">
                    Gestisci il tuo evento ovunque ti trovi
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-[#A3B59D]/5 rounded-lg">
                <span className="text-2xl">🤖</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">AI Assistant</h3>
                  <p className="text-sm text-gray-600">
                    Suggerimenti intelligenti personalizzati
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-[#A3B59D]/5 rounded-lg">
                <span className="text-2xl">🎨</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Design Tools</h3>
                  <p className="text-sm text-gray-600">
                    Crea partecipazioni e decorazioni uniche
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-[#A3B59D]/5 rounded-lg">
                <span className="text-2xl">🌍</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Multi-lingua</h3>
                  <p className="text-sm text-gray-600">
                    Supporto per oltre 20 lingue
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-200">
              <p className="text-gray-600 mb-4">
                Vuoi essere il primo a provare le nuove funzionalità?
              </p>
              <Link
                href="/auth"
                className="inline-block bg-[#A3B59D] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#8a9d84] transition-all shadow-lg hover:shadow-xl hover:scale-105 transform"
              >
                Iscriviti alla Beta
              </Link>
            </div>
          </div>
        </section>

        {/* Pulsante Menù Principale fluttuante */}
        <Link
          href="/dashboard"
          aria-label={t("floatingMenu")}
          className="fixed bottom-28 right-24 sm:bottom-24 sm:right-6 md:bottom-20 md:right-5 z-58 rounded-full shadow-lg text-white px-5 py-3 font-semibold"
          style={{ background: "var(--color-sage)" }}
        >
          {t("floatingMenu")}
        </Link>
      </main>
    );
  }

  // Dashboard per utenti loggati
  return (
    <main className="space-y-8">
      {/* Hero section with countdown */}
  <section className="text-center py-12 px-6 rounded-3xl bg-linear-to-br from-[#FDFBF7] to-[#F5F1EB] border-2 border-[#E8E0D6] shadow-lg">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-gray-800 mb-4" style={{ whiteSpace: "pre-line" }}>
            {t("dashboard.title")}
          </h1>
          
          {loading ? (
            <p className="text-gray-500">{t("dashboard.loading")}</p>
          ) : event && daysLeft !== null ? (
            <>
              <div className="bg-white rounded-2xl p-8 shadow-md border-2 border-[#A6B5A0]">
                <div className="text-6xl font-bold text-[#A6B5A0] mb-2">{daysLeft}</div>
                <div className="text-xl text-gray-700">
                  {daysLeft === 0 ? t("dashboard.countdown.today") : daysLeft === 1 ? t("dashboard.countdown.day") : t("dashboard.countdown.days")}
                </div>
              </div>
              <p className="text-sm text-gray-600 italic">
                {event.weddingDate && formatDate(new Date(event.weddingDate), {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </p>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-gray-600">
                {t("dashboard.fallback.lead")}<br />
                <span className="text-sm">{t("dashboard.fallback.sub")}</span>
              </p>
              <Link
                href="/auth"
                className="inline-block bg-[#A6B5A0] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#8a9d84] transition-all shadow-lg hover:shadow-xl"
              >
                {t("dashboard.fallback.cta")}
              </Link>
              <p className="text-xs text-gray-500 mt-2">{t("dashboard.fallback.note")}</p>
            </div>
          )}
        </div>
      </section>

      {/* Progress budget (solo se loggato) */}
      {event && (
        <section className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{t("dashboard.budget.title")}</h2>
            <Link href="/dashboard" className="text-[#A6B5A0] hover:underline font-semibold">
              {t("dashboard.budget.seeDetails")}
            </Link>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t("dashboard.budget.planned")}: <strong>{formatCurrency(event.totalBudget || 0)}</strong></span>
              <span>{t("dashboard.budget.spent")}: <strong>{formatCurrency(event.spentAmount || 0)}</strong></span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
              <div
                className="bg-linear-to-r from-[#A6B5A0] to-[#8a9d84] h-full rounded-full transition-all duration-500 flex items-center justify-center text-white text-xs font-bold"
                style={{ width: `${progress}%` }}
              >
                {progress > 10 && `${Math.round(progress)}%`}
              </div>
            </div>
            
            <p className="text-sm text-gray-500 italic text-center">
              {progress < 30 
                ? t("dashboard.budget.progress.low")
                : progress < 70
                ? t("dashboard.budget.progress.mid")
                : progress < 100
                ? t("dashboard.budget.progress.high")
                : t("dashboard.budget.progress.full")}
            </p>
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickActionCard
          href="/timeline"
          icon="📅"
          title={t("dashboard.quick.timeline.title")}
          description={t("dashboard.quick.timeline.desc")}
          accent="bg-[#A6B5A0]"
        />
        <QuickActionCard
          href="/dashboard"
          icon="💰"
          title={t("dashboard.quick.budget.title")}
          description={t("dashboard.quick.budget.desc")}
          accent="bg-[#E8E0D6]"
        />
        <QuickActionCard
          href="/invitati"
          icon="👥"
          title={t("dashboard.quick.guests.title")}
          description={t("dashboard.quick.guests.desc")}
          accent="bg-[#EAD9D4]"
        />
        <QuickActionCard
          href="/fornitori"
          icon="🏢"
          title={t("dashboard.quick.suppliers.title")}
          description={t("dashboard.quick.suppliers.desc")}
          accent="bg-[#A6B5A0]"
        />
        <QuickActionCard
          href="/preferiti"
          icon="❤️"
          title={t("dashboard.quick.favorites.title")}
          description={t("dashboard.quick.favorites.desc")}
          accent="bg-[#EAD9D4]"
        />
        <QuickActionCard
          href="/documenti"
          icon="📄"
          title={t("dashboard.quick.docs.title")}
          description={t("dashboard.quick.docs.desc")}
          accent="bg-[#E8E0D6]"
        />
      </section>

      {/* Prossimi passi */}
  <section className="bg-linear-to-br from-[#EAD9D4]/30 to-[#E8E0D6]/30 rounded-2xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{t("dashboard.nextSteps.title")}</h3>
        <div className="space-y-3">
          <TodoItem text={t("dashboard.nextSteps.defBudget")} done={!!event?.totalBudget} />
          <TodoItem text={t("dashboard.nextSteps.chooseVenue")} done={!!event?.hasSuppliers} />
          <TodoItem text={t("dashboard.nextSteps.bookPhoto")} done={!!(event?.spentAmount && event.spentAmount > 0)} />
          <TodoItem text={t("dashboard.nextSteps.guestList")} done={!!event?.hasGuests} />
        </div>
        <p className="text-xs text-gray-500 mt-4 italic text-center">{t("dashboard.nextSteps.hint")}</p>
      </section>
      {/* Pulsante Menù Principale fluttuante (sempre visibile) */}
      <Link
        href="/dashboard"
        aria-label={t("floatingMenu")}
        className="fixed bottom-28 right-24 sm:bottom-24 sm:right-6 md:bottom-20 md:right-5 z-58 rounded-full shadow-lg text-white px-5 py-3 font-semibold"
        style={{ background: "var(--color-sage)" }}
      >
        {t("floatingMenu")}
      </Link>
      </main>
  );
}

function QuickActionCard({ href, icon, title, description, accent }: {
  href: string;
  icon: string;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="block p-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 bg-white hover:shadow-lg transition-all group"
    >
      <div className={`w-12 h-12 rounded-full ${accent} bg-opacity-20 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="font-bold text-lg text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  );
}

function TodoItem({ text, done }: { text: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
        done ? "bg-[#A6B5A0] border-[#A6B5A0]" : "border-gray-300"
      }`}>
        {done && <span className="text-white text-sm">✓</span>}
      </div>
      <span className={`flex-1 ${done ? "line-through text-gray-400" : "text-gray-700"}`}>
        {text}
      </span>
    </div>
  );
}

function USPCard({ icon, title, description }: {
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

function DemoFeature({ icon, title, description, href }: {
  icon: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex gap-4 p-5 bg-white rounded-xl border-2 border-gray-200 hover:border-[#A6B5A0] hover:shadow-lg transition-all group"
    >
  <div className="text-3xl shrink-0 group-hover:scale-110 transition-transform">{icon}</div>
      <div>
        <h4 className="font-bold text-gray-800 mb-1 group-hover:text-[#A6B5A0] transition-colors">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </Link>
  );
}





