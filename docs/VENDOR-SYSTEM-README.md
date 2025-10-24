# 🎯 Sistema Vendor Normalizzato - Quick Start

## ✨ Cosa Hai Adesso

Un **sistema professionale multi-sorgente** per aggregare fornitori matrimonio da fonti **legali e aperte**:

✅ **Google Places API** - Location, chiese, band, planner, fotografi  
✅ **OpenStreetMap** - Chiese, castelli, ville storiche (GRATIS)  
✅ **Schema Normalizzato** - Deduplica automatica, geocoding, rating  
✅ **API REST** - Sync automatico + ricerca pubblica  
✅ **Frontend React** - Component completo con filtri  

**Zero scraping** → **Zero rischi legali** → **Dati sempre aggiornati**

---

## 🚀 Setup Rapido (5 minuti)

### 1. Database Setup

Esegui in Supabase SQL Editor (in ordine):

```sql
-- 1. Schema normalizzato (vendors, places, vendor_places, sync_jobs)
supabase-normalized-vendors-schema.sql

-- 2. (Opzionale) Migra dati esistenti da locations/churches/suppliers
supabase-migration-legacy-to-normalized.sql
```

### 2. Google API Key

1. Vai su [Google Cloud Console](https://console.cloud.google.com)
2. Abilita **Places API (New)**
3. Crea API Key
4. Aggiungi a `.env.local`:

```env
GOOGLE_PLACES_API_KEY=AIzaSy...
```

**Costi:** $200 credito gratuito/mese (sufficiente per ~2000 sync)

### 3. Test Manuale

```bash
# Avvia dev server
npm run dev

# Test Google Places sync
curl "http://localhost:3000/api/sync/places?region=Sicilia&type=location"

# Test OSM sync (GRATIS)
curl "http://localhost:3000/api/sync/osm?area=Provincia%20di%20Agrigento&type=church"

# Cerca vendors
curl "http://localhost:3000/api/vendors?type=location&region=Sicilia&minRating=4.0"
```

### 4. Usa il Frontend

Visita: http://localhost:3000/esplora-fornitori

Component già pronto con filtri per:
- Tipo (location, church, planner, band, dj, photographer, ecc.)
- Regione, Provincia, Città
- Rating minimo
- Fascia prezzo (€ - €€€€)
- Solo verificati

---

## 📁 File Creati

### Database
- `supabase-normalized-vendors-schema.sql` - Schema completo con funzioni
- `supabase-migration-legacy-to-normalized.sql` - Migrazione dati esistenti

### Backend API
- `src/app/api/sync/places/route.ts` - Google Places sync
- `src/app/api/sync/osm/route.ts` - OpenStreetMap sync
- `src/app/api/vendors/route.ts` - Public search endpoint

### Frontend
- `src/components/VendorExplorer.tsx` - React component completo
- `src/app/esplora-fornitori/page.tsx` - Pagina pubblica

### Scripts
- `scripts/sync-all-vendors.mjs` - Batch sync tutte le regioni

### Docs
- `docs/VENDOR-SYNC-GUIDE.md` - Documentazione completa (70+ sezioni)

---

## 🎮 Come Usarlo

### Opzione A: Sync Manuale (Controllo Totale)

```bash
# Sync location in Sicilia da Google
curl "http://localhost:3000/api/sync/places?region=Sicilia&type=location"

# Sync chiese da OSM (gratis)
curl "http://localhost:3000/api/sync/osm?area=Sicilia&type=church"
```

### Opzione B: Batch Sync (Tutte le Regioni)

```bash
# Dry run (vedi stime costi)
node scripts/sync-all-vendors.mjs --dry-run

# Sync solo Sicilia, solo location
node scripts/sync-all-vendors.mjs --region=Sicilia --type=location

# Sync chiese da OSM (GRATIS) per tutte le regioni
node scripts/sync-all-vendors.mjs --type=church --osm-only

# Full sync (Google + OSM, tutte regioni, tutti tipi)
# ⚠️  COSTO STIMATO: ~$100-150
node scripts/sync-all-vendors.mjs
```

### Opzione C: Cron Automatico (Raccomandato)

Setup in Supabase Dashboard → Database → Cron Jobs:

```sql
-- Sync settimanale location Sicilia (Lunedì 2 AM)
SELECT cron.schedule(
  'sync-vendors-sicilia',
  '0 2 * * 1',
  $$
  SELECT net.http_get(
    'https://your-domain.com/api/sync/places?region=Sicilia&type=location'
  );
  $$
);
```

---

## 💰 Costi Stimati

### Google Places API

| Scenario | Ricerche | Costo |
|----------|----------|-------|
| **1 Regione, 1 Tipo** (es: Sicilia location) | ~60 | ~$3 |
| **1 Regione, Tutti Tipi** (9 tipi) | ~540 | ~$27 |
| **Tutte Regioni, 1 Tipo** (20 regioni) | ~1,200 | ~$60 |
| **FULL SYNC** (20 regioni × 9 tipi) | ~10,800 | **~$540** |

**Ottimizzazioni:**
- Cache 7 giorni (evita re-sync) → **-80% costi**
- Limita a 100 risultati per sync → **-50% costi**
- Usa OSM per chiese → **GRATIS**

**Raccomandato:** Sync incrementale settimanale per regione (~$3/settimana)

### OpenStreetMap (Overpass)

**SEMPRE GRATIS** ✅  
Perfetto per chiese (più complete di Google)

---

## 🔍 Query Utili

### Top 50 Location per Rating

```sql
SELECT name, city, region, rating, rating_count, website
FROM vendors_with_places
WHERE type = 'location' AND rating >= 4.5
ORDER BY rating DESC, rating_count DESC
LIMIT 50;
```

### Statistiche per Regione

```sql
SELECT * FROM top_vendors_by_region 
WHERE type = 'location' 
ORDER BY vendor_count DESC;
```

### Chiese Storiche (da OSM)

```sql
SELECT name, city, description, 
       metadata->>'osm_tags'->>'heritage:operator' as heritage
FROM vendors_with_places
WHERE type = 'church' 
  AND source = 'osm'
  AND metadata->>'osm_tags'->>'heritage:operator' IS NOT NULL;
```

### Vendor Senza Coordinate (da fixare)

```sql
SELECT name, type, source FROM vendors v
LEFT JOIN vendor_places vp ON v.id = vp.vendor_id
WHERE vp.place_id IS NULL;
```

---

## 🎨 Personalizzazione Frontend

### Aggiungi a Pagina Esistente

```tsx
import VendorExplorer from "@/components/VendorExplorer";

export default function MyPage() {
  return (
    <div>
      <h1>I Nostri Fornitori</h1>
      <VendorExplorer 
        initialType="location" 
        initialRegion="Sicilia" 
      />
    </div>
  );
}
```

### Filtri Personalizzati

```tsx
// Solo chiese in Toscana, rating 4.5+
<VendorExplorer 
  initialType="church" 
  initialRegion="Toscana"
  initialFilters={{ minRating: 4.5, verified: true }}
/>
```

### Integra con Evento Utente

```tsx
const { userEvent } = useUserContext();
const userRegion = userEvent?.region || "Sicilia";

<VendorExplorer 
  initialRegion={userRegion} 
  onSelectVendor={(vendor) => {
    // Salva fornitore nell'evento
    saveSupplierToEvent(vendor);
  }}
/>
```

---

## 🐛 Troubleshooting

### "GOOGLE_PLACES_API_KEY not configured"

```bash
# Verifica .env.local
cat .env.local | grep GOOGLE_PLACES_API_KEY

# Restart server
npm run dev
```

### Costi Troppo Alti

1. Riduci scope: `--region=Sicilia --type=location`
2. Usa cache: rimuovi `--force`
3. OSM per chiese: `--osm-only --type=church`

### Deduplica Non Funziona

Controlla priorità in `find_or_create_place()`:
- Google Place ID > OSM ID > Wikidata QID
- Verifica con: `SELECT * FROM places WHERE google_place_id IS NOT NULL AND osm_id IS NOT NULL`

### Overpass Timeout

Area troppo grande. Usa provincia invece di regione:
```bash
# ❌ Troppo largo
?area=Sicilia

# ✅ Meglio
?area=Provincia di Palermo
```

---

## 📊 Metriche di Successo

Dopo il primo sync, dovresti avere:

- ✅ **500-1000 location** per regione principale (Sicilia, Lombardia, Lazio)
- ✅ **200-500 chiese** per provincia (OSM molto completo)
- ✅ **100-300 planner/band/fotografi** per regione
- ✅ **Rating 4.0+** per 60-70% dei vendor
- ✅ **Coordinate GPS** per 95%+ dei vendor
- ✅ **Telefono/Website** per 80%+ dei vendor verificati

---

## 🚢 Deploy in Produzione

### Vercel/Netlify

1. Aggiungi environment variables:
   - `GOOGLE_PLACES_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE`

2. Deploy:
```bash
vercel --prod
# oppure
netlify deploy --prod
```

### Supabase Edge Function (Cron)

1. Crea `supabase/functions/sync-vendors/index.ts`
2. Deploy: `supabase functions deploy sync-vendors`
3. Setup cron in Dashboard → Database → Cron

---

## 📚 Documentazione Completa

Vedi `docs/VENDOR-SYNC-GUIDE.md` per:
- 🔧 Setup dettagliato Google Cloud
- 💡 Query Overpass API avanzate
- 📸 Sync foto da Google Places
- 🤖 Automazione con Edge Functions
- 💵 Cost breakdown completo
- 🔒 GDPR e compliance
- 🌐 Wikidata integration

---

## 🎯 Prossimi Step Raccomandati

1. **Primo Sync** (oggi):
   ```bash
   node scripts/sync-all-vendors.mjs --region=Sicilia --type=location,church
   ```

2. **Test Frontend** (oggi):
   - Visita `/esplora-fornitori`
   - Prova filtri e ricerca
   - Verifica card vendor

3. **Espandi Regioni** (questa settimana):
   ```bash
   node scripts/sync-all-vendors.mjs --region=Lombardia,Lazio,Toscana
   ```

4. **Setup Cron** (questa settimana):
   - Configurazione Supabase Edge Function
   - Schedule settimanale per regione prioritaria

5. **Espandi Tipi** (prossimo mese):
   - Fotografi, videomaker, band
   - Wedding planner, fioristi

---

## 💬 Supporto

- **Bug/Issues:** Vedi `VENDOR-SYNC-GUIDE.md` → Troubleshooting
- **Costi Google:** [Pricing Calculator](https://cloud.google.com/products/calculator)
- **OSM Overpass:** [Wiki Guide](https://wiki.openstreetmap.org/wiki/Overpass_API)

---

**Fatto!** 🎉 Hai un sistema enterprise-grade per vendor matrimonio con zero scraping e costi controllati.
