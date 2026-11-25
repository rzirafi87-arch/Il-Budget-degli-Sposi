# Matrimonio e Battesimo — integrazione 23 novembre 2026

Autorizzazione ricevuta: completare i due eventi e le migrazioni necessarie; Diciottesimo successivo.

## Ambiente e migrazioni
QA: tnopiqxlcuakkavpwbrq. Production: vsguhivizuneylqhygfk.
Applicate in QA tutte le 13 migrazioni Branch53 e le 4 migrazioni
Branch54 first-value, Branch57 RLS privato, atomic_budget_idea_apply e atomic_event_update.
Ogni gruppo è stato provato prima con rollback; poi registrato nella history QA.
Installato pgTAP solo in QA per le verifiche.
Audit scripts/audit-wedding-qa-readiness.sql: zero prerequisiti mancanti.
17 suite SQL / 392 asserzioni: finish() senza diagnostica di fallimento.
Regressione baptism_client_rpc_grants.sql PASS dopo tutte le migrazioni.

Impronte prima/dopo migrazioni e prove SQL identiche:
- events: b54b79ffac36bc9a5837e7a47da819a9
- guests: 5affcd51b7daac1de188be81144554e7
- expenses: bbae2f23a64bdad03ae568d5ff4a10ec
- baptism_family_plans: 2d5b930e369f7b3e0f7dee6122d0474e

## Codice
Integrate le correzioni Matrimonio da PR92 con Battesimo da PR93.
Conflitti risolti conservando il selettore evento nelle impostazioni, il
budget approvato e gli errori recuperabili. 962 test applicativi PASS in
143 suite prima dell'ultimo test aggiunto per la selezione dei documenti.
TypeScript PASS.
Aggiunti accessi dal planner Battesimo a fornitori, location, chiese e documenti.
Ogni accesso seleziona l'evento sul server e verifica ID/tipo prima di navigare;
modifiche e pagamenti aperti sono protetti dalla conferma.
I soli moduli condivisi revisionati sono ammessi per Battesimo in preview;
budget/invitati/checklist restano gestiti dal planner famiglia.
La dashboard comune ridirige il Battesimo al suo planner.
Diciottesimo rimane coming-soon senza modulo o template esposto quando
NEXT_PUBLIC_EIGHTEENTH_PREVIEW non è abilitato.

## Prove precedenti confermate
Logout/login reale e cambio Matrimonio di prova QA/Battesimo verificati.
Il Matrimonio di prova fbfebe42-b4c5-41ee-a599-59f876b95385 resta disponibile
nell'account proprietario del Battesimo per le prove dell'utente.

## Gate ancora aperti
Build e verifica browser dei nuovi moduli condivisi sulla versione integrata.
Registrazione reale con conferma email e viewport mobile 360/390.
Production non modificata in questa fase: migrazioni residue e rilascio dopo
il gate completo. Non è richiesta un'altra autorizzazione per il perimetro
già approvato, ma questo checkpoint non dichiara i due eventi completi.
La migrazione event_access_nonempty_email è un precedente rimedio QA: prima di
Production va riconciliata con il wrapper Branch53 già presente, evitando
di sostituire automaticamente la funzione autorizzativa più recente.

## Collaudo della versione integrata
Pubblicato su feature/battesimo-completo@ec8b500, Vercel READY
dpl_H2L42efwnnHtfyuHiRGtDEjShmv2. Browser autenticato: apertura
Documenti (archivio vuoto senza errore), Fornitori, Location e Chiese dal
contesto Battesimo. Nessuna proposta fittizia inviata ai cataloghi.
Corrette le immagini matrimonio ereditate dalle pagine luoghi per il Battesimo
e l'indicazione DOC/DOCX nei suggerimenti documenti (supportati PDF/JPG/PNG).
Suite completa successiva: 963 test PASS / 143 suite, TypeScript PASS.

Production: preflight in rollback delle sette migrazioni necessarie PASS.
Il tentativo apply_migration della prima (Branch54) ha restituito
status=expired, conferma scaduta. Verifica successiva: private.event_activations
e baptism_family_plans ancora assenti. Nessuna migration Production eseguita.
Pacchetto necessario: le quattro migrazioni QA sopra indicate e
20261118230000_baptism_family_plans, 20261119090102_baptism_family_validation,
20261122150000_baptism_restore_client_rpc_grants. Il rimedio
event_access_nonempty_email è già coperto dal wrapper Branch53 Production
(private.event_access_role_for_actor) e non viene riapplicato.
Impronta Production prima della prova: events e0de9512cf753a4bf1331cf4a0632a46,
expenses ceb5777602195f1a125214a4f148bd5d, guests vuoto.

## Superamento del gate migrazioni Production
La nuova richiesta apply_migration è stata accettata: applicate tutte le
sette migrazioni necessarie in Production. Le 13 Branch53 erano già presenti.
Il precedente status=expired è superato; nessuna conferma resta pendente.
Fingerprint preesistenti invariati: events e0de9512cf753a4bf1331cf4a0632a46,
expenses ceb5777602195f1a125214a4f148bd5d, guests vuoto. Per il confronto
expenses è esclusa la sola nuova colonna nullable baptism_details.
Test transazionale Production PASS: save/read nuovo Battesimo con account
auth esistente, diniego altro attore, anon senza EXECUTE. ROLLBACK; zero piani
Battesimo persistiti. La prima prova aveva scelto un owner di evento legacy
senza record Auth e falliva per FK: corretta la selezione della fixture con
join auth.users; nessun dato legacy modificato.
Codice applicativo Production non rilasciato. Anteprima a7f2069 READY
dpl_AoXHTimHpNSk6cipUPowEqXoCX1T. Da chiudere conferma email reale, prova
mobile esatta e revisione del pacchetto prima del rilascio completo.
