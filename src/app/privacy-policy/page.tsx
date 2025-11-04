"use client";

import { formatDate } from "@/lib/locale";
import { useTranslations } from "next-intl";

export default function PrivacyPolicyPage() {
  const t = useTranslations("policies");
  return (
    <section className="pt-6 max-w-4xl mx-auto">
      <h1 className="font-serif text-4xl mb-8 text-center">{t("privacy.title")}</h1>

      <div className="prose prose-lg max-w-none bg-white/70 rounded-2xl p-8 shadow-sm">
        <p className="text-sm text-gray-500 mb-6">
          <strong>{t("lastUpdated")}</strong> {formatDate(new Date())}
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduzione</h2>
        <p>
          Benvenuto su <strong>MYBUDGETEVENTO</strong>. La presente Privacy Policy descrive come raccogliamo, 
          utilizziamo e proteggiamo i tuoi dati personali in conformità con il Regolamento Generale sulla Protezione 
          dei Dati (GDPR - Regolamento UE 2016/679).
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Titolare del Trattamento</h2>
        <p>
          Il Titolare del trattamento dei dati è:<br />
          <strong>MYBUDGETEVENTO</strong><br />
          Email: privacy@ilbudgetdeglisposi.it<br />
          PEC: ilbudgetdeglisposi@pec.it
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Dati Raccolti</h2>
        <p>Raccogliamo le seguenti categorie di dati personali:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Dati di registrazione:</strong> nome, cognome, email, password (criptata)</li>
          <li><strong>Dati dell&apos;evento:</strong> data del matrimonio, budget, preferenze</li>
          <li><strong>Dati di navigazione:</strong> indirizzo IP, tipo di browser, pagine visitate</li>
          <li><strong>Dati degli invitati:</strong> nomi, email, preferenze alimentari (se inseriti dall&apos;utente)</li>
          <li><strong>Dati di pagamento:</strong> informazioni fornitori selezionati (non conserviamo dati di carte di credito)</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Finalità del Trattamento</h2>
        <p>I tuoi dati personali vengono trattati per le seguenti finalità:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Fornire i servizi di pianificazione budget matrimonio</li>
          <li>Gestire il tuo account utente</li>
          <li>Inviare comunicazioni relative al servizio (notifiche, aggiornamenti)</li>
          <li>Migliorare la piattaforma attraverso analisi aggregate</li>
          <li>Adempiere obblighi legali e normativi</li>
          <li>Invio newsletter (solo con consenso esplicito)</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Base Giuridica del Trattamento</h2>
        <p>Il trattamento dei dati si basa su:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Esecuzione del contratto:</strong> per fornire i servizi richiesti</li>
          <li><strong>Consenso:</strong> per newsletter e comunicazioni marketing</li>
          <li><strong>Interesse legittimo:</strong> per migliorare il servizio e prevenire frodi</li>
          <li><strong>Obbligo legale:</strong> per adempiere a obblighi fiscali e contabili</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Conservazione dei Dati</h2>
        <p>
          I dati personali vengono conservati per il tempo necessario a fornire i servizi richiesti e, 
          successivamente, per il periodo richiesto dalla normativa fiscale (10 anni). I dati di marketing 
          vengono cancellati entro 24 mesi dall&apos;ultimo consenso.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Condivisione dei Dati</h2>
        <p>I tuoi dati possono essere condivisi con:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Fornitori di servizi:</strong> Supabase (hosting database), Vercel (hosting web)</li>
          <li><strong>Partner commerciali:</strong> Solo con tuo consenso esplicito</li>
          <li><strong>Autorità competenti:</strong> Su richiesta legale</li>
        </ul>
        <p className="mt-2">
          <strong>Non vendiamo mai i tuoi dati a terzi.</strong>
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Diritti dell&apos;Interessato</h2>
        <p>Hai diritto di:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Accesso:</strong> ottenere copia dei tuoi dati</li>
          <li><strong>Rettifica:</strong> correggere dati inesatti</li>
          <li><strong>Cancellazione:</strong> richiedere l&apos;eliminazione dei dati (&quot;diritto all&apos;oblio&quot;)</li>
          <li><strong>Limitazione:</strong> limitare il trattamento in determinate circostanze</li>
          <li><strong>Portabilità:</strong> ricevere i dati in formato strutturato</li>
          <li><strong>Opposizione:</strong> opporti al trattamento per finalità di marketing</li>
          <li><strong>Revoca del consenso:</strong> revocare il consenso in qualsiasi momento</li>
        </ul>
        <p className="mt-4">
          Per esercitare i tuoi diritti, contattaci a: <strong>privacy@ilbudgetdeglisposi.it</strong>
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Sicurezza dei Dati</h2>
        <p>
          Adottiamo misure tecniche e organizzative appropriate per proteggere i tuoi dati personali, tra cui:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Crittografia SSL/TLS per tutte le comunicazioni</li>
          <li>Password crittografate con algoritmo bcrypt</li>
          <li>Accesso ai dati limitato al personale autorizzato</li>
          <li>Backup regolari e disaster recovery</li>
          <li>Monitoraggio continuo per rilevare accessi non autorizzati</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">10. Cookie e Tecnologie di Tracciamento</h2>
        <p>
          Utilizziamo cookie tecnici necessari al funzionamento del sito. Per maggiori informazioni, 
          consulta la nostra <a href="/cookie-policy" className="text-[#A3B59D] underline">Cookie Policy</a>.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">11. Trasferimento Dati Extra-UE</h2>
        <p>
          I dati possono essere trasferiti verso paesi extra-UE solo se dotati di adeguate garanzie 
          (clausole contrattuali standard, Privacy Shield, ecc.).
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">12. Minori</h2>
        <p>
          Il servizio è destinato a maggiorenni. Non raccogliamo consapevolmente dati di minori di 18 anni.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">13. Modifiche alla Privacy Policy</h2>
        <p>
          Ci riserviamo il diritto di modificare questa Privacy Policy. Le modifiche saranno pubblicate 
          su questa pagina con indicazione della data di ultimo aggiornamento.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">14. Reclami</h2>
        <p>
          Hai il diritto di presentare reclamo all&apos;autorità di controllo competente:<br />
          <strong>Garante per la Protezione dei Dati Personali</strong><br />
          Piazza di Monte Citorio n. 121, 00186 Roma<br />
          Email: garante@gpdp.it<br />
          Tel: +39 06 696771
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">15. Contatti</h2>
        <p>
          Per qualsiasi domanda o richiesta relativa alla presente Privacy Policy, contattaci:<br />
          Email: <strong>privacy@ilbudgetdeglisposi.it</strong><br />
          Risponderemo entro 30 giorni dalla richiesta.
        </p>
      </div>
    </section>
  );
}
