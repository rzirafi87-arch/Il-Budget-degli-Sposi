# Sistema di Pacchetti Abbonamento Fornitori

## Panoramica
Sistema di monetizzazione a 4 livelli per fornitori wedding, simile a Matrimonio.com ma con prezzi più competitivi.

## Tiers di Abbonamento

### 1. **Gratuito** (€0/mese)
- Creazione profilo fornitore
- Gestione dati di contatto
- **NON visibile** nelle ricerche pubbliche
- Solo per registrare la propria attività

### 2. **Base** (€29.90/mese | €299/anno)
- Tutto di Gratuito, più:
- Appare **solo nella pagina della propria categoria** (es: `/fotografi`)
- Profilo con foto e descrizione
- Dati di contatto visibili
- Badge "Fornitore Certificato"
- **NON appare** in `/fornitori` (hub)
- **NON appare** nella Demo (utenti non autenticati)

### 3. **Premium** (€69.90/mese | €699/anno)
- Tutto di Base, più:
- Appare nella **pagina hub `/fornitori`**
- Posizione prioritaria nei risultati
- Galleria fino a 10 foto
- Statistiche visualizzazioni profilo
- Badge "Fornitore Premium"
- **NON appare** nella Demo (utenti non autenticati)

### 4. **Premium Plus** (€129.90/mese | €1299/anno) 👑
- Tutto di Premium, più:
- **Appare nella Demo per utenti NON registrati** (massima visibilità!)
- Posizione TOP nei risultati di ricerca
- Galleria illimitata
- Link diretto al sito web evidenziato
- Supporto dedicato
- Badge "Partner Ufficiale"
- Analytics avanzate

## Logica di Visibilità

### Per Utenti NON Autenticati (Demo)
```
Vedono SOLO fornitori con:
- subscription_tier = 'premium_plus'
- subscription_expires_at > NOW()
- verified = true
```

### Per Utenti Autenticati
```
Vedono fornitori con:
- subscription_tier IN ('base', 'premium', 'premium_plus')
- subscription_expires_at > NOW() (oppure tier = 'free' sempre attivo)
- verified = true

Filtri aggiuntivi:
- Base: visibile SOLO se category filter è applicato
- Premium: visibile in hub + category
- Premium Plus: visibile ovunque
```

## Struttura Database

### Nuove Colonne (suppliers, locations, churches)
```sql
subscription_tier TEXT DEFAULT 'free' 
  CHECK (subscription_tier IN ('free', 'base', 'premium', 'premium_plus'))
  
subscription_expires_at TIMESTAMP WITH TIME ZONE

is_featured BOOLEAN DEFAULT false
```

### Tabella `subscription_packages`
```sql
- id (UUID)
- tier (TEXT, unique)
- name_it (TEXT) - Nome italiano del pacchetto
- description_it (TEXT)
- price_monthly (DECIMAL)
- price_yearly (DECIMAL)
- features (JSONB) - Array di feature
- display_order (INTEGER)
- is_active (BOOLEAN)
```

### Tabella `subscription_transactions`
```sql
- id (UUID)
- supplier_id (FK a suppliers)
- location_id (FK a locations) 
- church_id (FK a churches)
- tier (TEXT)
- amount (DECIMAL)
- currency (TEXT, default 'EUR')
- billing_period ('monthly' | 'yearly')
- payment_provider ('stripe', 'paypal', etc.)
- payment_id (TEXT) - ID esterno del pagamento
- status ('pending' | 'completed' | 'failed' | 'refunded')
- starts_at (TIMESTAMP)
- expires_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

## Funzioni SQL

### `is_subscription_active(tier, expires_at)`
Verifica se un abbonamento è attivo controllando il tier e la data di scadenza.

### `get_visible_suppliers(category, region, province, is_demo)`
Ritorna i fornitori visibili in base al contesto (demo vs autenticato) e ai filtri applicati.

## API Endpoints

### `GET /api/subscription-packages`
Ritorna tutti i pacchetti attivi ordinati per `display_order`.

### `GET /api/my/supplier-profile`
Ritorna il profilo fornitore dell'utente autenticato (se esiste).

### `GET /api/my/subscription-transactions`
Ritorna lo storico transazioni del fornitore autenticato.

### `GET /api/suppliers`
**Modificato** per implementare filtro tier:
- Se NON autenticato: solo `premium_plus` attivi
- Se autenticato: `base`, `premium`, `premium_plus` attivi

## Pagine Frontend

### `/pacchetti-fornitori`
Mostra i 4 pacchetti con:
- Toggle Mensile/Annuale
- Calcolo risparmio automatico
- FAQ
- CTA contatti

### `/fornitori-dashboard`
Dashboard fornitore con:
- Stato abbonamento corrente
- Giorni rimanenti
- Info visibilità
- Storico transazioni
- Link per upgrade/cambio piano

## Prossimi Passi

1. ✅ Schema SQL creato (`supabase-subscription-packages-patch.sql`)
2. ✅ API routes aggiornate
3. ✅ Pagine frontend create
4. ⏳ **Integrazione Stripe/PayPal** per pagamenti reali
5. ⏳ **Email notifications** per scadenze abbonamenti
6. ⏳ **Cron job** per disattivare abbonamenti scaduti
7. ⏳ **Analytics dashboard** per fornitori Premium/Premium Plus

## Installazione

1. Esegui lo script SQL in Supabase:
   ```bash
   # Via SQL Editor in Supabase Dashboard
   supabase-subscription-packages-patch.sql
   ```

2. Verifica che le policies RLS siano attive:
   ```sql
   SELECT * FROM subscription_packages; -- Deve essere pubblico (read-only)
   ```

3. Deploy del codice su Vercel (auto-deploy da Git)

## Prezzi Competitivi

| Piano | Nostro (Mensile) | Nostro (Annuale) | Matrimonio.com (stima) | Risparmio |
|-------|------------------|------------------|------------------------|-----------|
| Base | €29.90 | €299 | ~€49/mese | **~39%** |
| Premium | €69.90 | €699 | ~€99/mese | **~29%** |
| Premium Plus | €129.90 | €1299 | ~€149/mese | **~13%** |

**Nota**: Prezzi stimati basati su ricerche di mercato. Matrimonio.com non pubblica listini ufficiali.

## Supporto

Per domande o assistenza: [info@ilbudgetdeglisposi.it](mailto:info@ilbudgetdeglisposi.it)
