"use client";

import { formatCurrency, formatDate, formatDateTime } from "@/lib/locale";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import Link from "next/link";
import { useEffect, useState } from "react";

type SupplierProfile = {
  id: string;
  name: string;
  category: string;
  subscription_tier: string;
  subscription_expires_at: string | null;
  is_featured: boolean;
  verified: boolean;
  profile_views: number;
  contact_clicks: number;
  website_clicks: number;
  last_view_at: string | null;
};

type Transaction = {
  id: string;
  tier: string;
  amount: number;
  billing_period: string;
  status: string;
  created_at: string;
  starts_at: string;
  expires_at: string;
};

export default function FornitoriDashboardPage() {
  const [profile, setProfile] = useState<SupplierProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const { data: sessionData } = await getBrowserClient().auth.getSession();
      const jwt = sessionData.session?.access_token;

      if (!jwt) {
        window.location.href = "/auth";
        return;
      }

      // Carica profilo fornitore
      const headers: HeadersInit = { Authorization: `Bearer ${jwt}` };
      const resProfile = await fetch("/api/my/supplier-profile", { headers });
      const dataProfile = await resProfile.json();
      
      if (dataProfile.profile) {
        setProfile(dataProfile.profile);
      }

      // Carica transazioni
      const resTransactions = await fetch("/api/my/subscription-transactions", { headers });
      const dataTransactions = await resTransactions.json();
      
      if (dataTransactions.transactions) {
        setTransactions(dataTransactions.transactions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function isSubscriptionActive() {
    if (!profile) return false;
    if (profile.subscription_tier === "free") return true;
    if (!profile.subscription_expires_at) return false;
    return new Date(profile.subscription_expires_at) > new Date();
  }

  function getDaysRemaining() {
    if (!profile || !profile.subscription_expires_at) return null;
    const now = new Date();
    const expires = new Date(profile.subscription_expires_at);
    const diff = expires.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  }

  function getTierName(tier: string) {
    switch (tier) {
      case "free": return "Gratuito";
      case "base": return "Base";
      case "premium": return "Premium";
      case "premium_plus": return "Premium Plus";
      default: return tier;
    }
  }

  function getTierColor(tier: string) {
    switch (tier) {
      case "free": return "bg-gray-100 text-gray-800";
      case "base": return "bg-blue-100 text-blue-800";
      case "premium": return "bg-green-100 text-green-800";
      case "premium_plus": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  }

  if (loading) {
    return (
      <section className="pt-6">
        <div className="text-center text-gray-500 py-12">Caricamento...</div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="pt-6">
        <div className="max-w-2xl mx-auto text-center p-8 rounded-2xl border border-gray-200 bg-white/70">
          <h2 className="font-serif text-2xl mb-4">Profilo Fornitore Non Trovato</h2>
          <p className="text-gray-600 mb-6">
            Non hai ancora creato un profilo fornitore. Inizia proponendo la tua attività!
          </p>
          <Link
            href="/fornitori"
            className="inline-block px-6 py-3 bg-[#A3B59D] text-white rounded-lg hover:bg-[#8a9d84] transition-colors font-semibold"
          >
            Esplora Categorie
          </Link>
        </div>
      </section>
    );
  }

  const daysRemaining = getDaysRemaining();
  const isActive = isSubscriptionActive();

  return (
    <section className="pt-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-serif text-3xl mb-6">Dashboard Fornitore</h1>

        {/* Profilo */}
        <div className="mb-6 p-6 rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2">{profile.name}</h2>
              <p className="text-gray-600">{profile.category}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-4 py-2 rounded-lg font-semibold ${getTierColor(profile.subscription_tier)}`}>
                {getTierName(profile.subscription_tier)}
              </span>
              {profile.verified && (
                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded">✓ Verificato</span>
              )}
              {profile.is_featured && (
                <span className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded">⭐ In Evidenza</span>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600 mb-1">Stato Abbonamento</p>
              <p className={`font-semibold ${isActive ? "text-green-600" : "text-red-600"}`}>
                {isActive ? "✓ Attivo" : "✗ Scaduto"}
              </p>
            </div>
            {profile.subscription_expires_at && (
              <>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Scadenza</p>
                  <p className="font-semibold">
                    {formatDate(new Date(profile.subscription_expires_at))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Giorni Rimanenti</p>
                  <p className={`font-semibold ${daysRemaining && daysRemaining < 7 ? "text-orange-600" : ""}`}>
                    {daysRemaining !== null ? `${daysRemaining} giorni` : "N/A"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Link
            href="/pacchetti-fornitori"
            className="p-6 rounded-2xl border-2 border-[#A3B59D] bg-white hover:bg-[#A3B59D]/10 transition-all text-center"
          >
            <h3 className="font-semibold text-lg mb-2">
              {profile.subscription_tier === "free" ? "Acquista Piano" : "Cambia Piano"}
            </h3>
            <p className="text-sm text-gray-600">
              {profile.subscription_tier === "free" 
                ? "Scegli un piano per aumentare la tua visibilità"
                : "Effettua upgrade o rinnova il tuo abbonamento"}
            </p>
          </Link>

          <button
            onClick={() => alert("Funzionalità in arrivo: modifica profilo, carica foto, etc.")}
            className="p-6 rounded-2xl border-2 border-gray-300 bg-white hover:bg-gray-50 transition-all text-center"
          >
            <h3 className="font-semibold text-lg mb-2">Gestisci Profilo</h3>
            <p className="text-sm text-gray-600">
              Modifica dati, carica foto e ottimizza la tua scheda
            </p>
          </button>

          <Link
            href={`/fornitori/${profile.id}`}
            className="p-6 rounded-2xl border-2 border-gray-300 bg-white hover:bg-gray-50 transition-all text-center"
          >
            <h3 className="font-semibold text-lg mb-2">Pagina pubblica</h3>
            <p className="text-sm text-gray-600">Visualizza come ti vedono gli sposi</p>
          </Link>
        </div>

        {/* Analytics - Solo per Premium e Premium Plus */}
        {(profile.subscription_tier === "premium" || profile.subscription_tier === "premium_plus") && (
          <div className="mb-6 p-6 rounded-2xl border border-gray-200 bg-linear-to-br from-white to-[#A3B59D]/5">
            <h3 className="font-semibold text-lg mb-4">📊 Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-white border border-gray-200">
                <div className="text-3xl font-bold text-[#A3B59D]">{profile.profile_views || 0}</div>
                <div className="text-sm text-gray-600 mt-1">Visualizzazioni Profilo</div>
              </div>
              <div className="p-4 rounded-lg bg-white border border-gray-200">
                <div className="text-3xl font-bold text-blue-600">{profile.contact_clicks || 0}</div>
                <div className="text-sm text-gray-600 mt-1">Click su Contatti</div>
              </div>
              <div className="p-4 rounded-lg bg-white border border-gray-200">
                <div className="text-3xl font-bold text-purple-600">{profile.website_clicks || 0}</div>
                <div className="text-sm text-gray-600 mt-1">Click su Sito Web</div>
              </div>
            </div>
            {profile.last_view_at && (
              <p className="text-xs text-gray-500 mt-3">
                Ultima visualizzazione: {formatDateTime(new Date(profile.last_view_at))}
              </p>
            )}
          </div>
        )}

        {/* Visibilità Info */}
        <div className="mb-6 p-6 rounded-2xl border border-blue-200 bg-blue-50">
          <h3 className="font-semibold mb-3">📊 La Tua Visibilità</h3>
          <ul className="space-y-2 text-sm">
            {profile.subscription_tier === "free" && (
              <li className="text-gray-600">
                • Profilo creato ma <strong>non visibile</strong> nelle ricerche pubbliche
              </li>
            )}
            {profile.subscription_tier === "base" && isActive && (
              <>
                <li className="text-green-600">✓ Visibile nella pagina <strong>{profile.category}</strong></li>
                <li className="text-gray-600">✗ Non appare nella pagina hub Fornitori</li>
                <li className="text-gray-600">✗ Non appare nella Demo (utenti non registrati)</li>
              </>
            )}
            {profile.subscription_tier === "premium" && isActive && (
              <>
                <li className="text-green-600">✓ Visibile nella pagina <strong>{profile.category}</strong></li>
                <li className="text-green-600">✓ Appare nella pagina hub <strong>Fornitori</strong></li>
                <li className="text-gray-600">✗ Non appare nella Demo (utenti non registrati)</li>
              </>
            )}
            {profile.subscription_tier === "premium_plus" && isActive && (
              <>
                <li className="text-green-600">✓ Visibile nella pagina <strong>{profile.category}</strong></li>
                <li className="text-green-600">✓ Appare nella pagina hub <strong>Fornitori</strong></li>
                <li className="text-amber-600 font-semibold">⭐ Appare nella <strong>Demo</strong> (massima visibilità!)</li>
              </>
            )}
          </ul>
        </div>

        {/* Transazioni */}
        <div className="p-6 rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Storico Abbonamenti</h3>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nessuna transazione registrata</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 rounded-lg border border-gray-200 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className={`inline-block px-3 py-1 rounded text-sm font-semibold mr-2 ${getTierColor(tx.tier)}`}>
                        {getTierName(tx.tier)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {tx.billing_period === "monthly" ? "Mensile" : "Annuale"}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(tx.amount)}</div>
                      <div className={`text-xs ${
                        tx.status === "completed" ? "text-green-600" :
                        tx.status === "pending" ? "text-orange-600" :
                        "text-red-600"
                      }`}>
                        {tx.status === "completed" ? "Completato" :
                         tx.status === "pending" ? "In attesa" :
                         tx.status === "failed" ? "Fallito" : "Rimborsato"}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Dal {formatDate(new Date(tx.starts_at))} al {formatDate(new Date(tx.expires_at))}
                    {" • "}Acquistato il {formatDate(new Date(tx.created_at))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
