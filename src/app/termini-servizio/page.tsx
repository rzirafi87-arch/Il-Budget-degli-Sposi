"use client";

import { formatDate } from "@/lib/locale";

export default function TerminiServizioPage() {
  return (
    <section className="pt-6 max-w-4xl mx-auto">
      <h1 className="font-serif text-4xl mb-8 text-center">Termini di Servizio</h1>
      
      <div className="prose prose-lg max-w-none bg-white/70 rounded-2xl p-8 shadow-sm">
        <p className="text-sm text-gray-500 mb-6">
          <strong>Ultimo aggiornamento:</strong> {formatDate(new Date())}
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Accettazione dei Termini</h2>
        <p>
          Benvenuto su <strong>Il Budget degli Sposi</strong>. Utilizzando questa piattaforma, accetti 
          integralmente i presenti Termini di Servizio. Se non accetti questi termini, ti invitiamo a 
          non utilizzare il servizio.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Descrizione del Servizio</h2>
        <p>
          Il Budget degli Sposi è una piattaforma online gratuita che permette di:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Pianificare e gestire il budget del proprio matrimonio</li>
          <li>Tenere traccia di spese ed entrate</li>
          <li>Gestire la lista invitati</li>
          <li>Cercare e confrontare fornitori di servizi wedding</li>
          <li>Creare save-the-date e partecipazioni personalizzate</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Registrazione e Account</h2>
        <h3 className="text-xl font-semibold mt-4 mb-2">3.1 Requisiti</h3>
        <p>
          Per utilizzare il servizio completo, devi:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Avere almeno 18 anni</li>
          <li>Fornire informazioni veritiere e accurate</li>
          <li>Mantenere riservate le tue credenziali di accesso</li>
          <li>Accettare la Privacy Policy</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2">3.2 Responsabilità Account</h3>
        <p>
          Sei responsabile di tutte le attività svolte tramite il tuo account. In caso di accesso 
          non autorizzato, devi informarci immediatamente.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Utilizzo del Servizio</h2>
        <h3 className="text-xl font-semibold mt-4 mb-2">4.1 Usi Consentiti</h3>
        <p>Puoi utilizzare il servizio per:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Pianificare il tuo matrimonio personale</li>
          <li>Condividere dati con il/la tuo/a partner</li>
          <li>Consultare informazioni sui fornitori</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2">4.2 Usi Vietati</h3>
        <p>È vietato:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Utilizzare il servizio per scopi commerciali senza autorizzazione</li>
          <li>Copiare, modificare o distribuire contenuti protetti da copyright</li>
          <li>Tentare di accedere ad account altrui</li>
          <li>Caricare virus, malware o codice dannoso</li>
          <li>Utilizzare bot, scraper o strumenti automatizzati</li>
          <li>Violare leggi applicabili o diritti di terzi</li>
          <li>Pubblicare contenuti offensivi, diffamatori o illegali</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Contenuti Utente</h2>
        <h3 className="text-xl font-semibold mt-4 mb-2">5.1 Proprietà</h3>
        <p>
          Mantieni la proprietà di tutti i contenuti che carichi (foto, dati, ecc.). Ci concedi 
          una licenza limitata per memorizzare ed elaborare tali contenuti al fine di fornire il servizio.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">5.2 Responsabilità</h3>
        <p>
          Sei responsabile dei contenuti che carichi. Garantisci di avere il diritto di caricare 
          tali contenuti e che non violano diritti di terzi.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Fornitori di Servizi</h2>
        <p>
          La piattaforma include un database di fornitori (location, fotografi, ecc.). 
          <strong>Non siamo responsabili</strong> per:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>La qualità dei servizi offerti dai fornitori</li>
          <li>Contratti stipulati direttamente con i fornitori</li>
          <li>Dispute o controversie con i fornitori</li>
          <li>Informazioni errate fornite dai fornitori stessi</li>
        </ul>
        <p className="mt-2">
          Ti invitiamo a verificare sempre recensioni, portfolio e contratti prima di assumere un fornitore.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Gratuità del Servizio</h2>
        <p>
          Il servizio base è completamente gratuito. Ci riserviamo il diritto di:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Introdurre funzionalità premium a pagamento in futuro</li>
          <li>Mostrare pubblicità pertinente</li>
          <li>Ricevere commissioni da fornitori partner (senza costi aggiuntivi per te)</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Proprietà Intellettuale</h2>
        <p>
          Tutti i contenuti della piattaforma (design, logo, testi, codice) sono protetti da 
          copyright e marchi registrati. Non puoi copiare, riprodurre o distribuire tali contenuti 
          senza autorizzazione scritta.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Limitazioni di Responsabilità</h2>
        <p>
          Il servizio è fornito &quot;così com&apos;è&quot; senza garanzie di alcun tipo. Non siamo responsabili per:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Perdita di dati dovuta a errori tecnici o forza maggiore</li>
          <li>Interruzioni del servizio</li>
          <li>Decisioni prese basandosi sui nostri strumenti</li>
          <li>Danni indiretti, incidentali o consequenziali</li>
        </ul>
        <p className="mt-2">
          <strong>Ti consigliamo di effettuare backup regolari dei tuoi dati importanti.</strong>
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">10. Modifiche al Servizio</h2>
        <p>
          Ci riserviamo il diritto di:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Modificare, sospendere o interrompere il servizio</li>
          <li>Aggiungere o rimuovere funzionalità</li>
          <li>Modificare i presenti Termini di Servizio</li>
        </ul>
        <p className="mt-2">
          Le modifiche significative saranno comunicate via email con 30 giorni di anticipo.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">11. Risoluzione e Cancellazione Account</h2>
        <h3 className="text-xl font-semibold mt-4 mb-2">11.1 Tua Iniziativa</h3>
        <p>
          Puoi cancellare il tuo account in qualsiasi momento dalle impostazioni. I dati saranno 
          eliminati entro 30 giorni, salvo obblighi legali di conservazione.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">11.2 Nostra Iniziativa</h3>
        <p>
          Possiamo sospendere o cancellare il tuo account se:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Violi i presenti Termini di Servizio</li>
          <li>Usi il servizio per attività illegali</li>
          <li>L&apos;account rimane inattivo per oltre 24 mesi</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">12. Legge Applicabile e Foro Competente</h2>
        <p>
          I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia, 
          è competente esclusivamente il Foro di [Città], Italia.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">13. Disposizioni Varie</h2>
        <h3 className="text-xl font-semibold mt-4 mb-2">13.1 Divisibilità</h3>
        <p>
          Se una clausola è dichiarata invalida, le restanti clausole rimangono valide ed efficaci.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">13.2 Cessione</h3>
        <p>
          Non puoi cedere i tuoi diritti derivanti da questi Termini senza nostro consenso scritto.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">13.3 Comunicazioni</h3>
        <p>
          Le comunicazioni ufficiali saranno inviate all&apos;email registrata nel tuo account.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">14. Contatti</h2>
        <p>
          Per domande sui Termini di Servizio:<br />
          Email: <strong>info@ilbudgetdeglisposi.it</strong><br />
          PEC: <strong>ilbudgetdeglisposi@pec.it</strong>
        </p>

        <div className="mt-12 p-6 bg-[#A3B59D]/10 rounded-lg border-l-4 border-[#A3B59D]">
          <p className="text-sm">
            <strong>📌 Nota importante:</strong> Utilizzando il servizio, dichiari di aver letto, 
            compreso e accettato integralmente i presenti Termini di Servizio e la 
            <a href="/privacy-policy" className="text-[#A3B59D] underline ml-1">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
