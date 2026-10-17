# Branch 53 — Product truth inventory

Base autorevole: `main@7aaf48c0736fa50187864145f1d7d41fc1265014`.

Questa matrice è il gate di verità del prodotto per il Branch 53: una superficie
non persistente o non consegnabile non deve restituire un successo fittizio né
presentare una CTA operativa.

| Superficie | Stato al preflight | Stato dopo 53.0 | Destinazione |
|---|---|---|---|
| Documenti | simulata in memoria client con `URL.createObjectURL` | fail-closed, upload disabilitato e dichiarato non disponibile | 53.1: Storage privato + `event_documents` |
| Lista nozze | route verso tabella assente + demo anonima | demo anonima rimossa; accesso richiede evento autenticato | 53.2: `gift_list_items` persistente |
| Tavoli | dati reali ma GET anonimo restituiva vuoto demo | GET/POST protetti dal resolver evento canonico | 53.3: CRUD/assegnazioni transazionali e capacità |
| Save the Date PDF/config | reale | invariato | già disponibile |
| Save the Date video | alert “coming soon” dietro CTA operativa | CTA disabilitata e marcata non disponibile | fuori Branch 53 |
| Contatto pubblico | successo demo/best-effort senza coda reale | `503 CONTACT_UNAVAILABLE`, nessun falso successo | Branch 56 |

## Feedback differito al Branch 54

- Eseguire un audit visuale e UX prima di qualunque redesign per ridurre i pattern percepiti come generici o “creati dall'IA”: gerarchia, spaziatura, tipografia, densità delle card, copy, micro-interazioni, coerenza dei componenti e personalità di brand.
- Aggiungere un controllo accessibile mostra/nascondi password a login, registrazione, reset password e agli eventuali altri campi password, con `aria-label`, uso da tastiera, stato comprensibile agli screen reader e test mobile.
- Questi interventi non appartengono al Branch 53 e non devono essere implementati in questa PR.

## Regole di gate

1. Nessuna risposta `demo:true` o ID `demo-*` nelle superfici del Branch 53.
2. Nessun upload Documenti locale può essere presentato come persistenza.
3. Le route evento-scoped non restituiscono dataset demo a un anonimo.
4. Nessuna CTA genera un “successo” per una feature non implementata.
5. Le milestone successive possono riabilitare una superficie solo insieme a
   persistenza, autorizzazione e test previsti dalla roadmap.
