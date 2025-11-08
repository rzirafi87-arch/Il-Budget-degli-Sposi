"use client";

import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useState } from "react";

export default function ContattiPage() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    messaggio: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Recupera JWT se disponibile
      let jwt: string | undefined;
      try {
        const supabase = getBrowserClient();
        const { data } = await supabase.auth.getSession();
        jwt = data.session?.access_token;
      } catch {
        // ignore auth errors (utente non autenticato)
      }

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
        },
        body: JSON.stringify({
          name: formData.nome,
          email: formData.email,
          message: formData.messaggio,
        }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.ok) {
        throw new Error(payload.error || "Invio non riuscito");
      }
      setSubmitted(true);
      setFormData({ nome: "", email: "", messaggio: "" });
      setTimeout(() => setSubmitted(false), 3500);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2 className="font-serif text-2xl sm:text-3xl mb-4 sm:mb-6 font-bold">📞 Contattaci</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Form Contatto */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-gray-200">
          <h3 className="text-xl font-bold text-[#A3B59D] mb-4">✉️ Inviaci un Messaggio</h3>

          {submitted ? (
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h4 className="text-xl font-bold text-green-700 mb-2">Messaggio Inviato!</h4>
              <p className="text-green-600">Ti risponderemo al più presto.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome e Cognome *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#A3B59D] focus:border-[#A3B59D]"
                  placeholder="Mario Rossi"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#A3B59D] focus:border-[#A3B59D]"
                  placeholder="mario.rossi@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Messaggio *
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.messaggio}
                  onChange={(e) => setFormData({...formData, messaggio: e.target.value})}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#A3B59D] focus:border-[#A3B59D]"
                  placeholder="Scrivi qui il tuo messaggio..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-[#A3B59D] to-[#8a9d84] text-white px-6 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Invio in corso..." : "📤 Invia Messaggio"}
              </button>
            </form>
          )}
        </div>

        {/* Info Contatti */}
  <div className="space-y-6">
          {/* WhatsApp */}
          <div className="bg-linear-to-br from-green-50 to-green-100 rounded-2xl shadow-lg p-6 border-2 border-green-300">
            <div className="text-5xl mb-3">💬</div>
            <h3 className="text-xl font-bold text-green-700 mb-2">WhatsApp</h3>
            <p className="text-gray-700 mb-4">
              Chatta con noi direttamente su WhatsApp per supporto immediato!
            </p>
            <a
              href="https://wa.me/393001234567?text=Ciao!%20Vorrei%20informazioni%20su%20Il%20Budget%20degli%20Sposi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              Apri Chat
            </a>
          </div>

          {/* Email */}
          <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6 border-2 border-blue-300">
            <div className="text-5xl mb-3">📧</div>
            <h3 className="text-xl font-bold text-blue-700 mb-2">Email</h3>
            <p className="text-gray-700 mb-2">
              <strong>Supporto:</strong> support@ilbudgetdeglisposi.it
            </p>
            <p className="text-gray-700">
              <strong>Info:</strong> info@ilbudgetdeglisposi.it
            </p>
          </div>

          {/* Orari */}
          <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg p-6 border-2 border-purple-300">
            <div className="text-5xl mb-3">🕐</div>
            <h3 className="text-xl font-bold text-purple-700 mb-2">Orari di Supporto</h3>
            <p className="text-gray-700">
              <strong>Lun - Ven:</strong> 9:00 - 18:00<br/>
              <strong>Sabato:</strong> 10:00 - 14:00<br/>
              <strong>Domenica:</strong> Chiuso
            </p>
          </div>

          {/* Social */}
          <div className="bg-linear-to-br from-pink-50 to-pink-100 rounded-2xl shadow-lg p-6 border-2 border-pink-300">
            <div className="text-5xl mb-3">📱</div>
            <h3 className="text-xl font-bold text-pink-700 mb-2">Seguici sui Social</h3>
            <div className="flex gap-3 mt-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-pink-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl hover:bg-pink-600 transition-colors">
                📷
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl hover:bg-blue-600 transition-colors">
                👥
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="bg-red-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl hover:bg-red-600 transition-colors">
                📌
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
