# 🚀 Deployment Guide - Il Budget degli Sposi

## Architettura CI/CD

```
VS Code (local) 
    ↓ git push
GitHub (repository)
    ↓ webhook
Vercel (hosting) → Deploy automatico
    ↓ environment variables
Supabase (database) → Già connesso
```

## Setup Iniziale

### 1. Collega GitHub a Vercel

1. Vai su [vercel.com](https://vercel.com) e fai login
2. Click **"Add New Project"**
3. Seleziona il repository **`rzirafi87-arch/Il-Budget-degli-Sposi`**
4. Configura:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 2. Configura Environment Variables su Vercel

Nel dashboard Vercel → Settings → Environment Variables, aggiungi:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE=your-service-role-key
```

**IMPORTANTE**: 
- Seleziona **Production**, **Preview**, e **Development** per ogni variabile
- Non committare mai `.env.local` su Git!

### 3. Configura GitHub Secrets

Vai su GitHub → Settings → Secrets and variables → Actions:

**Per Vercel Deploy:**
- `VERCEL_TOKEN` - Ottieni da Vercel → Settings → Tokens
- `VERCEL_ORG_ID` - Ottieni da Vercel → Settings → General
- `VERCEL_PROJECT_ID` - Ottieni da Vercel → Settings → General

**Per Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL` - La URL del tuo progetto
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon public key
- `SUPABASE_SERVICE_ROLE` - Service role (ATTENZIONE: mai esporre!)
- `SUPABASE_PROJECT_REF` - Project reference ID (opzionale)
- `SUPABASE_ACCESS_TOKEN` - Personal access token (opzionale)

### 4. Abilita Deployment su Vercel

Una volta configurato, ogni push su `main` triggererà automaticamente:
1. ✅ Lint check
2. ✅ Build verifica
3. ✅ Deploy su Vercel
4. ✅ Aggiornamento live del sito

## Workflow Quotidiano

### Sviluppo locale
```bash
# Lavora in VS Code
git add .
git commit -m "feat: nuova funzionalità"
git push origin main
```

### Deploy automatico
- GitHub Actions verifica il build
- Se passa, Vercel deploya automaticamente
- Ricevi notifica email da Vercel con URL live

### Database updates
- Modifica i file `supabase-*.sql`
- Committa su GitHub
- Esegui manualmente nel Supabase SQL Editor (per sicurezza)
- *Opzionale*: Configura GitHub Action per auto-migration

## Come ottenere i Token

### Vercel Token
1. Vai su [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click **"Create Token"**
3. Nome: "GitHub Actions Deploy"
4. Copia il token e aggiungilo ai GitHub Secrets

### Vercel Org ID e Project ID
1. Vai sul tuo progetto Vercel
2. Settings → General
3. Copia **Team ID** (Org ID) e **Project ID**

### Supabase Access Token (opzionale)
1. Vai su [app.supabase.com](https://app.supabase.com)
2. Account → Access Tokens
3. Click **"Generate new token"**
4. Copia e aggiungi ai GitHub Secrets

## Monitoring

### Vercel Dashboard
- Vedi tutti i deployment su vercel.com/dashboard
- Logs in tempo reale
- Rollback con un click

### GitHub Actions
- Vedi build status nel tab "Actions"
- Notifiche via email per fallimenti

### Supabase Dashboard
- Monitora database performance
- Vedi query logs
- Gestisci RLS policies

## Branch Strategy (consigliato)

```
main (production)
  ↓
  develop (staging)
  ↓
  feature/nome-feature
```

### Configurazione branches
Vercel può deployare automaticamente:
- `main` → Produzione (il-budget-degli-sposi.vercel.app)
- `develop` → Staging (il-budget-degli-sposi-git-develop.vercel.app)
- Feature branches → Preview URLs automatici

## Troubleshooting

### Build fallisce su Vercel
1. Verifica che le env variables siano settate
2. Controlla i logs nel Vercel Dashboard
3. Testa build locale: `npm run build`

### Database non aggiornato
1. Le migration SQL vanno eseguite manualmente in Supabase
2. Non sono auto-applicate per sicurezza
3. Usa il SQL Editor nel Supabase Dashboard

### Changes non visibili dopo deploy
1. Hard refresh: Ctrl+Shift+R
2. Vercel cache: può richiedere 1-2 minuti
3. Controlla che il deployment sia completato

## Next Steps

1. ✅ Aggiungi `vercel.json` e `.github/workflows/*.yml` al repo
2. ✅ Configura secrets su GitHub
3. ✅ Collega repository a Vercel
4. ✅ Fai primo push e verifica deploy
5. ✅ Testa con modifiche piccole

## Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [GitHub Actions](https://github.com/rzirafi87-arch/Il-Budget-degli-Sposi/actions)
- [Supabase Dashboard](https://app.supabase.com)
- [Deployment Logs](https://vercel.com/rzirafi87-arch/il-budget-degli-sposi/deployments)
