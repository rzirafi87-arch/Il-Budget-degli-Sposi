# 🚀 Guida Deployment Vercel - Il Budget degli Sposi

## ✅ Prerequisiti (GIÀ COMPLETATI)

- [x] Account GitHub con repository `Il-Budget-degli-Sposi`
- [x] Codice pushato su branch `main`
- [x] Build di produzione testata e funzionante
- [x] Database Supabase configurato e popolato

---

## 📋 Checklist Deployment

### 1️⃣ **Account Vercel**
- [ ] Crea account su [vercel.com](https://vercel.com)
- [ ] Collega account GitHub a Vercel
- [ ] Autorizza accesso al repository `Il-Budget-degli-Sposi`

### 2️⃣ **Import Progetto**
1. Vai su [vercel.com/new](https://vercel.com/new)
2. Seleziona "Import Git Repository"
3. Cerca e seleziona `rzirafi87-arch/Il-Budget-degli-Sposi`
4. Clicca "Import"

### 3️⃣ **Configurazione Variabili d'Ambiente**

Nella sezione "Environment Variables" di Vercel, aggiungi TUTTE queste variabili:

#### **Variabili Pubbliche** (visibili nel browser)
```
NEXT_PUBLIC_SUPABASE_URL = https://vsguhivizuneylqhygfk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = <configure-in-vercel>
NEXT_PUBLIC_APP_NAME = Il Budget degli Sposi
NEXT_PUBLIC_ENVIRONMENT = production
```

#### **Variabili Private** (solo server-side)
```
SUPABASE_SERVICE_ROLE = <configure-in-vercel-never-commit>
GOOGLE_PLACES_API_KEY = <configure-in-vercel-never-commit>
```

⚠️ **IMPORTANTE**: Assicurati che ogni variabile sia disponibile per:
- ✅ Production
- ✅ Preview
- ✅ Development

### 4️⃣ **Deploy**
1. Clicca su "Deploy"
2. Aspetta che Vercel completi il build (3-5 minuti)
3. Vercel ti fornirà un URL tipo: `https://il-budget-degli-sposi.vercel.app`

---

## 🔧 Configurazione Post-Deployment

### **Supabase Authentication Callback**
1. Vai su Supabase Dashboard → Authentication → URL Configuration
2. Aggiungi l'URL di Vercel ai "Redirect URLs":
   ```
   https://il-budget-degli-sposi.vercel.app/auth
   https://il-budget-degli-sposi.vercel.app
   ```

### **Google Places API**
Verifica che la tua API key Google Places abbia:
- ✅ Places API (New) abilitata
- ✅ Billing account collegato (richiesto da Google)
- ✅ Restrizioni URL impostate (opzionale per sicurezza):
  - `https://il-budget-degli-sposi.vercel.app/*`
  - `https://*.vercel.app/*` (per preview deployments)

---

## 🧪 Test Post-Deployment

Dopo il deployment, testa:

1. **Homepage** → `https://your-app.vercel.app`
2. **Health Check** → `https://your-app.vercel.app/api/health`
3. **Autenticazione** → Prova login/signup
4. **Dashboard** → Accedi e verifica che i dati vengano caricati
5. **Sync Endpoints** → Testa `/api/sync/places?region=Sicilia&type=location`

---

## 🔄 Workflow Automatico

Ogni volta che fai `git push origin main`:
1. ✅ Vercel rileva automaticamente le modifiche
2. ✅ Esegue nuovo build
3. ✅ Deploya automaticamente in produzione
4. ✅ Fornisce URL di preview per ogni commit

---

## 📊 Monitoraggio

Dashboard Vercel fornisce:
- 📈 Analytics (visite, performance)
- 🐛 Error logs
- 📊 Function logs (API routes)
- ⚡ Performance metrics

---

## 🆘 Troubleshooting

### Errore: "Module not found"
- Verifica che tutte le dipendenze siano in `package.json`
- Controlla che i path alias `@/` siano configurati in `tsconfig.json`

### Errore: "Environment variables not found"
- Controlla di aver aggiunto TUTTE le variabili in Vercel
- Verifica che siano abilitate per Production/Preview/Development

### Errore 500 sugli API routes
- Controlla i logs in Vercel Dashboard → Functions
- Verifica che `SUPABASE_SERVICE_ROLE` sia configurato correttamente

### Database non accessibile
- Verifica che Supabase non abbia restrizioni IP
- Controlla che le credenziali siano corrette

---

## 💰 Costi

**Vercel (Piano Hobby - GRATUITO):**
- ✅ 100GB bandwidth/mese
- ✅ 100 build hours/mese
- ✅ Deployments illimitati
- ✅ Domini custom illimitati
- ✅ SSL automatico

**Supabase (Piano Free):**
- ✅ 500MB database
- ✅ 1GB file storage
- ✅ 50,000 utenti attivi/mese
- ✅ Unlimited API requests

**Google Places API:**
- 💳 $200 crediti gratuiti/mese
- 💵 $17 per 1000 richieste Places API dopo i crediti gratuiti
- ⚠️ **Richiede carta di credito collegata**

---

## 🎯 Dominio Personalizzato (Opzionale)

1. Vai su Vercel Dashboard → Settings → Domains
2. Aggiungi il tuo dominio (es. `ilbudgetdeglisposi.it`)
3. Configura i DNS secondo le istruzioni Vercel
4. SSL viene configurato automaticamente

---

## ✅ Checklist Finale

Prima di dichiarare "ONLINE":
- [ ] Deployment completato senza errori
- [ ] Homepage carica correttamente
- [ ] Autenticazione funziona (signup/login)
- [ ] Dashboard mostra dati
- [ ] Endpoint API rispondono correttamente
- [ ] Supabase callback configurato
- [ ] Google Places API key funzionante
- [ ] Testato su mobile
- [ ] Logs Vercel senza errori critici

---

## 🚀 Prossimi Step

Dopo il deployment:
1. Configura Google Analytics (opzionale)
2. Aggiungi sitemap.xml per SEO
3. Configura robots.txt
4. Imposta monitoring con Sentry (error tracking)
5. Pianifica backup database Supabase

---

**Pronto per andare online! 🎉**
