# 🚀 Vercel Deployment Guide

## Configurazione Iniziale

### 1. Impostazioni Git

**Percorso:** Settings → Git

- **Production Branch:** `main`
- **Auto-Deploy:** ✅ Enabled
- **Deploy Hooks:** Opzionale (per trigger manuali)

### 2. Promuovere Preview a Production

Quando hai un deployment Preview funzionante che vuoi rendere Production:

1. Vai su **Deployments**
2. Trova il deployment Preview che funziona correttamente
3. Clicca sui tre puntini (`...`) → **Promote to Production**
4. Conferma la promozione

**Risultato:** Quel deployment diventa immediatamente Production e sarà servito sul dominio principale.

---

## Domini e SSL

### 3. Collegare un Dominio Custom

**Percorso:** Settings → Domains

1. Clicca **Add Domain**
2. Inserisci il tuo dominio (es. `ilbudgetdeglisposi.com`)
3. Vercel ti mostrerà i record DNS da configurare:
   - **A Record** → `76.76.21.21` (IP Vercel)
   - **CNAME** per `www` → `cname.vercel-dns.com`
4. Vai sul tuo provider DNS (es. Cloudflare, Namecheap, GoDaddy)
5. Aggiungi i record DNS come indicato
6. Torna su Vercel e clicca **Verify**

**Tempo di propagazione:** 5-48 ore (di solito < 1 ora)

**SSL:** Vercel genera automaticamente certificati SSL gratuiti tramite Let's Encrypt.

---

## Environment Variables

### 4. Impostare le Variabili d'Ambiente

**Percorso:** Settings → Environment Variables

Aggiungi le seguenti variabili per tutti gli ambienti (Production, Preview, Development):

#### Variabili Pubbliche (NEXT_PUBLIC_*)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**✅ Environment:** Production, Preview, Development

#### Variabili Server-only (NO NEXT_PUBLIC_*)

```env
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres
```

**✅ Environment:** Production, Preview, Development

**⚠️ Encrypted:** ✅ (default per variabili sensibili)

#### API Keys Opzionali (solo server)

Se usi servizi esterni, aggiungi:

```env
# Mappe e Geocoding
GOOGLE_MAPS_API_KEY=AIzaSy...
MAPBOX_ACCESS_TOKEN=pk.eyJ1...

# Web Scraping
APIFY_API_TOKEN=apify_api_...

# Email (se usi Resend)
RESEND_API_KEY=re_...

# Pagamenti (se usi Stripe)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**✅ Environment:** Production (obbligatorio), Preview/Development (opzionale se usi credenziali di test)

---

## Re-Deploy Dopo Modifiche

### 5. Quando Rifare il Deploy

Devi rifare il deploy quando:

- ✅ Modifichi le **Environment Variables**
- ✅ Aggiungi nuove **dipendenze** (`package.json`)
- ✅ Cambi **configurazioni** (`next.config.ts`, `middleware.ts`)
- ❌ **NON** serve per modifiche di codice (auto-deploy da Git)

**Come:**
1. Deployments → Tre puntini del deployment corrente → **Redeploy**
2. Oppure: fai un push vuoto su Git (`git commit --allow-empty -m "trigger redeploy"`)

---

## Verifica Deployment

### 6. Checklist Post-Deploy

Dopo ogni deploy, verifica:

- [ ] **Build Status:** ✅ Ready (non "Error" o "Canceled")
- [ ] **Domains:** Il dominio custom risponde correttamente
- [ ] **SSL:** Il certificato è valido (lucchetto verde nel browser)
- [ ] **Environment Variables:** Vai su Settings → Environment Variables e verifica che siano tutte presenti
- [ ] **API Routes:** Testa almeno `/api/health` per verificare che il server risponda
- [ ] **Supabase Connection:** Testa login/logout per verificare che la connessione DB funzioni

**Comando rapido per testare:**

```bash
curl https://tuodominio.com/api/health
# Risposta attesa: { "status": "ok" }
```

---

## Rollback

### 7. Tornare a un Deployment Precedente

Se un deploy va male:

1. Vai su **Deployments**
2. Trova un deployment funzionante precedente
3. Tre puntini → **Promote to Production**

**Risultato:** Rollback istantaneo senza dover rifare il build.

---

## Logs e Debugging

### 8. Visualizzare i Log

**Percorso:** Deployment Details → **Runtime Logs**

Filtra per:
- **Errors:** Mostra solo errori
- **Function:** Filtra per una specifica API route

**Best Practice:**
- Usa `console.log()` in sviluppo
- Usa un logger strutturato (`@/lib/logger`) in production per tracciare errori critici

---

## Monitoraggio

### 9. Analytics e Performance

Vercel fornisce analytics integrati:

- **Web Vitals:** Core Web Vitals (LCP, FID, CLS)
- **Traffic:** Richieste per route
- **Bandwidth:** Consumo dati
- **Serverless Function Execution:** Tempo di esecuzione API routes

**Percorso:** Analytics (tab superiore)

**Alert:** Configura webhook Discord/Slack per notifiche deploy falliti.

---

## Troubleshooting

### 10. Problemi Comuni

#### Build Fallito

**Errore:** `Command "npm run build" exited with 1`

**Soluzione:**
1. Controlla i log del build su Vercel
2. Replica localmente: `npm run build`
3. Fixa gli errori TypeScript/ESLint
4. Riprova il deploy

#### 404 su Tutte le Route

**Problema:** Vercel non trova le route dell'App Router

**Soluzione:**
- Verifica che `next.config.ts` abbia `output: 'standalone'` rimosso (non serve per Vercel)
- Controlla che `src/app/` esista e contenga `layout.tsx` e `page.tsx`

#### Environment Variables Non Rilevate

**Problema:** `process.env.NEXT_PUBLIC_SUPABASE_URL` è `undefined`

**Soluzione:**
1. Settings → Environment Variables → Verifica che siano impostate per **Production**
2. **Redeploy** il progetto (le env vars non si applicano a deploy esistenti)
3. Per variabili `NEXT_PUBLIC_*`, verifica di averle usate nel codice **client-side**

#### Dominio Non Raggiungibile

**Problema:** `ERR_NAME_NOT_RESOLVED`

**Soluzione:**
- Verifica i record DNS sul tuo provider
- Usa `dig ilbudgetdeglisposi.com` per controllare la propagazione DNS
- Attendi fino a 48h per propagazione completa (di solito < 1h)

---

## Checklist Finale

Prima di andare live in production:

- [ ] Production branch è `main`
- [ ] Auto-deploy è abilitato
- [ ] Dominio custom configurato e SSL attivo
- [ ] Environment variables impostate per Production
- [ ] Database RLS policies attive
- [ ] Backup automatici DB configurati (Supabase Dashboard)
- [ ] Monitoring attivo (Vercel Analytics)
- [ ] Webhook Discord/Slack per notifiche deploy (opzionale)

---

## Link Utili

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://app.supabase.com
- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment

---

**Data ultimo aggiornamento:** 5 Novembre 2025  
**Versione guida:** 1.0
