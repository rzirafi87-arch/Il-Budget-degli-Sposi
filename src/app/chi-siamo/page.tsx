"use client";

export default function ChiSiamoPage() {
  return (
    <section>
      <h2 className="font-serif text-2xl sm:text-3xl mb-4 sm:mb-6 font-bold">👰🤵 Chi Siamo</h2>
      
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-gray-200">
        <div className="prose prose-lg max-w-none">
          <h3 className="text-xl font-bold text-[#A3B59D] mb-4">🎉 MYBUDGETEVENTO</h3>
          <p className="text-gray-700 mb-4">
            Siamo la piattaforma italiana numero uno per la gestione del budget matrimoniale.
            Nata dall&apos;esperienza diretta di coppie che hanno vissuto le sfide dell&apos;organizzazione 
            di un matrimonio, la nostra missione è rendere questo processo più semplice, trasparente 
            e piacevole.
          </p>

          <h3 className="text-xl font-bold text-[#A3B59D] mb-4 mt-8">🎯 La Nostra Missione</h3>
          <p className="text-gray-700 mb-4">
            Aiutare le coppie italiane a pianificare il loro matrimonio da sogno senza stress 
            finanziari. Offriamo strumenti gratuiti, intuitivi e completi per gestire ogni aspetto 
            del budget matrimoniale.
          </p>

          <h3 className="text-xl font-bold text-[#A3B59D] mb-4 mt-8">✨ Perché Sceglierci</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li><strong>100% Gratuito:</strong> Tutti gli strumenti sono completamente gratuiti</li>
            <li><strong>Made in Italy:</strong> Pensato specificamente per matrimoni italiani</li>
            <li><strong>Privacy Garantita:</strong> I tuoi dati sono protetti e GDPR compliant</li>
            <li><strong>Database Fornitori:</strong> Accesso a migliaia di fornitori in tutta Italia</li>
            <li><strong>Supporto Dedicato:</strong> Il nostro team è sempre disponibile ad aiutarti</li>
          </ul>

          <h3 className="text-xl font-bold text-[#A3B59D] mb-4 mt-8">📞 Contattaci</h3>
          <p className="text-gray-700 mb-4">
            Hai domande o suggerimenti? Siamo qui per te!
          </p>
          <a 
            href="https://wa.me/393001234567?text=Ciao!%20Vorrei%20informazioni%20su%20Il%20Budget%20degli%20Sposi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
          >
            💬 Chatta con noi su WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
