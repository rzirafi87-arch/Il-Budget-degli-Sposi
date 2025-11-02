"use client";

export default function ComeFunzionaPage() {
  return (
    <section>
      <h2 className="font-serif text-2xl sm:text-3xl mb-4 sm:mb-6 font-bold">📖 Come Funziona</h2>
      
      <div className="space-y-6">
        {/* Step 1 */}
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl shadow-lg p-6 border-2 border-pink-300">
          <div className="flex items-start gap-4">
            <div className="bg-pink-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="text-xl font-bold text-pink-700 mb-2">📝 Registrati Gratuitamente</h3>
              <p className="text-gray-700">
                Crea il tuo account in pochi secondi. Nessun costo nascosto, nessuna carta di credito richiesta. 
                Inizia subito a pianificare il tuo matrimonio!
              </p>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6 border-2 border-blue-300">
          <div className="flex items-start gap-4">
            <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-700 mb-2">💰 Imposta il Tuo Budget</h3>
              <p className="text-gray-700">
                Definisci il budget iniziale per sposa e sposo. Il sistema calcolerà automaticamente 
                il budget totale e ti aiuterà a monitorare le spese in tempo reale.
              </p>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg p-6 border-2 border-green-300">
          <div className="flex items-start gap-4">
            <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-700 mb-2">📊 Gestisci le Categorie</h3>
              <p className="text-gray-700">
                Organizza tutte le spese in 20+ categorie preimpostate: abiti, location, catering, 
                fotografi, fioristi e molto altro. Ogni voce è già pronta all&apos;uso!
              </p>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg p-6 border-2 border-purple-300">
          <div className="flex items-start gap-4">
            <div className="bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
              4
            </div>
            <div>
              <h3 className="text-xl font-bold text-purple-700 mb-2">🔍 Trova Fornitori</h3>
              <p className="text-gray-700">
                Accedi al nostro database con migliaia di fornitori verificati in tutta Italia: 
                location, chiese, fotografi, wedding planner, musicisti e molto altro!
              </p>
            </div>
          </div>
        </div>

        {/* Step 5 */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-lg p-6 border-2 border-orange-300">
          <div className="flex items-start gap-4">
            <div className="bg-orange-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
              5
            </div>
            <div>
              <h3 className="text-xl font-bold text-orange-700 mb-2">👥 Gestisci gli Invitati</h3>
              <p className="text-gray-700">
                Crea e gestisci la lista degli invitati, organizza per famiglie, monitora le conferme 
                e calcola i costi per persona.
              </p>
            </div>
          </div>
        </div>

        {/* Step 6 */}
        <div className="bg-gradient-to-br from-[#A3B59D]/20 to-[#A3B59D]/40 rounded-2xl shadow-lg p-6 border-2 border-[#A3B59D]">
          <div className="flex items-start gap-4">
            <div className="bg-[#A3B59D] text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
              6
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#8a9d84] mb-2">💾 Salva e Monitora</h3>
              <p className="text-gray-700">
                Salva i tuoi progressi in qualsiasi momento. Visualizza grafici e statistiche, 
                controlla il budget residuo e mantieni tutto sotto controllo fino al grande giorno!
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#A3B59D] to-[#8a9d84] rounded-2xl shadow-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">🎉 Pronto per Iniziare?</h3>
          <p className="text-white/90 mb-6">
            Inizia oggi stesso a pianificare il tuo matrimonio da sogno!
          </p>
          <a 
            href="/auth"
            className="inline-block bg-white text-[#A3B59D] px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all active:scale-95"
          >
            Registrati Gratis Ora
          </a>
        </div>
      </div>
    </section>
  );
}
