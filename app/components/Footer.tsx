"use client";

import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementare salvataggio newsletter in Supabase
    console.log("Newsletter subscription:", email);
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer className="bg-gradient-to-br from-[#A3B59D] to-[#8a9d84] text-white mt-16">
      {/* Newsletter Section */}
      <div className="border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold mb-2">💌 Rimani aggiornato</h3>
              <p className="text-sm sm:text-base text-white/90">
                Ricevi consigli, checklist e offerte esclusive per il tuo matrimonio perfetto!
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="La tua email..."
                className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white text-sm sm:text-base"
                required
              />
              <button
                type="submit"
                className="bg-white text-[#A3B59D] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base whitespace-nowrap"
              >
                Iscriviti
              </button>
            </form>
            {subscribed && (
              <p className="text-sm text-white/90 md:col-span-2 text-center">
                ✅ Grazie per esserti iscritto! Controlla la tua email.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Colonna 1: About */}
          <div>
            <h4 className="font-serif text-lg sm:text-xl font-bold mb-3 sm:mb-4">💍 Il Budget degli Sposi</h4>
            <p className="text-white/80 text-xs sm:text-sm mb-4">
              La piattaforma italiana per pianificare il budget del tuo matrimonio. 
              Semplice, completa e gratuita.
            </p>
            <div className="flex gap-3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
                 className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <span className="text-xl">📷</span>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                 className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <span className="text-xl">👥</span>
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer"
                 className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <span className="text-xl">📌</span>
              </a>
            </div>
          </div>

          {/* Colonna 2: Strumenti */}
          <div>
            <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">🛠️ Strumenti</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-white/80">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard Budget</Link></li>
              <li><Link href="/spese" className="hover:text-white transition-colors">Gestione Spese</Link></li>
              <li><Link href="/entrate" className="hover:text-white transition-colors">Entrate e Regali</Link></li>
              <li><Link href="/invitati" className="hover:text-white transition-colors">Lista Invitati</Link></li>
              <li><Link href="/save-the-date" className="hover:text-white transition-colors">Save the Date</Link></li>
            </ul>
          </div>

          {/* Colonna 3: Fornitori */}
          <div>
            <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">📋 Trova Fornitori</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-white/80">
              <li><Link href="/location" className="hover:text-white transition-colors">Location & Ville</Link></li>
              <li><Link href="/chiese" className="hover:text-white transition-colors">Chiese</Link></li>
              <li><Link href="/fornitori" className="hover:text-white transition-colors">Tutti i Fornitori</Link></li>
              <li><Link href="/musica-cerimonia" className="hover:text-white transition-colors">Musica Cerimonia</Link></li>
              <li><Link href="/musica-ricevimento" className="hover:text-white transition-colors">Musica Ricevimento</Link></li>
              <li><Link href="/wedding-planner" className="hover:text-white transition-colors">Wedding Planner</Link></li>
            </ul>
          </div>

          {/* Colonna 4: Info & Supporto */}
          <div>
            <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">ℹ️ Info & Supporto</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-white/80">
              <li><Link href="/chi-siamo" className="hover:text-white transition-colors">Chi Siamo</Link></li>
              <li><Link href="/come-funziona" className="hover:text-white transition-colors">Come Funziona</Link></li>
              <li><Link href="/contatti" className="hover:text-white transition-colors">Contatti</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/termini-servizio" className="hover:text-white transition-colors">Termini di Servizio</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/20">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-4 sm:mb-6 text-xs sm:text-sm text-white/70">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔒</span>
              <span>Pagamenti Sicuri</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🇮🇹</span>
              <span>Made in Italy</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">✅</span>
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">💯</span>
              <span>100% Gratuito</span>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center text-xs sm:text-sm text-white/70">
            <p>© {new Date().getFullYear()} Il Budget degli Sposi. Tutti i diritti riservati.</p>
            <p className="mt-1 text-xs">Made with ❤️ for Italian couples</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
