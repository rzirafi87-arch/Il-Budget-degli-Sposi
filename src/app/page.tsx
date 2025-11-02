"use client";
import { formatCurrency, formatDate } from "@/lib/locale";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const supabase = getBrowserClient();

type EventData = {
  weddingDate?: string;
  totalBudget?: number;
  spentAmount?: number;
};

export default function Home() {
  const router = useRouter();
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
            spentAmount: 0, // TODO: calcolare dal database
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

  useEffect(() => {
    try { const lang = localStorage.getItem("language"); const country = localStorage.getItem("country"); const eventType = localStorage.getItem("eventType"); if (!lang) router.replace("/select-language"); else if (!country) router.replace("/select-country"); else if (!eventType) router.replace("/select-event-type"); } catch { router.replace("/select-language"); }
  }, [router]);

  const progress = event?.totalBudget 
    ? Math.min(100, ((event.spentAmount || 0) / event.totalBudget) * 100)
    : 0;

  // Mostra welcome page per utenti non loggati
  if (!loading && !isLoggedIn) {
    return (
      <main className="min-h-screen bg-linear-to-br from-[#FDFBF7] via-[#FAF8F5] to-[#F5F1EB] -mt-20 -mx-6">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-32 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-gray-800 leading-tight">
                Organizza il tuo<br />
                <span className="text-[#A6B5A0]">matrimonio</span><br />
                in modo semplice<br />
                e senza stress 💍
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto">
                L&apos;unica app che unisce <strong>budget, fornitori e serenità</strong><br />
                — senza pubblicità né caos.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link
                href="/auth"
                className="w-full sm:w-auto bg-[#A6B5A0] text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-[#8a9d84] transition-all shadow-xl hover:shadow-2xl hover:scale-105 transform"
              >
                🎉 Inizia ora — È gratis
              </Link>
              <button
                onClick={() => {
                  // Scroll to demo section
                  document.getElementById("demo-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full sm:w-auto bg-white text-[#A6B5A0] border-2 border-[#A6B5A0] px-10 py-5 rounded-full font-bold text-lg hover:bg-[#A6B5A0] hover:text-white transition-all shadow-lg hover:shadow-xl"
              >
                👀 Guarda la demo
              </button>
            </div>

            <p className="text-sm text-gray-500 pt-4">
              ✨ Non serve carta di credito • Crea il tuo evento in 2 minuti
            </p>
          </div>
        </section>

        {/* USP Cards */}
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-center text-gray-800 mb-12">
              Tutto quello di cui hai bisogno
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <USPCard
                icon="🧭"
                title="Chiarezza"
                description="Ogni spesa è visibile. Ogni passo è guidato. Zero confusione, solo organizzazione."
              />
              <USPCard
                icon="📊"
                title="Controllo"
                description="Budget, fornitori, invitati, timeline — tutto sotto controllo in un unico posto."
              />
              <USPCard
                icon="✨"
                title="Ispirazione"
                description="Design curato, interfaccia serena e suggerimenti utili per rendere tutto più bello."
              />
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo-section" className="bg-white/60 backdrop-blur-sm py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-serif font-bold text-center text-gray-800 mb-4">
                Esplora le funzionalità 💕
              </h2>
              <p className="text-center text-gray-600 mb-12">
                Navigazione libera senza registrazione — aggiungi dati e sperimenta!
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DemoFeature
                  icon="💰"
                  title="Budget intelligente"
                  description="Traccia spese previste e effettive, dividi tra sposa/sposo/comune"
                  href="/dashboard"
                />
                <DemoFeature
                  icon="📅"
                  title="Timeline automatica"
                  description="To-do cronologiche da 12 mesi prima fino al grande giorno"
                  href="/timeline"
                />
                <DemoFeature
                  icon="👥"
                  title="Gestione invitati"
                  description="Lista completa, RSVP, assegnazione tavoli e conteggi"
                  href="/invitati"
                />
                <DemoFeature
                  icon="🏢"
                  title="Directory fornitori"
                  description="Trova location, fotografi, fioristi nella tua zona"
                  href="/fornitori"
                />
                <DemoFeature
                  icon="❤️"
                  title="Preferiti e documenti"
                  description="Salva fornitori e organizza preventivi"
                  href="/preferiti"
                />
                <DemoFeature
                  icon="🎁"
                  title="Lista nozze"
                  description="Gestisci i regali che desiderate ricevere"
                  href="/entrate"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-3xl mx-auto bg-linear-to-br from-[#EAD9D4]/40 to-[#E8E0D6]/40 rounded-3xl p-12 text-center border-2 border-[#E8E0D6] shadow-xl">
            <div className="text-5xl mb-6">🔒</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Privacy e serenità garantite
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              <strong>Zero pubblicità.</strong> Zero email spam.<br />
              I tuoi dati restano tuoi. Nessuna vendita a terzi.<br />
              Solo tu e il tuo matrimonio, senza distrazioni.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-4xl font-serif font-bold text-gray-800">
              Pronto a iniziare? 🎊
            </h2>
            <p className="text-xl text-gray-600">
              Unisciti alle coppie che hanno organizzato il loro matrimonio con serenità.
            </p>
            <Link
              href="/auth"
              className="inline-block bg-[#A6B5A0] text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-[#8a9d84] transition-all shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              Crea il tuo evento ora
            </Link>
          </div>
        </section>

        {/* Pulsante Menù Principale fluttuante */}
        <Link
          href="/dashboard"
          aria-label="Vai al Menù Principale"
          className="fixed bottom-28 right-24 sm:bottom-24 sm:right-6 md:bottom-20 md:right-5 z-58 rounded-full shadow-lg text-white px-5 py-3 font-semibold"
          style={{ background: "var(--color-sage)" }}
        >
          🏠 Menù Principale
        </Link>
      </main>
    );
  }

  // Dashboard per utenti loggati
  return (
    <main className="space-y-8">
      {/* Hero section con countdown */}
  <section className="text-center py-12 px-6 rounded-3xl bg-linear-to-br from-[#FDFBF7] to-[#F5F1EB] border-2 border-[#E8E0D6] shadow-lg">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
            Il vostro grande giorno<br />inizia qui
          </h1>
          
          {loading ? (
            <p className="text-gray-500">Caricamento...</p>
          ) : event && daysLeft !== null ? (
            <>
              <div className="bg-white rounded-2xl p-8 shadow-md border-2 border-[#A6B5A0]">
                <div className="text-6xl font-bold text-[#A6B5A0] mb-2">{daysLeft}</div>
                <div className="text-xl text-gray-700">
                  {daysLeft === 0 ? "È oggi! 🎉" : daysLeft === 1 ? "giorno al matrimonio" : "giorni al matrimonio"}
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
                Organizza il tuo matrimonio in modo semplice e sereno.<br />
                <span className="text-sm">Gestisci budget, fornitori, invitati e molto altro.</span>
              </p>
              <Link
                href="/auth"
                className="inline-block bg-[#A6B5A0] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#8a9d84] transition-all shadow-lg hover:shadow-xl"
              >
                Inizia ora — È gratis
              </Link>
              <p className="text-xs text-gray-500 mt-2">
                Non serve carta di credito. Crea il tuo evento in 2 minuti.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Progress budget (solo se loggato) */}
      {event && (
        <section className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">💰 Budget</h2>
            <Link href="/dashboard" className="text-[#A6B5A0] hover:underline font-semibold">
              Vedi dettagli
            </Link>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Previsto: <strong>{formatCurrency(event.totalBudget || 0)}</strong></span>
              <span>Speso: <strong>{formatCurrency(event.spentAmount || 0)}</strong></span>
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
                ? "Ottimo inizio! Continua così 🌟"
                : progress < 70
                ? "Stai andando alla grande! 💪"
                : progress < 100
                ? "Quasi tutto definito, bravissimi! 🎉"
                : "Budget raggiunto! 🎊"}
            </p>
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickActionCard
          href="/timeline"
          icon="📅"
          title="Timeline"
          description="To-do cronologiche"
          accent="bg-[#A6B5A0]"
        />
        <QuickActionCard
          href="/dashboard"
          icon="💰"
          title="Budget"
          description="Gestisci tutte le spese"
          accent="bg-[#E8E0D6]"
        />
        <QuickActionCard
          href="/invitati"
          icon="👥"
          title="Invitati"
          description="Lista e RSVP"
          accent="bg-[#EAD9D4]"
        />
        <QuickActionCard
          href="/fornitori"
          icon="🏢"
          title="Fornitori"
          description="Trova i migliori servizi"
          accent="bg-[#A6B5A0]"
        />
        <QuickActionCard
          href="/preferiti"
          icon="❤️"
          title="Preferiti"
          description="I tuoi salvati"
          accent="bg-[#EAD9D4]"
        />
        <QuickActionCard
          href="/documenti"
          icon="📄"
          title="Documenti"
          description="Preventivi e contratti"
          accent="bg-[#E8E0D6]"
        />
      </section>

      {/* Prossimi passi */}
  <section className="bg-linear-to-br from-[#EAD9D4]/30 to-[#E8E0D6]/30 rounded-2xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📝 Prossimi Passi Consigliati</h3>
        <div className="space-y-3">
          <TodoItem text="Definisci il budget totale" done={!!event?.totalBudget} />
          <TodoItem text="Scegli la location del ricevimento" done={false} />
          <TodoItem text="Prenota il fotografo" done={false} />
          <TodoItem text="Inizia la lista invitati" done={false} />
        </div>
        <p className="text-xs text-gray-500 mt-4 italic text-center">
          💡 Segui questi passi per una pianificazione serena e senza stress
        </p>
      </section>
      {/* Pulsante Menù Principale fluttuante (sempre visibile) */}
      <Link
        href="/dashboard"
        aria-label="Vai al Menù Principale"
        className="fixed bottom-28 right-24 sm:bottom-24 sm:right-6 md:bottom-20 md:right-5 z-58 rounded-full shadow-lg text-white px-5 py-3 font-semibold"
        style={{ background: "var(--color-sage)" }}
      >
        🏠 Menù Principale
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





