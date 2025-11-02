# Sistema di Abbonamenti Fornitori - Guida Completa

## 📋 Panoramica

Il sistema di abbonamenti permette ai fornitori (suppliers, locations, churches) di sottoscrivere piani a pagamento per aumentare la loro visibilità sulla piattaforma.

## 🎯 Tier di Abbonamento

### 1. **Gratuito** (Free)
- **Prezzo**: €0
- **Visibilità**: NESSUNA nelle ricerche pubbliche
- **Funzionalità**:
  - Creazione profilo fornitore
  - Gestione dati di contatto
  - NON appare nelle ricerche pubbliche

### 2. **Base**
- **Prezzo**: €29.90/mese o €299/anno (risparmio 17%)
- **Visibilità**: Solo nella pagina della categoria specifica
- **Funzionalità**:
  - Tutto di Gratuito, più:
  - Appare nella pagina categoria specifica
  - Profilo con foto e descrizione
  - Dati di contatto visibili
  - Badge "Fornitore Certificato"

### 3. **Premium**
- **Prezzo**: €69.90/mese o €699/anno (risparmio 17%)
- **Visibilità**: Hub Fornitori + categorie (NON in demo)
- **Funzionalità**:
  - Tutto di Base, più:
  - Appare nella pagina hub Fornitori
  - Posizione prioritaria nei risultati
  - Galleria fino a 10 foto
  - Statistiche visualizzazioni profilo
  - Badge "Fornitore Premium"
  - Possibilità di impostare `is_featured` (featured listings)

### 4. **Premium Plus** ⭐
- **Prezzo**: €129.90/mese o €1299/anno (risparmio 17%)
- **Visibilità**: OVUNQUE, inclusa Demo
- **Funzionalità**:
  - Tutto di Premium, più:
  - **Appare nella Demo per utenti non registrati**
  - Posizione TOP nei risultati di ricerca
  - Galleria illimitata
  - Link diretto al sito web evidenziato
  - Supporto dedicato
  - Badge "Partner Ufficiale"
  - Analytics avanzate
  - Possibilità di impostare `is_featured`

## 🗄️ Database Schema

### Tabelle Modificate

#### `suppliers`, `locations`, `churches`
```sql
subscription_tier TEXT DEFAULT 'free' 
  CHECK (subscription_tier IN ('free', 'base', 'premium', 'premium_plus'))
subscription_expires_at TIMESTAMP WITH TIME ZONE
is_featured BOOLEAN DEFAULT false
```

### Nuove Tabelle

#### `subscription_packages`
```sql
id UUID PRIMARY KEY
tier TEXT UNIQUE NOT NULL
name_it TEXT NOT NULL
description_it TEXT
price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0
price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0
features JSONB DEFAULT '[]'::jsonb
display_order INTEGER DEFAULT 0
is_active BOOLEAN DEFAULT true
created_at TIMESTAMP WITH TIME ZONE
updated_at TIMESTAMP WITH TIME ZONE
```

#### `subscription_transactions`
```sql
id UUID PRIMARY KEY
supplier_id UUID REFERENCES suppliers(id) -- One of these three
location_id UUID REFERENCES locations(id)
church_id UUID REFERENCES churches(id)
tier TEXT NOT NULL
amount DECIMAL(10,2) NOT NULL
currency TEXT DEFAULT 'EUR'
billing_period TEXT CHECK (billing_period IN ('monthly', 'yearly'))
payment_provider TEXT
payment_id TEXT
status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded'))
starts_at TIMESTAMP WITH TIME ZONE
expires_at TIMESTAMP WITH TIME ZONE
created_at TIMESTAMP WITH TIME ZONE
updated_at TIMESTAMP WITH TIME ZONE
```

## 🔌 API Endpoints

### 1. **GET `/api/subscription-packages`**
Restituisce tutti i pacchetti attivi (pubblico, no auth)

**Response:**
```json
{
  "packages": [
    {
      "id": "uuid",
      "tier": "premium",
      "name_it": "Premium",
      "description_it": "Massima visibilità nel portale",
      "price_monthly": 69.90,
      "price_yearly": 699.00,
      "features": ["feature1", "feature2"],
      "display_order": 3,
      "is_active": true
    }
  ]
}
```

### 2. **GET `/api/subscription-transactions`**
Restituisce le transazioni dell'utente autenticato

**Headers:**
- `Authorization: Bearer <jwt>`

**Response:**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "supplier_id": "uuid",
      "tier": "premium",
      "amount": 699.00,
      "billing_period": "yearly",
      "status": "completed",
      "starts_at": "2025-01-01T00:00:00Z",
      "expires_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

### 3. **POST `/api/subscription-transactions`**
Crea una nuova sottoscrizione (dopo pagamento)

**Headers:**
- `Authorization: Bearer <jwt>`

**Body:**
```json
{
  "entity_type": "supplier",
  "entity_id": "uuid",
  "tier": "premium",
  "billing_period": "yearly",
  "payment_provider": "stripe",
  "payment_id": "pi_xxxxx"
}
```

**Response:**
```json
{
  "transaction": {
    "id": "uuid",
    "supplier_id": "uuid",
    "tier": "premium",
    "amount": 699.00,
    "status": "completed"
  }
}
```

**Azioni automatiche:**
1. Verifica ownership dell'entity
2. Calcola amount e expires_at
3. Crea transaction
4. Aggiorna `subscription_tier` e `subscription_expires_at` nell'entity

### 4. **PUT `/api/subscription-featured`**
Attiva/disattiva lo stato "featured" (solo Premium/Premium Plus)

**Headers:**
- `Authorization: Bearer <jwt>`

**Body:**
```json
{
  "entity_type": "supplier",
  "entity_id": "uuid",
  "is_featured": true
}
```

**Response:**
```json
{
  "success": true,
  "entity": {
    "id": "uuid",
    "name": "Fornitore XYZ",
    "is_featured": true
  }
}
```

## 🔍 Funzioni PostgreSQL

### `is_subscription_active(tier, expires_at)`
Verifica se un abbonamento è attivo

```sql
SELECT is_subscription_active('premium', '2026-01-01'::timestamptz);
-- Returns: true/false
```

### `get_visible_suppliers(category, region, province, is_demo)`
Restituisce solo i fornitori visibili in base al tier e contesto

```sql
-- Ricerca nella categoria "Fotografi" (non demo)
SELECT * FROM get_visible_suppliers('Fotografi', NULL, NULL, false);

-- Ricerca in demo (solo Premium Plus)
SELECT * FROM get_visible_suppliers(NULL, NULL, NULL, true);
```

**Regole di visibilità:**
- **Free**: Mai visibile
- **Base**: Solo in pagine categoria specifiche (NON demo)
- **Premium**: Hub + categorie (NON demo)
- **Premium Plus**: OVUNQUE (incluso demo)

## 🎨 Pagina Pricing

**URL**: `/abbonamenti-fornitori`

Mostra tutti i piani con:
- Toggle mensile/annuale
- Calcolo risparmio annuale
- Features list
- CTA buttons
- FAQ section

## 🔒 Sicurezza (RLS)

### `subscription_packages`
```sql
-- Lettura pubblica solo pacchetti attivi
POLICY "Allow public read subscription_packages"
FOR SELECT USING (is_active = true)
```

### `subscription_transactions`
```sql
-- Utenti vedono solo le proprie transazioni
POLICY "Users can view own transactions via supplier"
FOR SELECT USING (
  supplier_id IN (SELECT id FROM suppliers WHERE user_id = auth.uid()) OR
  location_id IN (SELECT id FROM locations WHERE user_id = auth.uid()) OR
  church_id IN (SELECT id FROM churches WHERE user_id = auth.uid())
)
```

## 📊 Indici Database

```sql
-- Suppliers
idx_suppliers_subscription_tier
idx_suppliers_featured
idx_suppliers_subscription_expires

-- Locations
idx_locations_subscription_tier
idx_locations_featured
idx_locations_subscription_expires

-- Churches
idx_churches_subscription_tier
idx_churches_featured
idx_churches_subscription_expires

-- Transactions
idx_transactions_supplier
idx_transactions_location
idx_transactions_church
```

## 🚀 Deployment Checklist

### Database
- [x] Eseguire `supabase-subscription-packages-patch.sql`
- [x] Verificare creazione tabelle
- [x] Verificare inserimento pacchetti default
- [x] Testare funzioni `is_subscription_active` e `get_visible_suppliers`

### Backend
- [x] API `/api/subscription-packages` (GET)
- [x] API `/api/subscription-transactions` (GET, POST)
- [x] API `/api/subscription-featured` (PUT)

### Frontend
- [x] Pagina `/abbonamenti-fornitori`
- [ ] Integrazione pagamento (Stripe/PayPal) - TODO
- [ ] Dashboard fornitore per gestire subscription - TODO
- [ ] Badge visuali per tier diversi - TODO

## 💳 Integrazione Pagamenti (TODO)

Per completare il sistema, integrare:

1. **Stripe Checkout**:
   - Creare sessione checkout
   - Webhook per conferma pagamento
   - Aggiornare transaction a "completed"

2. **PayPal**:
   - Implementare PayPal SDK
   - Gestire success/cancel callbacks

3. **Dashboard Fornitore**:
   - Visualizzare stato abbonamento corrente
   - Upgrade/downgrade piano
   - Storico transazioni
   - Gestire auto-renewal

## 📈 Metriche & Analytics

Metriche da tracciare:
- Conversion rate per tier
- Churn rate
- Revenue mensile/annuale
- Fornitori attivi per tier
- Visualizzazioni profili premium vs free

## 🔄 Manutenzione

### Verifica abbonamenti scaduti (cron job consigliato)
```sql
-- Reset a 'free' gli abbonamenti scaduti
UPDATE suppliers 
SET subscription_tier = 'free', is_featured = false
WHERE subscription_expires_at < NOW() 
  AND subscription_tier != 'free';

-- Stesso per locations e churches
```

## 📞 Supporto

Per domande o problemi:
- Email: support@ilbudgetdeglisposi.com
- Documentazione: /docs/subscriptions
