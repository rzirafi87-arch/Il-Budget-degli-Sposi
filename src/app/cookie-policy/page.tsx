"use client";

import { formatDate } from "@/lib/locale";

export default function CookiePolicyPage() {
  return (
    <section className="pt-6 max-w-4xl mx-auto">
      <h1 className="font-serif text-4xl mb-8 text-center">Cookie Policy</h1>
      
      <div className="prose prose-lg max-w-none bg-white/70 rounded-2xl p-8 shadow-sm">
        <p className="text-sm text-gray-500 mb-6">
          <strong>Ultimo aggiornamento:</strong> {formatDate(new Date())}
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Cosa sono i Cookie?</h2>
        <p>
          I cookie sono piccoli file di testo che i siti web salvano sul tuo dispositivo (computer, tablet, smartphone) 
          quando li visiti. Servono a migliorare la tua esperienza di navigazione, ricordare le tue preferenze e 
          fornire funzionalità essenziali.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Tipi di Cookie Utilizzati</h2>
        
        <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Cookie Tecnici (Necessari) 🔒</h3>
        <p>
          Questi cookie sono essenziali per il funzionamento del sito e non possono essere disattivati. 
          Non richiedono il tuo consenso ai sensi della normativa vigente.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg mt-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Nome</th>
                <th className="text-left py-2">Scopo</th>
                <th className="text-left py-2">Durata</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2"><code>session_token</code></td>
                <td className="py-2">Mantiene la sessione utente attiva</td>
                <td className="py-2">Sessione</td>
              </tr>
              <tr className="border-b">
                <td className="py-2"><code>auth_token</code></td>
                <td className="py-2">Autenticazione sicura</td>
                <td className="py-2">30 giorni</td>
              </tr>
              <tr>
                <td className="py-2"><code>csrf_token</code></td>
                <td className="py-2">Protezione contro attacchi CSRF</td>
                <td className="py-2">Sessione</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Cookie di Preferenze 🎨</h3>
        <p>
          Ricordano le tue scelte (lingua, tema, visualizzazione) per migliorare l&apos;esperienza.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg mt-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Nome</th>
                <th className="text-left py-2">Scopo</th>
                <th className="text-left py-2">Durata</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2"><code>user_preferences</code></td>
                <td className="py-2">Salva preferenze UI/UX</td>
                <td className="py-2">1 anno</td>
              </tr>
              <tr>
                <td className="py-2"><code>cookie_consent</code></td>
                <td className="py-2">Ricorda scelta cookie banner</td>
                <td className="py-2">1 anno</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-semibold mt-6 mb-3">2.3 Cookie Analitici 📊</h3>
        <p>
          Raccolgono dati anonimi su come usi il sito per migliorarlo. Richiedono il tuo consenso.
        </p>
        <div className="bg-yellow-50 p-4 rounded-lg mt-2 border-l-4 border-yellow-400">
          <p className="text-sm">
            <strong>Nota:</strong> Attualmente non utilizziamo cookie analitici di terze parti 
            (come Google Analytics). Monitoriamo solo metriche server-side anonime.
          </p>
        </div>

        <h3 className="text-xl font-semibold mt-6 mb-3">2.4 Cookie di Marketing 📢</h3>
        <p>
          Utilizzati per mostrare pubblicità pertinenti. Richiedono il tuo consenso esplicito.
        </p>
        <div className="bg-green-50 p-4 rounded-lg mt-2 border-l-4 border-green-400">
          <p className="text-sm">
            <strong>Stato attuale:</strong> Non utilizziamo cookie di marketing o remarketing. 
            Se in futuro implementeremo pubblicità, richiederemo il tuo consenso preventivo.
          </p>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Cookie di Terze Parti</h2>
        <p>
          Alcuni cookie possono essere installati da servizi esterni che utilizziamo:
        </p>
        
        <h3 className="text-xl font-semibold mt-4 mb-2">Supabase (Hosting Database)</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Scopo:</strong> Autenticazione e gestione dati</li>
          <li><strong>Privacy Policy:</strong> <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#A3B59D] underline">supabase.com/privacy</a></li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2">Vercel (Hosting Web)</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Scopo:</strong> Delivery contenuti e performance</li>
          <li><strong>Privacy Policy:</strong> <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#A3B59D] underline">vercel.com/legal/privacy-policy</a></li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Come Gestire i Cookie</h2>
        
        <h3 className="text-xl font-semibold mt-4 mb-2">4.1 Tramite Banner Cookie</h3>
        <p>
          Al primo accesso, puoi scegliere quali cookie accettare tramite il banner di consenso. 
          Puoi modificare le tue preferenze in qualsiasi momento dalle impostazioni del tuo account.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">4.2 Tramite Browser</h3>
        <p>
          Puoi gestire i cookie attraverso le impostazioni del tuo browser:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li><strong>Chrome:</strong> Impostazioni → Privacy e sicurezza → Cookie</li>
          <li><strong>Firefox:</strong> Opzioni → Privacy e sicurezza → Cookie e dati dei siti web</li>
          <li><strong>Safari:</strong> Preferenze → Privacy → Gestisci dati siti web</li>
          <li><strong>Edge:</strong> Impostazioni → Cookie e autorizzazioni sito</li>
        </ul>

        <div className="bg-red-50 p-4 rounded-lg mt-4 border-l-4 border-red-400">
          <p className="text-sm">
            <strong>⚠️ Attenzione:</strong> Disabilitando i cookie tecnici, alcune funzionalità 
            del sito potrebbero non funzionare correttamente (es. impossibilità di accedere al tuo account).
          </p>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Do Not Track (DNT)</h2>
        <p>
          Rispettiamo il segnale &quot;Do Not Track&quot; del browser. Se abilitato, non tracciamo 
          la tua navigazione a fini analitici o pubblicitari.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Durata dei Cookie</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <ul className="space-y-2 text-sm">
            <li><strong>Cookie di sessione:</strong> Eliminati alla chiusura del browser</li>
            <li><strong>Cookie persistenti:</strong> Rimangono per il periodo specificato (max 1 anno)</li>
            <li><strong>Cookie analitici:</strong> Massimo 24 mesi (se accettati)</li>
          </ul>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Aggiornamenti della Cookie Policy</h2>
        <p>
          Ci riserviamo il diritto di modificare questa Cookie Policy per adeguarla a normative 
          o cambiamenti nei servizi. La data dell&apos;ultimo aggiornamento è indicata in alto. 
          Ti invitiamo a consultare periodicamente questa pagina.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Cookie e GDPR</h2>
        <p>
          In conformità al GDPR (Regolamento UE 2016/679) e alla Direttiva ePrivacy:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>I cookie tecnici non richiedono consenso</li>
          <li>I cookie di profilazione richiedono consenso preventivo e informato</li>
          <li>Il consenso può essere revocato in qualsiasi momento</li>
          <li>Forniamo informazioni chiare e complete sull&apos;uso dei cookie</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contatti</h2>
        <p>
          Per domande sulla Cookie Policy o sulla gestione dei tuoi dati:<br />
          Email: <strong>privacy@ilbudgetdeglisposi.it</strong><br />
          Telefono: <strong>+39 XXX XXX XXXX</strong>
        </p>

        <div className="mt-12 p-6 bg-[#A3B59D]/10 rounded-lg">
          <h3 className="font-semibold mb-3">📋 Riepilogo Rapido</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-semibold mb-1">Cookie Tecnici</div>
              <div className="text-gray-600">✅ Sempre attivi</div>
            </div>
            <div>
              <div className="font-semibold mb-1">Cookie Preferenze</div>
              <div className="text-gray-600">🔘 Richiedono consenso</div>
            </div>
            <div>
              <div className="font-semibold mb-1">Cookie Marketing</div>
              <div className="text-gray-600">❌ Non utilizzati</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
