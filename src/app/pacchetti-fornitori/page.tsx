"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useSearchParams } from "next/navigation";

type Package = {
  id: string;
  tier: string;
  name_it: string;
  description_it: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  display_order: number;
};

function PacchettiContent() {
  const searchParams = useSearchParams();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  useEffect(() => {
    loadPackages();
    
    // Mostra messaggio successo/errore pagamento
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      alert("✓ Pagamento completato con successo! Il tuo abbonamento è ora attivo.");
    } else if (paymentStatus === "cancelled") {
      alert("Pagamento annullato. Puoi riprovare quando vuoi.");
    }
  }, [searchParams]);

  async function loadPackages() {
    try {
      setLoading(true);
      const res = await fetch("/api/subscription-packages");
      const data = await res.json();
      setPackages(data.packages || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function getPrice(pkg: Package) {
    return billingPeriod === "monthly" ? pkg.price_monthly : pkg.price_yearly;
  }

  function getSavings(pkg: Package) {
    if (billingPeriod === "monthly") return null;
    const yearlyTotal = pkg.price_monthly * 12;
    const savings = yearlyTotal - pkg.price_yearly;
    const percentage = Math.round((savings / yearlyTotal) * 100);
    return { amount: savings, percentage };
  }

  function getTierColor(tier: string) {
    switch (tier) {
      case "free":
        return "border-gray-300 bg-gray-50";
      case "base":
        return "border-blue-300 bg-blue-50";
      case "premium":
        return "border-[#A3B59D] bg-green-50";
      case "premium_plus":
        return "border-amber-400 bg-amber-50";
      default:
        return "border-gray-300 bg-white";
    }
  }

  function getTierBadge(tier: string) {
    switch (tier) {
      case "premium":
        return "🌟 POPOLARE";
      case "premium_plus":
        return "👑 BEST VALUE";
      default:
        return null;
    }
  }

  async function handlePurchase(pkg: Package) {
    if (pkg.tier === "free") {
      alert("Il piano gratuito è sempre disponibile!");
      return;
    }

    setProcessingPayment(pkg.tier);

    try {
      // Verifica autenticazione
      const { data: sessionData } = await supabase.auth.getSession();
      const jwt = sessionData.session?.access_token;

      if (!jwt) {
        alert("Devi effettuare il login per acquistare un abbonamento.");
        window.location.href = "/auth";
        return;
      }

      // Ottieni profilo fornitore
      const headers: HeadersInit = { Authorization: `Bearer ${jwt}` };
      const resProfile = await fetch("/api/my/supplier-profile", { headers });
      const dataProfile = await resProfile.json();

      if (!dataProfile.profile) {
        alert("Devi prima creare un profilo fornitore. Vai a /fornitori e proponi la tua attività.");
        return;
      }

      // Crea sessione Stripe Checkout
      const resCheckout = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          tier: pkg.tier,
          billing_period: billingPeriod,
          supplier_id: dataProfile.profile.id,
        }),
      });

      const dataCheckout = await resCheckout.json();

      if (!resCheckout.ok) {
        throw new Error(dataCheckout.error || "Errore creazione checkout");
      }

      // Reindirizza a Stripe Checkout
      if (dataCheckout.url) {
        window.location.href = dataCheckout.url;
      } else {
        throw new Error("URL checkout non disponibile");
      }
    } catch (e: any) {
      console.error("Purchase error:", e);
      alert(`Errore: ${e.message}`);
      setProcessingPayment(null);
    }
  }

  return (
    <section className="pt-6 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl mb-3">Pacchetti per Fornitori</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Scegli il piano perfetto per far crescere la tua attività nel settore wedding.
            Prezzi competitivi e visibilità garantita su Il Budget degli Sposi.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              billingPeriod === "monthly"
                ? "bg-[#A3B59D] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Mensile
          </button>
          <button
            onClick={() => setBillingPeriod("yearly")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              billingPeriod === "yearly"
                ? "bg-[#A3B59D] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Annuale
            <span className="ml-2 text-xs bg-amber-400 text-amber-900 px-2 py-1 rounded">
              RISPARMIA FINO AL 17%
            </span>
          </button>
        </div>

        {/* Packages Grid */}
        {loading ? (
          <div className="text-center text-gray-500 py-12">Caricamento pacchetti...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg) => {
              const price = getPrice(pkg);
              const savings = getSavings(pkg);
              const badge = getTierBadge(pkg.tier);

              return (
                <div
                  key={pkg.id}
                  className={`relative rounded-2xl border-2 p-6 shadow-lg hover:shadow-xl transition-all ${getTierColor(
                    pkg.tier
                  )}`}
                >
                  {/* Badge */}
                  {badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1 rounded-full">
                      {badge}
                    </div>
                  )}

                  {/* Header */}
                  <div className="text-center mb-6">
                    <h3 className="font-serif text-2xl mb-2">{pkg.name_it}</h3>
                    <p className="text-sm text-gray-600 mb-4">{pkg.description_it}</p>
                    
                    {/* Price */}
                    <div className="mb-2">
                      <span className="text-4xl font-bold">
                        {price === 0 ? "Gratis" : `€${price.toFixed(2)}`}
                      </span>
                      {price > 0 && (
                        <span className="text-gray-600 text-sm">
                          /{billingPeriod === "monthly" ? "mese" : "anno"}
                        </span>
                      )}
                    </div>

                    {/* Savings */}
                    {savings && savings.amount > 0 && (
                      <div className="text-xs text-green-600 font-semibold">
                        Risparmi €{savings.amount.toFixed(2)} ({savings.percentage}%)
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    className={`w-full py-3 rounded-lg font-semibold transition-all ${
                      pkg.tier === "free"
                        ? "bg-gray-300 text-gray-700 hover:bg-gray-400"
                        : pkg.tier === "premium_plus"
                        ? "bg-amber-500 text-white hover:bg-amber-600"
                        : "bg-[#A3B59D] text-white hover:bg-[#8a9d84]"
                    } ${processingPayment === pkg.tier ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={processingPayment === pkg.tier}
                    onClick={() => handlePurchase(pkg)}
                  >
                    {processingPayment === pkg.tier 
                      ? "Reindirizzamento..." 
                      : pkg.tier === "free" 
                      ? "Piano Attivo" 
                      : "Acquista Ora"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl text-center mb-8">Domande Frequenti</h2>
          
          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-gray-200 bg-white/70">
              <h3 className="font-semibold mb-2">Come funziona la visibilità Demo?</h3>
              <p className="text-sm text-gray-600">
                Solo i fornitori con piano <strong>Premium Plus</strong> appaiono nei risultati quando gli utenti 
                navigano senza essere registrati. Questo garantisce massima esposizione anche a chi sta solo esplorando la piattaforma.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 bg-white/70">
              <h3 className="font-semibold mb-2">Posso cambiare piano in qualsiasi momento?</h3>
              <p className="text-sm text-gray-600">
                Sì! Puoi fare upgrade o downgrade in qualsiasi momento. Se passi a un piano superiore, 
                la differenza viene calcolata proporzionalmente. Se passi a un piano inferiore, il credito 
                residuo viene applicato al periodo successivo.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 bg-white/70">
              <h3 className="font-semibold mb-2">Quali metodi di pagamento accettate?</h3>
              <p className="text-sm text-gray-600">
                Accettiamo carte di credito/debito (Visa, Mastercard, American Express), PayPal e bonifico bancario 
                per i piani annuali. Tutti i pagamenti sono sicuri e gestiti tramite provider certificati.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 bg-white/70">
              <h3 className="font-semibold mb-2">Cosa include il badge "Fornitore Certificato"?</h3>
              <p className="text-sm text-gray-600">
                Il badge viene assegnato dopo una verifica manuale dei tuoi dati. Include controllo della partita IVA, 
                referenze e portfolio. Aumenta la fiducia degli utenti e migliora il tuo posizionamento nei risultati.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 bg-white/70">
              <h3 className="font-semibold mb-2">Perché i vostri prezzi sono più bassi di Matrimonio.com?</h3>
              <p className="text-sm text-gray-600">
                Siamo una piattaforma innovativa e vogliamo supportare i fornitori con tariffe trasparenti e sostenibili. 
                Offriamo lo stesso livello di visibilità a prezzi più competitivi, reinvestendo nel miglioramento continuo 
                della piattaforma.
              </p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center p-8 rounded-2xl bg-gradient-to-r from-[#A3B59D]/20 to-amber-100/20 border border-[#A3B59D]/30">
          <h3 className="font-serif text-2xl mb-3">Hai bisogno di aiuto?</h3>
          <p className="text-gray-600 mb-4">
            Il nostro team è qui per supportarti nella scelta del piano migliore per la tua attività.
          </p>
          <Link
            href="/contatti"
            className="inline-block px-8 py-3 bg-[#A3B59D] text-white rounded-lg hover:bg-[#8a9d84] transition-colors font-semibold"
          >
            Contattaci
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function PacchettiFornitoriPage() {
  return (
    <Suspense fallback={<div className="pt-6 text-center">Caricamento...</div>}>
      <PacchettiContent />
    </Suspense>
  );
}
