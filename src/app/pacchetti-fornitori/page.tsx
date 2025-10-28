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
        {/* ...existing code... */}
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
          {/* FAQPage JSON-LD */}
          <script type="application/ld+json" dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Come funziona la visibilità Demo?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Solo i fornitori con piano Premium Plus appaiono nei risultati quando gli utenti navigano senza essere registrati. Questo garantisce massima esposizione anche a chi sta solo esplorando la piattaforma."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Posso cambiare piano in qualsiasi momento?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Sì! Puoi fare upgrade o downgrade in qualsiasi momento. Se passi a un piano superiore, la differenza viene calcolata proporzionalmente. Se passi a un piano inferiore, il credito residuo viene applicato al periodo successivo."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Quali metodi di pagamento accettate?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Accettiamo carte di credito/debito (Visa, Mastercard, American Express), PayPal e bonifico bancario per i piani annuali. Tutti i pagamenti sono sicuri e gestiti tramite provider certificati."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Cosa include il badge 'Fornitore Certificato'?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Il badge viene assegnato dopo una verifica manuale dei tuoi dati. Include controllo della partita IVA, referenze e portfolio. Aumenta la fiducia degli utenti e migliora il tuo posizionamento nei risultati."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Perché i vostri prezzi sono più bassi di Matrimonio.com?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Siamo una piattaforma innovativa e vogliamo supportare i fornitori con tariffe trasparenti e sostenibili. Offriamo lo stesso livello di visibilità a prezzi più competitivi, reinvestendo nel miglioramento continuo della piattaforma."
                  }
                }
              ]
            })
          }} />
        </div>
        {/* ...existing code... */}
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
