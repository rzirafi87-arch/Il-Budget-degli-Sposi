# Inventario contenuti eventi — 28 novembre 2026

## Perimetro ed evidenze

Lettura statica del candidato locale basato su `831dc46218b2b44b59e5e7b998d65c415c056ed9` (documentazione sopra `568c70071ea4a185d0aa2469c3f6d77e82f41afa`; applicazione PR95 `98a1aebeceb4cecbe53ea1979d4ad7e5597dbefb`). Letti `src/config/events.registry.ts`, `src/lib/eventTypeCapabilities.ts`, template, pagine e API citati sotto. Letti i documenti recuperati attraverso XML DOCX/XLSX e i materiali correnti Library. Nessun flag, codice, database o pubblico modificato da questo inventario. Presenza di contenuti e approvazione editoriale non certificano funzionamento, sicurezza o attivazione pubblica.

## Identificatori reali e disponibilità

| Evento richiesto | Identificatore verificato | Registro secondario / percorso dichiarato | Capability operativa attuale |
|---|---|---|---|
| Compleanno | `birthday` / alias `BIRTHDAY` | `/[locale]/birthday`; disponibilità subordinata ai flag | `COMING_SOON`; nessun modulo pubblico completo |
| Festa dei 50 anni | `fifty` / alias `FIFTY` | `/[locale]/turning-50`; disponibilità subordinata ai flag | `COMING_SOON`; non usare automaticamente gli ID storici `birthday-50` dei seed |
| Prima Comunione | `communion` / alias `COMMUNION` | `/[locale]/communion`; disabilitato | `COMING_SOON` |
| Laurea | `graduation` / alias `GRADUATION` | `/[locale]/graduation`; disabilitato; pagina storica effettiva `/laurea` | `COMING_SOON` |
| Cresima | `confirmation` / alias `CONFIRMATION` | `/[locale]/confirmation`; disabilitato; pagina storica `/cresima` | `COMING_SOON` |
| Comunità scelta e ritrovo | Nessun identificatore autonomo nei due registri | Etichette del percorso `baptism` | Non creare un nuovo tipo evento sulla base di questa dicitura |

`eventTypeCapabilities.ts` è il controllo operativo di disponibilità e registrazione; il solo flag del registro secondario non lo supera. `src/proxy.ts` intercetta API dashboard/seed legacy degli eventi non pronti. Conservare le protezioni durante l’integrazione. L’assenza di uno slug Comunità nei registri è verificata; la corrispondenza con il Battesimo è confermata dal pacchetto recuperato, che approva esplicitamente le etichette «Comunità scelta» e «Ritrovo».

## Materiali recuperati dal repository

| Evento | Fonte remota verificata | Materiali presenti nel checkout | Contenuto letto e stato editoriale |
|---|---|---|---|
| Battesimo | `docs/battesimo-pacchetto-approvato@e81df80a84d46c871c24a483adcc601252e0f30a` | `docs/eventi/battesimo/Battesimo_Percorso_e_Contenuti.docx`; `Battesimo_Testi_Budget_e_Mappa.xlsx` | Percorso, programma separato cerimonia/ritrovo, tre scenari e budget, chiavi IT/EN/ES/FR/DE. DOCX dichiara approvate etichette, tono familiare e tre scene fotografiche avorio/azzurro polvere. Lo stato main del 18/11 è storico, superato dal QA PR94/95 per il relativo perimetro. |
| Prima Comunione | `docs/communion-editoriale@e14a8b4c824846117c4b9fb2eed5863b2dc6d2bf` | `docs/events/communion/Prima_Comunione_Percorso_e_contenuti.docx`; `Prima_Comunione_Testi_Budget_Destinazioni.xlsx` | Percorso familiare e festa condivisa da due famiglie, programma/presenze/riparto; fogli Testi interfaccia, Budget e Destinazioni. Scelte dichiarate approvate nel DOCX: nome «Prima Comunione», tono solenne, apertura ingresso della chiesa. Non attestata approvazione dell’intera implementazione o del lancio. |
| Laurea | `docs/laurea-contenuti@d7a7f7455eaeb6efa15986365cc9d7a37517c43d` | `docs/eventi/laurea/Festa_di_laurea_Revisione.docx`; `Festa_di_laurea_Testi_e_budget.xlsx` | Brindisi dopo proclamazione, cena e festa in locale; orario proclamazione distinto dalla festa; cinque lingue e budget. DOCX dichiara approvati nome Laurea, invito in prima persona per chi festeggia, fotografia brindisi vicino università. Non attestata approvazione dell’intera implementazione o del lancio. |
| Cresima | `docs/cresima-contenuti@b06b8d781b53a14623e101ddaed4b957253f1c3e` | `docs/events/confirmation/Cresima_Pacchetto_contenuti.docx`; `Cresima_Testi_e_budget.xlsx` | Percorso per sé/altra persona, sola cerimonia/pranzo/aperitivo, comunità e incontri, programma e budget; cinque lingue. Preferenze riportate: «Nome di chi riceve la Cresima», suggerimento rinominabile «Padrino o Madrina», fotografia persona adulta accompagnata all’ingresso. Documento propone percorso per revisione, non attesta attivazione approvata. |

I pacchetti contengono esempi editoriali; non copiarli nei dati degli utenti né usarli come credenziali o fixture Production. Conservare i documenti originali e le chiavi stabili; le affermazioni sullo stato del codice al 18/11 non sostituiscono la verifica attuale.

## Materiali correnti trovati e letti in Library

| Evento | File e identità persistente | Contenuti e limiti |
|---|---|---|
| Compleanno | `Compleanno_Revisione.docx`, `libfile_4400833aa4c48191a483fad8913d1b07`, 342583 byte, aggiornato 18/11/2026 | Sei pagine lette: percorso in due passaggi, per sé/altri, casa/ristorante/sala, età e tema facoltativi, data/budget da decidere, dashboard, spese/pagamenti, invitati, checklist e brief immagini. Esplicitamente «Pacchetto da approvare». Quattro proposte finali ancora da approvare: data/budget aperti; tre categorie iniziali; messaggi copiabili/risposte manuali; sostituzione delle tre grafiche con fotografie. |
| Compleanno | `Compleanno_Testi_e_budget.xlsx`, `libfile_d68052ba50b48191bf8bbcaba8d1f246`, 15833 byte, aggiornato 18/11/2026 | Letti fogli Testi, Casa, Ristorante e Sala: 83 chiavi in cinque lingue; esempi spese 150/785/1550 EUR e saldi 50/65/250 EUR. Esempi, non tariffe attuali né budget precompilati. I token `{name}`, `{date}`, `{time}` ecc. restano invarianti. |
| 50 anni | `Festa_dei_50_anni.html`, `libfile_043c84501da481919c4fab674948ba8a`, 276414 byte, aggiornato 18/11/2026 | Proposta editoriale letta: sé/altra persona, cena intima/musica/sorpresa; checklist, programma, inviti, moduli ricordi, tre preventivi modificabili, regalo condiviso separato dal budget festa, catalogo IT/EN/ES/FR/DE. Non trovata attestazione di approvazione complessiva. Il calcolatore browser non è persistenza nell’app. |

Questi tre file sono stati risolti, letti e successivamente recuperati byte per byte in docs/events/birthday e docs/events/fifty. Dimensioni, SHA256 e attributi di identità confrontati; contenuti originali conservati come riferimenti editoriali, senza attivazione pubblica.

## Conservare, adattare, aggiungere

| Evento / area | Conservare | Adattare | Aggiungere prima di dichiarare QA |
|---|---|---|---|
| Compleanno | Slug/alias; ID `venue`, `food`, `extras` e relative voci in `src/features/events/birthday/config.ts`; tassonomia dettagliata come opzione successiva; tre asset attuali come storico | Percorso breve senza età 30, invitati 30 e budget 3000 precompilati da `birthday.ts`; etichette inglesi config/pagina; scadenze secondo formula; fotografia casa/ristorante/sala con testo HTML | Ruolo sé/altri e formula, salvataggio/rientro autorevole, budget assente distinto da zero, acconti, messaggi privi di note private, traduzioni e QA isolamento. Attendere revisione delle quattro scelte aperte per l’attivazione. |
| 50 anni | Slug `fifty`, categorie e suggerimenti utili da `src/data/templates/fifty.ts`, struttura riutilizzabile da Compleanno | Distinguere cinquant’anni senza stili/servizi premium imposti; cena/musica/sorpresa; inviti e gestione arrivi privati; scadenze; alias storici seed solo come riferimento | Momento ricordi facoltativo, permesso per foto/messaggi, eventuale registro regalo separato, persistenza e isolamento, localizzazione e fotografia mobile. Nessuna attivazione dalla sola presenza dei seed. |
| Prima Comunione | Slug, nome approvato, categorie pertinenti, componenti comuni invitati/location | Categorie e messaggi italiani nelle cinque lingue; tavoli e quote per famiglia se supportate; tono solenne; immagine ingresso chiesa | Programma cerimonia/pranzo, presenze distinte, dati strutturati famiglie se nel perimetro approvato, scadenze relative e isolamento; risolvere rotta dichiarata/effettiva. |
| Laurea | Slug e scelte nome/voce/fotografia; categorie pertinenti | Rotta dichiarata `/graduation` vs `/laurea`; checklist/RSVP legacy in localStorage verso dati per evento; orari indipendenti e comunicazione aggiornamento | Scenari brindisi/cena/locale con dati strutturati, proclamazione data/ora anche da definire, programma, messaggi sicuri e QA multi-evento. |
| Cresima | Slug, campi e preferenze richieste, cinque lingue e scenari del pacchetto | Nome tedesco proposto `Firmung` coerente col contesto; ruoli rinominabili e incontri concordati, nessuna prescrizione universale | Percorso sé/altri, data da definire, cerimonia/ritrovo/ricevimento, persistenza e checklist relative; risolvere rotta `/confirmation` vs `/cresima`. |
| Comunità scelta / Ritrovo | Etichette approvate del Battesimo e moduli già verificati PR94/95 | Riconciliare soltanto eventuali differenze documentali con il codice corrente | Nessun nuovo evento autonomo senza una decisione di prodotto esplicita. |

## Dipendenze tecniche osservate

- `src/app/api/my/birthday-dashboard/route.ts`: la selezione storica usa `limit(1)` e il POST cancella spese prima dell’inserimento. Non collegare questo percorso al nuovo selettore; riutilizzare risoluzione autorevole dell’evento e mutazioni atomiche del candidato corrente. La protezione proxy non rende l’implementazione legacy pronta.
- `src/app/api/my/fifty-dashboard/route.ts`: seleziona il primo evento dell’utente (`order(created_at).limit(1)`), quindi non certifica isolamento del cinquantenario. Integrare tramite evento esplicito e autorizzazione autorevole; non riattivare automaticamente API o seed.
- Template in `src/data/templates/{birthday,fifty,communion,graduation,confirmation}.ts`, API `my/*-dashboard`, seed SQL e tre JPG per ciascun tipo sono presenti. Presenza statica non è QA. Non eseguiti seed.
- I cataloghi operativi sono `messages/{it,en,fr,es,de}.json` nel checkout attuale; alcune mappe editoriali storiche parlano di `src/messages`: verificare il percorso reale prima dell’importazione. Controllare token e chiavi duplicate senza sovrascrivere i testi già verificati dei tre eventi.
- I tre asset per evento esistono; questa attività non ha ispezionato i pixel, quindi le osservazioni grafiche dei pacchetti restano editoriali/storiche. Validare alt e ritaglio sulle immagini effettivamente usate prima del QA.

## Prossima lavorazione concreta

1. Recupero completato: docs/events/birthday/Compleanno_Revisione.docx, Compleanno_Testi_e_budget.xlsx e docs/events/fifty/Festa_dei_50_anni.html. Byte e SHA256 confrontati con gli originali; nessuna riscrittura dei contenuti. Mantenere i pacchetti nello stesso branch.
2. Importare le sole scelte editoriali già approvate in un catalogo tipizzato isolato e nelle traduzioni, con nessuna attivazione pubblica. Conservare le proposte Compleanno/50 come materiale di revisione.
3. Progettare un adattatore comune per party `birthday`/`fifty` che usi l’evento corrente autorevole e mutazioni atomiche, conservando dati e acconti. Non usare le vecchie API selezionanti il primo evento.
4. Verificare il primo percorso in ambiente isolato: creazione, riapertura, cambio con gli altri tre eventi, budget/spese/pagamenti, invitati/inviti e checklist; poi estendere agli altri scenari e lingue. Nessun PASS esteso dai tre eventi esistenti.

Stato inventario: completato come lettura statica e recupero riferimenti. Integrazione funzionale dei cinque nuovi eventi: da eseguire. Approvazione editoriale complessiva Compleanno e 50 anni: non attestata. Safari/iOS reale: non verificato da questa attività.
