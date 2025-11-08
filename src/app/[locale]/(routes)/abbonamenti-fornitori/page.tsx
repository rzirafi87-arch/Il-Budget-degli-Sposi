"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";

type SubscriptionPackage = {
  id: string;
  tier: string;
  name_it: string;
  description_it: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  display_order: number;
  is_active: boolean;
};

export default function SubscriptionPricingPage() {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");

  useEffect(() => {
    fetchPackages();
  }, []);

  async function fetchPackages() {
    try {
      const res = await fetch("/api/subscription-packages");
      const data = await res.json();
      
      if (data.packages) {
        setPackages(data.packages);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  }

  const getMonthlyEquivalent = (yearly: number) => {
    return (yearly / 12).toFixed(2);
  };

  const getSavingsPercentage = (monthly: number, yearly: number) => {
    if (monthly === 0) return 0;
    const savings = ((monthly * 12 - yearly) / (monthly * 12)) * 100;
    return Math.round(savings);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EAD9D4]/20 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#A3B59D] border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAD9D4]/20 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">
            Piani di Abbonamento per Fornitori
          </h1>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
            Scegli il piano più adatto per far crescere la tua visibilità e raggiungere migliaia di coppie in cerca di servizi per il loro matrimonio
          </p>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={clsx(
            "text-lg font-medium",
            billingPeriod === "monthly" ? "text-gray-900" : "text-gray-500"
          )}>
            Mensile
          </span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
            className="relative w-14 h-7 bg-gray-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#A3B59D] focus:ring-offset-2"
            style={{
              backgroundColor: billingPeriod === "yearly" ? "#A3B59D" : "#E5E7EB"
            }}
          >
            <span
              className={clsx(
                "absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform",
                billingPeriod === "yearly" ? "translate-x-8" : "translate-x-1"
              )}
            />
          </button>
          <span className={clsx(
            "text-lg font-medium",
            billingPeriod === "yearly" ? "text-gray-900" : "text-gray-500"
          )}>
            Annuale
            <span className="ml-2 text-sm text-green-600 font-semibold">
              (Risparmia fino al 17%)
            </span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {packages.map((pkg) => {
            const isPopular = pkg.tier === "premium";
            const isBest = pkg.tier === "premium_plus";
            const price = billingPeriod === "monthly" ? pkg.price_monthly : pkg.price_yearly;
            const savings = getSavingsPercentage(pkg.price_monthly, pkg.price_yearly);

            return (
              <div
                key={pkg.id}
                className={clsx(
                  "relative rounded-2xl border-2 bg-white shadow-lg transition-all hover:shadow-xl",
                  isBest ? "border-[#A3B59D] ring-4 ring-[#A3B59D]/20" :
                  isPopular ? "border-[#EAD9D4]" : "border-gray-200"
                )}
              >
                {/* Badge */}
                {(isPopular || isBest) && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className={clsx(
                      "px-4 py-1 rounded-full text-sm font-semibold text-white",
                      isBest ? "bg-[#A3B59D]" : "bg-[#EAD9D4] text-gray-700"
                    )}>
                      {isBest ? "🌟 PIÙ SCELTO" : "💼 POPOLARE"}
                    </span>
                  </div>
                )}

                <div className="p-6">
                  {/* Tier Name */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {pkg.name_it}
                  </h3>
                  <p className="text-sm text-gray-600 mb-6 min-h-[40px]">
                    {pkg.description_it}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-gray-900">
                        €{price.toFixed(2)}
                      </span>
                      <span className="text-gray-600">
                        /{billingPeriod === "monthly" ? "mese" : "anno"}
                      </span>
                    </div>
                    {billingPeriod === "yearly" && pkg.tier !== "free" && (
                      <p className="text-sm text-gray-500 mt-2">
                        €{getMonthlyEquivalent(pkg.price_yearly)}/mese • Risparmi {savings}%
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    className={clsx(
                      "w-full py-3 px-6 rounded-lg font-semibold transition-all",
                      pkg.tier === "free"
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : isBest
                        ? "bg-[#A3B59D] text-white hover:bg-[#8fa089] shadow-md"
                        : "bg-white border-2 border-[#A3B59D] text-[#A3B59D] hover:bg-[#A3B59D] hover:text-white"
                    )}
                  >
                    {pkg.tier === "free" ? "Inizia Gratis" : "Inizia Ora"}
                  </button>

                  {/* Features */}
                  <ul className="mt-6 space-y-3">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-[#A3B59D] mt-1 flex-shrink-0">
                          {feature.startsWith("NON") ? "❌" : "✓"}
                        </span>
                        <span className="text-sm text-gray-700">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Domande Frequenti
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Posso cambiare piano in qualsiasi momento?
              </h3>
              <p className="text-gray-600">
                Sì, puoi fare upgrade o downgrade del tuo piano in qualsiasi momento. 
                Il cambio sarà effettivo immediatamente e il costo sarà ripartito proporzionalmente.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Cosa succede se cancello il mio abbonamento?
              </h3>
              <p className="text-gray-600">
                Il tuo profilo rimarrà attivo fino alla fine del periodo pagato, 
                dopodiché tornerai automaticamente al piano Gratuito (senza visibilità pubblica).
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Quanto dura la visibilità nella Demo?
              </h3>
              <p className="text-gray-600">
                Solo i fornitori con piano Premium Plus appaiono nella versione demo del sito, 
                garantendo massima esposizione anche agli utenti non registrati.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
