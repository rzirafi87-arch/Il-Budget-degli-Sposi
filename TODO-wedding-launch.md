# Roadmap Lancio – Evento MATRIMONIO

## Definition of Done – Matrimonio pronto al lancio
Quando diciamo “Matrimonio pronto” dobbiamo coprire:

### A. Funzionalità per Wedding
- [ ] Onboarding + selezione lingua/nazione/evento (Wedding)
- [ ] Budget completo con categorie, sottocategorie, entrate/uscite, split bride/groom/common, totali e progressi visibili
- [ ] Invitati: lista completa, stato RSVP, supporto tavoli (anche di base)
- [ ] Timeline Wedding con template solido e possibilità di aggiungere/modificare step
- [ ] Income tracking (buste/regali/bonifici) legato agli invitati
- [ ] Media upload stabile (foto, documenti, contratti)
- [ ] PDF inviti template IT/EN funzionante

### B. Lingue supportate per Wedding
- [ ] Italiano
- [ ] Inglese
- [ ] Francese
- [ ] Spagnolo
- [ ] Portoghese
- [ ] Cinese (zh-CN)
- [ ] Tradurre UI (menu, pulsanti, form), categorie/sottocategorie, timeline, messaggi principali (onboarding, errori, pulsanti)

### C. Paesi supportati (lista screenshot)
Per ciascun paese:
- default locale (es. IT → it-IT, MX → es-ES) e valuta/formattazione (anche se si inizia con EUR)
- flag “solo Wedding” pronto
- rimuovere eventuale “coming soon” dalla UI quando pronto

- [ ] Italia 🇮🇹 (it-IT, EUR)
- [ ] Messico 🇲🇽 (es-ES, MXN/EUR)
- [ ] Spagna 🇪🇸
- [ ] Francia 🇫🇷
- [ ] India 🇮🇳
- [ ] Giappone 🇯🇵
- [ ] Regno Unito 🇬🇧
- [ ] Emirati Arabi Uniti 🇦🇪
- [ ] Stati Uniti 🇺🇸
- [ ] Brasile 🇧🇷
- [ ] Germania 🇩🇪
- [ ] Canada 🇨🇦
- [ ] Cina 🇨🇳
- [ ] Indonesia 🇮🇩


## Tabella di marcia cronologica

### Fase 1 – Wedding IT/EN + Italia/Messico (COMPLETATA)
- [x] Consolidare struttura evento Wedding (budget, timeline, i18n)
- [x] Verificare categorie e sottocategorie Wedding senza buchi (vedi `supabase-wedding-event-seed.sql`)
- [x] Completare template timeline Wedding (proposta, preparativi, giorno, post) – già modellato in `supabase-timeline-wedding-restore.sql`
- [x] Tradurre event_type/categorie/timeline in IT e EN (documento `docs/wedding-timeline-translations.md`, script `supabase-wedding-translations.sql`, e blocchi JSON `timelineSteps`)
- [x] Configurare geo_countries: Italia (it-IT/EUR), Messico (es-ES/MXN o EUR)
- [x] Flusso completo utente IT/EN per Italia/Messico fino a PDF invito

(Nota: Timeline e traduzioni IT/EN possono essere ripristinate tramite `supabase-timeline-wedding-restore.sql`. Per evitare duplicati, controllare `event_timeline_translations` e `event_type_translations` già presenti prima di inserire nuove righe.)

(Nota: prima di inserire nuovi record di timeline verificare eventuali seed già esistenti in Supabase oppure `supabase-wedding-event-seed.sql`, e confermare in `event_timeline_translations` che non ci siano entry duplicate.)

### Fase 2 – Estensione lingue Wedding (FR/ES/PT/ZH) (INIZIATA)
- [ ] UI core tradotta in FR/ES/PT/ZH (menu, bottoni, label, errori)
- [ ] Traduzioni Wedding (categorie + timeline) per FR/ES/PT/ZH
- [ ] Verifica switch lingua (categorie, timeline, onboarding aggiornati)

### Fase 3 – Estensione paesi
- [ ] Configurare Spagna
- [ ] Configurare Francia
- [ ] Configurare India
- [ ] Configurare Giappone
- [ ] Configurare Regno Unito
- [ ] Configurare Emirati Arabi Uniti
- [ ] Configurare Stati Uniti
- [ ] Configurare Brasile
- [ ] Configurare Germania
- [ ] Configurare Canada
- [ ] Configurare Cina
- [ ] Configurare Indonesia
- [ ] Aggiornare UI lista paesi togliendo “coming soon” dove Wedding è pronto

### Fase 4 – Rifiniture & pre-lancio
- [ ] Test mobile completo (onboarding/wizard, budget, invitati, timeline)
- [ ] Sistemare padding/alignment mobile problematici
- [ ] `npm run build` pulito (senza warning importanti)
- [ ] Controllo micro-copy in tutte le lingue chiave (“Salva”, “Indietro”, “Continua”, “Elimina”, etc.)
- [ ] Sessione test 1–3 utenti reali + documento feedback (bug/UX/miglioramenti)
- [ ] Fix dei bug più evidenti emersi dai test
