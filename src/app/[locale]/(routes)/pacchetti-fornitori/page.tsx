/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { flags } from "@/config/flags";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/locale";

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
  const paymentsEnabled = flags.payments_stripe;
  const searchParams = useSearchParams();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  useEffect(() => {
    loadPackages();

    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      alert("Pagamento completato con successo! Il tuo abbonamento è ora attivo.");
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
    const amount = billingPeriod === "monthly" ? pkg.price_monthly : pkg.price_yearly;
    return formatCurrency(amount, "EUR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
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
        return "POPOLARE";
      case "premium_plus":
        return "BEST VALUE";
      default:
        return null;
    }
  }

  async function handlePurchase(pkg: Package) {
    if (!paymentsEnabled) {
      alert("I pagamenti online sono temporaneamente disabilitati. Riprova più tardi o contattaci per acquistare il piano.");
      return;
    }
    if (pkg.tier === "free") {
      alert("Il piano gratuito è sempre disponibile!");
      return;
    }

    setProcessingPayment(pkg.tier);

    try {
      // Verifica autenticazione
      const { data: sessionData } = await getBrowserClient().auth.getSession();
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
        {/* Toggle fatturazione */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={`px-4 py-2 rounded-full border ${billingPeriod === "monthly" ? "bg-[#A3B59D] text-white" : "bg-white"}`}
          >
            Mensile
          </button>
          <button
            onClick={() => setBillingPeriod("yearly")}
            className={`px-4 py-2 rounded-full border ${billingPeriod === "yearly" ? "bg-[#A3B59D] text-white" : "bg-white"}`}
          >
            Annuale
          </button>
        </div>

        {loading ? (
          <div className="text-center">Caricamento...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.sort((a, b) => a.display_order - b.display_order).map((pkg) => (
              <div key={pkg.id} className={`p-6 rounded-xl border ${getTierColor(pkg.tier)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-serif font-bold">{pkg.name_it}</h3>
                  {getTierBadge(pkg.tier) && (
                    <span className="text-xs px-2 py-1 rounded-full border bg-white">{getTierBadge(pkg.tier)}</span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-4">{pkg.description_it}</p>
                <div className="text-3xl font-bold mb-4">{getPrice(pkg)}</div>
                <ul className="text-sm text-gray-700 space-y-1 mb-4">
                  {pkg.features?.map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
                <button
                  disabled={!paymentsEnabled || processingPayment === pkg.tier}
                  onClick={() => handlePurchase(pkg)}
                  className="w-full px-4 py-2 rounded-lg border bg-white hover:bg-gray-50"
                >
                  {!paymentsEnabled
                    ? "Prossimamente"
                    : processingPayment === pkg.tier
                    ? "Elaborazione..."
                    : "Acquista"}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          {!paymentsEnabled && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              I pagamenti Stripe sono momentaneamente in manutenzione. I piani resteranno visibili ma non acquistabili.
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <Link href="/fornitori">Scopri come funziona</Link>
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
