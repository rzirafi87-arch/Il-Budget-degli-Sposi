# Sistema Normalizzato Multi-Sorgente per Fornitori Matrimonio

## 📚 Panoramica

Sistema professionale per aggregare fornitori matrimonio da **fonti aperte e legali**:
- ✅ **Google Places API** (wedding_venue, church, planner, band, ecc.)
- ✅ **OpenStreetMap** via Overpass API (chiese, castelli, ville storiche)
- ✅ **Wikidata** (opzionale, dati enciclopedici)

**Zero scraping commerciale** → **Zero rischi legali** → **Dati ufficiali e aggiornati**

---

## 🏗️ Architettura

### Database Schema (Normalizzato)

```sql
vendors (fornitori unificati)
├── id, name, type, phone, email, website
├── rating, rating_count, price_range
├── source ('google' | 'osm' | 'wikidata' | 'manual')
├── source_id (google_place_id | osm:node/123 | Q12345)
└── metadata (JSONB per dati specifici)

places (luoghi geografici deduplicati)
├── id, google_place_id, osm_id, wikidata_qid
├── lat, lng, address, city, province, region
└── deduplica per priorità: Google > OSM > Wikidata

vendor_places (relazione N:N)
├── vendor_id ↔ place_id
└── is_primary (sede principale)

sync_jobs (tracking sincronizzazioni)
├── source, type, region, status
└── results_count, error_message, timestamps
```

### Funzioni PostgreSQL

- `normalize_phone(text)` → Formato E.164 (+39xxxxxxxxxx)
- `normalize_url(text)` → Sempre https://
- `find_or_create_place(...)` → Deduplica intelligente per IDs
- `upsert_vendor(...)` → Inserimento/aggiornamento atomico

---

## 🚀 Setup

### 1. Database Setup

Esegui in Supabase SQL Editor:

```bash
# In ordine:
1. supabase-normalized-vendors-schema.sql  # Schema + funzioni
```

### 2. Environment Variables

Aggiungi a `.env.local`:

```env
# Google Places API (NEW)
GOOGLE_PLACES_API_KEY=AIza...

# Supabase (già esistenti)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE=eyJhbGc...
```

**Come ottenere Google API Key:**

1. Vai su [Google Cloud Console](https://console.cloud.google.com)
2. Crea nuovo progetto (o seleziona esistente)
3. Abilita **Places API (New)** 
4. Crea credenziali → API Key
5. Limita chiave a "Places API (New)" per sicurezza
6. **Costo:** $200 credito gratuito/mese, poi $32/1000 ricerche

### 3. Installazione Dipendenze

```bash
npm install
# Già incluso: Next.js, Supabase client
```

---

## 📡 API Endpoints

### `/api/sync/places` - Google Places Sync

Sincronizza fornitori da Google Places API.

**Parametri:**
- `region` (required): Regione italiana (es: "Sicilia", "Lombardia")
- `type` (required): Tipo fornitore
  - `location` → wedding_venue, banquet_hall, event_venue
  - `church` → place_of_worship, church
  - `planner` → wedding planner
  - `band` → band matrimonio
  - `dj` → dj matrimonio
  - `photographer` → fotografo matrimonio
  - `videographer` → videomaker
  - `florist` → fiorista
  - `caterer` → catering
- `force` (optional): `true` per forzare risincronizzazione (ignora cache 7 giorni)

**Esempio:**

```bash
# Sincronizza location ricevimento in Sicilia
GET /api/sync/places?region=Sicilia&type=location

# Risposta:
{
  "success": true,
  "region": "Sicilia",
  "type": "location",
  "count": 47,
  "newCount": 35,
  "message": "Synced 47 vendors (35 new) for location in Sicilia"
}
```

**Rate Limiting:**
- 50ms tra chiamate Place Details
- 1000ms tra keyword diverse
- 2000ms tra pagine
- Max 100 risultati per sync (limita costi)

---

### `/api/sync/osm` - OpenStreetMap Sync

Sincronizza da OpenStreetMap (Overpass API) - **GRATIS**.

**Parametri:**
- `area` (required): Nome area OSM (es: "Provincia di Agrigento", "Sicilia")
- `type` (required): `church` o `location`
- `region` (optional): Regione italiana per categorizzazione

**Esempio:**

```bash
# Sincronizza chiese da OSM in provincia di Agrigento
GET /api/sync/osm?area=Provincia di Agrigento&type=church&region=Sicilia

# Risposta:
{
  "success": true,
  "area": "Provincia di Agrigento",
  "type": "church",
  "region": "Sicilia",
  "count": 127,
  "newCount": 115,
  "message": "Synced 127 vendors (115 new) for church in Provincia di Agrigento"
}
```

**Cosa cerca OSM:**

**Churches:**
- `amenity=place_of_worship` + `religion=christian`
- Include: cattedrali, basiliche, santuari
- Dati: nome, indirizzo, denominazione, Wikipedia link

**Locations:**
- Hotel con tag `wedding=yes`
- `amenity=events_venue`
- Castelli (`building=castle`, `historic=castle`)
- Ville storiche (`historic=manor`, `historic=villa`)

**Limiti Overpass:**
- Max 90 secondi timeout
- Richieste pubbliche gratis
- Rate limit: ~2 richieste/secondo

---

### `/api/vendors` - Public Search

Endpoint pubblico per cercare fornitori (usato dal frontend).

**Parametri:**
- `type`: Tipo fornitore
- `region`: Regione
- `province`: Provincia
- `city`: Città (like search)
- `minRating`: Rating minimo (es: 4.0)
- `verified`: `true` per solo verificati (rating ≥ 4.0)
- `priceRange`: `€`, `€€`, `€€€`, `€€€€`
- `source`: `google`, `osm`, `wikidata`, `manual`
- `limit`: Risultati per pagina (default: 50)
- `offset`: Paginazione offset

**Esempio:**

```bash
GET /api/vendors?type=location&region=Sicilia&minRating=4.0&verified=true&limit=20

# Risposta:
{
  "success": true,
  "data": [
    {
      "id": "uuid...",
      "name": "Villa Igiea",
      "type": "location",
      "rating": 4.7,
      "ratingCount": 1234,
      "priceRange": "€€€€",
      "verified": true,
      "description": "Historic luxury hotel...",
      "contact": {
        "phone": "+39091123456",
        "email": "info@villaigiea.com",
        "website": "https://villaigiea.com"
      },
      "location": {
        "lat": 38.1234,
        "lng": 13.3456,
        "city": "Palermo",
        "province": "PA",
        "region": "Sicilia"
      },
      "source": {
        "type": "google",
        "googlePlaceId": "ChIJ..."
      }
    }
  ],
  "pagination": {
    "total": 47,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## 🎨 Frontend Component

### VendorExplorer

Componente React completo con filtri e paginazione.

**Uso:**

```tsx
import VendorExplorer from "@/components/VendorExplorer";

export default function FornitorPage() {
  return <VendorExplorer initialType="location" initialRegion="Sicilia" />;
}
```

**Features:**
- ✅ Filtri: tipo, regione, città, rating, prezzo, verificato
- ✅ Paginazione automatica
- ✅ Card con rating, contatti, mappa
- ✅ Badge sorgente dati (Google/OSM)
- ✅ Responsive design

---

## ⚙️ Sincronizzazione Automatica (Cron)

### Supabase Edge Function (Raccomandato)

Crea Edge Function per sync automatico settimanale:

```typescript
// supabase/functions/sync-vendors/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const REGIONS = ["Sicilia", "Lombardia", "Lazio", /* ... */];
const TYPES = ["location", "church", "planner", "band"];

serve(async (req) => {
  const { region, type } = await req.json();
  
  // Call your sync API
  const response = await fetch(
    `https://your-domain.com/api/sync/places?region=${region}&type=${type}`,
    { headers: { "Authorization": `Bearer ${Deno.env.get("SYNC_SECRET")}` } }
  );
  
  const result = await response.json();
  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  });
});
```

**Setup Supabase Cron:**

```sql
-- In Supabase Dashboard → Database → Cron Jobs (pg_cron extension)

-- Sync weekly (every Monday at 2 AM)
SELECT cron.schedule(
  'sync-vendors-weekly',
  '0 2 * * 1',
  $$
  SELECT
    net.http_post(
      url := 'https://your-project.supabase.co/functions/v1/sync-vendors',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
      body := '{"region": "Sicilia", "type": "location"}'::jsonb
    );
  $$
);
```

---

## 💰 Costi e Budget

### Google Places API

**Pricing (2025):**
- Text Search: **$32 per 1000 ricerche**
- Place Details (Basic): **$0.017 per campo** (phone, website, rating inclusi)
- Place Details (Contact): **$0.030 per campo** (formatted_phone)
- Place Details (Atmosphere): **$0.005 per campo** (photos)

**Scenario Realistico:**

| Operazione | Quantità | Costo |
|------------|----------|-------|
| Text Search (20 regioni × 9 tipi × 3 keywords) | 540 ricerche | $17.28 |
| Place Details (540 × 20 results × 5 campi) | 54,000 campi | $91.80 |
| **TOTALE PRIMO SYNC** | - | **~$109** |
| **Aggiornamento settimanale** (10% nuovi) | - | **~$11/settimana** |

**Ottimizzazioni:**
1. Cache di 7 giorni (evita re-sync)
2. Limita a 100 risultati per sync
3. Sync incrementale (solo nuovi/modificati)
4. Usa OSM per chiese (gratis)

**Free Tier Google Cloud:**
- $200 credito gratuito primi 90 giorni
- Sufficiente per ~18 sync completi

### OpenStreetMap (Overpass API)

**Costo: GRATIS** ✅

Limiti:
- Fair use policy (non abusare)
- ~2 richieste/secondo
- Timeout 90 secondi

---

## 🔒 Privacy e Legalità

### Conformità GDPR

- ✅ Dati pubblici da fonti ufficiali (Google, OSM)
- ✅ No scraping di database privati
- ✅ Badge trasparenza sorgente dati
- ✅ Normalizzazione telefoni/URL
- ✅ Cache rispettosa (7 giorni)

### Licenze

- **Google Places:** [Terms of Service](https://developers.google.com/maps/terms)
  - ✅ OK mostrare dati con attribuzione
  - ❌ NO cache permanente senza aggiornamenti
  - ✅ OK linking a Google Maps
  
- **OpenStreetMap:** [ODbL License](https://www.openstreetmap.org/copyright)
  - ✅ OK uso commerciale
  - ✅ Richiede attribuzione "© OpenStreetMap contributors"
  - ✅ OK modifiche e derivati

### Attribuzione (Obbligatoria)

Aggiungi nel footer e nella pagina fornitori:

```html
<div class="text-xs text-gray-500">
  Dati fornitori da 
  <a href="https://developers.google.com/maps">Google Places</a> e 
  <a href="https://www.openstreetmap.org">OpenStreetMap</a>.
  © Google, © OpenStreetMap contributors
</div>
```

---

## 🎯 Piano di Rollout

### Fase 1: Setup (1 giorno)
1. ✅ Esegui `supabase-normalized-vendors-schema.sql`
2. ✅ Configura `GOOGLE_PLACES_API_KEY`
3. ✅ Test manuale: `/api/sync/places?region=Sicilia&type=location`
4. ✅ Test OSM: `/api/sync/osm?area=Sicilia&type=church`

### Fase 2: Popolamento Iniziale (2-3 giorni)
1. Sync Google Places:
   - 20 regioni × tipo `location` (~$60)
   - 20 regioni × tipo `church` (~$40)
2. Sync OSM chiese:
   - Tutte le province (GRATIS)
3. Verifica deduplica (Google vs OSM)

### Fase 3: Espansione Tipi (1 settimana)
1. Aggiungi `planner`, `photographer`, `band`, `dj`
2. Sync incrementale per region
3. Ottimizza query Overpass per location storiche

### Fase 4: Automazione (setup una tantum)
1. Configura Supabase Edge Function
2. Setup pg_cron per sync settimanale
3. Monitoring Sentry/LogRocket

---

## 🐛 Troubleshooting

### Errore: "GOOGLE_PLACES_API_KEY not configured"

```bash
# Verifica .env.local
cat .env.local | grep GOOGLE_PLACES_API_KEY

# Se mancante, aggiungi:
echo "GOOGLE_PLACES_API_KEY=AIza..." >> .env.local

# Restart dev server
npm run dev
```

### Errore: "Overpass API timeout"

Query troppo complessa o area troppo grande.

**Soluzione:**
- Riduci l'area (usa provincia invece di regione)
- Aumenta timeout nel query: `[out:json][timeout:180]`

### Deduplica non funziona

Verifica priorità nella funzione `find_or_create_place`:

```sql
-- Check duplicati
SELECT name, COUNT(*) 
FROM vendors 
GROUP BY name 
HAVING COUNT(*) > 1;

-- Check places con multipli IDs
SELECT * FROM places 
WHERE google_place_id IS NOT NULL 
  AND osm_id IS NOT NULL;
```

### Costi Google troppo alti

1. Riduci `maxResultCount` da 20 a 10
2. Aumenta cache da 7 a 14 giorni
3. Usa OSM per chiese (gratis)
4. Limita sync a regioni prioritarie

---

## 📊 Query Utili

### Statistiche per regione

```sql
SELECT * FROM top_vendors_by_region 
WHERE type = 'location' 
ORDER BY vendor_count DESC;
```

### Vendor senza coordinate

```sql
SELECT v.* 
FROM vendors v
LEFT JOIN vendor_places vp ON v.id = vp.vendor_id
WHERE vp.place_id IS NULL;
```

### Sync jobs falliti

```sql
SELECT * FROM sync_jobs 
WHERE status = 'failed' 
ORDER BY created_at DESC;
```

### Top chiese per rating

```sql
SELECT name, rating, rating_count, city, region
FROM vendors_with_places
WHERE type = 'church' AND rating >= 4.5
ORDER BY rating DESC, rating_count DESC
LIMIT 50;
```

---

## 🚀 Prossimi Step

1. **Wikidata Integration** (opzionale)
   - Query SPARQL per chiese storiche
   - Linking Q-codes a Google/OSM IDs

2. **Geocoding Inverso**
   - Google Geocoding API per provincia mancanti
   - Normalizzazione indirizzi

3. **Photo Sync**
   - Salva Google Photos in Supabase Storage
   - Thumbnail ottimizzate

4. **Review Aggregation**
   - Fetch reviews Google Places
   - Sentiment analysis (AI)

---

## 📚 Risorse

- [Google Places API (New) Docs](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Overpass API Guide](https://wiki.openstreetmap.org/wiki/Overpass_API)
- [OSM Wedding Venues Tagging](https://wiki.openstreetmap.org/wiki/Tag:amenity=events_venue)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [pg_cron Extension](https://supabase.com/docs/guides/database/extensions/pg_cron)
