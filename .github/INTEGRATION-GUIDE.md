# Guida Integrazione GitHub - Supabase - Vercel

Questo documento descrive come le varie piattaforme sono integrate nel progetto **Il Budget degli Sposi**.

## 🔄 Flusso di Sviluppo Completo

```
Sviluppo Locale (VS Code)
         ↓
    Git Commit
         ↓
    GitHub Push
         ↓
  Vercel Deploy (automatico)
         ↓
    Production Live
```

## 🐙 GitHub

### Repository Setup
- **Owner**: rzirafi87-arch
- **Repo**: Il-Budget-degli-Sposi
- **Branch principale**: `main`
- **Branch di sviluppo**: `dev` (opzionale)

### GitHub Actions (Future)
Il progetto è pronto per integrare GitHub Actions per:
- CI/CD automatizzato
- Test automatici pre-deploy
- Lint e type checking
- Build verification

**File da creare** (quando necessario): `.github/workflows/ci.yml`

### Secrets GitHub (per Actions)
Quando configuri GitHub Actions, aggiungi questi secrets:
- `SUPABASE_ACCESS_TOKEN` - Token API Supabase
- `SUPABASE_DB_PASSWORD` - Password database
- `VERCEL_TOKEN` - Token deploy Vercel
- `VERCEL_ORG_ID` - Organization ID Vercel
- `VERCEL_PROJECT_ID` - Project ID Vercel

## 🗄️ Supabase

### Progetto Configurato
- **Project ID**: vsguhivizuneylqhygfk
- **URL**: https://vsguhivizuneylqhygfk.supabase.co
- **Region**: East US (iad1)

### Variabili d'Ambiente Necessarie
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://vsguhivizuneylqhygfk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE=<service_role_key>
SUPABASE_DB_URL=postgres://postgres:<password>@db.vsguhivizuneylqhygfk.supabase.co:5432/postgres
```

### Database Management

**Locale (Docker)**:
```powershell
# Avvia container
docker-compose up -d

# Esegui migrations
npm run db:migrate

# Seed dati
npm run db:seed
```

**Cloud (Supabase)**:
- Via Dashboard UI: SQL Editor
- Via VS Code: Task `Run SQL: Current File (Supabase Cloud)`
- Via CLI: `supabase db push` (se configurato)

### Supabase CLI Setup (Opzionale)
```powershell
# Installa CLI
npm install -g supabase

# Login
supabase login

# Link progetto
supabase link --project-ref vsguhivizuneylqhygfk

# Pull schema
supabase db pull

# Push migrations
supabase db push
```

### Storage Buckets
Configurati in `supabase-storage-policies.sql`:
- `wedding-documents` - Documenti utente
- `venue-photos` - Foto location
- `supplier-logos` - Loghi fornitori

### Row Level Security (RLS)
Tutte le tabelle hanno RLS abilitato. Policies definite in:
- `supabase-COMPLETE-SETUP.sql`
- `supabase-*-policies.sql`

### Realtime Subscriptions (Future)
Il progetto può abilitare realtime per:
- Aggiornamenti budget in tempo reale
- Notifiche collaborazione sposi
- Sync multi-device

## 🚀 Vercel

### Progetto Configurato
- **Project Name**: il-budget-degli-sposi
- **Framework**: Next.js
- **Region**: Washington, D.C., USA (iad1)
- **Production Domain**: ilbudgetdeglisposi.it (da configurare)

### Deploy Automatico
Vercel deploya automaticamente:
- **Production**: Ogni push su `main`
- **Preview**: Ogni Pull Request

### Environment Variables (Vercel Dashboard)
Configurare in: Settings → Environment Variables

**Production**:
```
NEXT_PUBLIC_SUPABASE_URL=https://vsguhivizuneylqhygfk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE=<service_role_key>
NEXT_PUBLIC_APP_NAME=Il Budget degli Sposi
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_SITE_URL=https://ilbudgetdeglisposi.it
```

**Preview** (opzionale):
- Stesse variabili di Production
- `NEXT_PUBLIC_ENVIRONMENT=preview`

### Build Settings
Già configurate in `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

### Cron Jobs
Configurato in `vercel.json`:
```json
"crons": [
  {
    "path": "/api/cron/check-subscriptions",
    "schedule": "0 9 * * *"
  }
]
```

### Deploy da VS Code
Con l'estensione Vercel:
1. `Ctrl+Shift+P`
2. `Vercel: Deploy Production`
3. Oppure: `Vercel: Deploy Preview`

### Deploy da CLI
```powershell
# Installa Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy preview
vercel

# Deploy production
vercel --prod
```

### Domain Setup
1. In Vercel Dashboard: Settings → Domains
2. Aggiungi: `ilbudgetdeglisposi.it`
3. Configura DNS secondo istruzioni Vercel
4. Aggiorna `NEXT_PUBLIC_SITE_URL` in env vars

## 🔗 Integrazioni tra Piattaforme

### GitHub ↔ Vercel
**Status**: ✅ Configurato

- Vercel collegato al repository GitHub
- Deploy automatico su push
- Preview deployments per PR
- Build logs visibili in Vercel dashboard

**Webhook GitHub**: Installato automaticamente da Vercel

### Vercel ↔ Supabase
**Status**: ✅ Configurato

- Environment variables in Vercel puntano a Supabase
- API routes usano Supabase client
- Edge functions compatibili con Supabase JS

### VS Code ↔ All Platforms
**Status**: ✅ Configurato via estensioni

- **Supabase Extension**: Query database, gestione schema
- **PostgreSQL Extension**: SQL client nativo
- **Vercel Extension**: Deploy e monitoring
- **GitHub Extensions**: PR, Copilot, source control

## 📊 Monitoring e Debugging

### Vercel Analytics
Abilitare in: Settings → Analytics
- Page views
- Web Vitals (Core Web Vitals)
- Edge network performance

### Vercel Logs
Accesso:
- Dashboard: Deployment → View Function Logs
- VS Code: `Vercel: View Logs`
- CLI: `vercel logs <deployment_url>`

### Supabase Logs
Dashboard: Logs → Postgres Logs
- Query slow
- Errors
- Connections

### Error Tracking (Future)
Integrare Sentry o similar:
```bash
npm install @sentry/nextjs
```

## 🔐 Sicurezza

### Secrets Management
**MAI committare**:
- `.env.local`
- `.env.production`
- Chiavi API
- Password database

**Usare**:
- `.env.local.example` con placeholder
- Vercel Environment Variables per production
- GitHub Secrets per Actions

### Supabase Security
- ✅ RLS abilitato su tutte le tabelle
- ✅ Service role key solo in API routes server-side
- ✅ Anon key esposta solo per client-side
- ✅ JWT verification in tutte le API routes

### Vercel Security Headers
Già configurato in `next.config.ts`:
```typescript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
      ],
    },
  ];
}
```

## 🚨 Troubleshooting Integrazioni

### Deploy Vercel fallisce
1. Controlla build logs in Vercel dashboard
2. Verifica env vars siano settate correttamente
3. Testa build locale: `npm run build`
4. Controlla limiti Vercel (se free tier)

### Supabase connection timeout
1. Verifica URL e credenziali
2. Controlla se database è in pausa (free tier)
3. Testa connessione da PostgreSQL client
4. Verifica connection pooling settings

### GitHub push non triggera deploy
1. Verifica integrazione Vercel-GitHub
2. Controlla webhook GitHub: Settings → Webhooks
3. Re-connetti Vercel al repository
4. Verifica branch settings in Vercel

### VS Code extensions non funzionano
1. Riavvia VS Code
2. Verifica autenticazione account
3. Reinstalla estensione problematica
4. Controlla `.vscode/settings.json`

## 📋 Checklist Setup Nuovo Ambiente

### Locale
- [ ] Clone repository
- [ ] `npm install`
- [ ] Copia `.env.local.example` → `.env.local`
- [ ] Compila variabili d'ambiente
- [ ] `docker-compose up -d`
- [ ] Esegui migrations: Task `Init schema + patches`
- [ ] `npm run dev`
- [ ] Test: http://localhost:3000

### Staging/Production
- [ ] Push su GitHub
- [ ] Verifica deploy Vercel automatico
- [ ] Configura env vars in Vercel
- [ ] Testa deployment preview
- [ ] Merge su `main` per production
- [ ] Configura domain custom
- [ ] Abilita Vercel Analytics
- [ ] Configura Supabase production policies

---

**Progetto**: Il Budget degli Sposi  
**Ultima modifica**: Novembre 2025  
**Maintainer**: rzirafi87-arch
