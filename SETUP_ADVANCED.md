# 🚀 Setup Guide - Funzionalità Avanzate Abbonamenti

Questa guida spiega come configurare le funzionalità avanzate del sistema di abbonamenti: **Stripe**, **Email**, **Cron Jobs** e **Analytics**.

---

## 📋 Prerequisiti

1. Database Supabase configurato
2. Account Vercel (per deployment e cron jobs)
3. Account Stripe (per pagamenti)
4. Account Resend (per email transazionali)

---

## 1️⃣ Setup Database

### Script SQL da eseguire in ordine:

```bash
# 1. Schema base abbonamenti
supabase-subscription-packages-patch.sql

# 2. Analytics tracking
supabase-analytics-patch.sql
```

Vai su **Supabase Dashboard** → **SQL Editor** e incolla il contenuto di ciascun file, poi clicca **Run**.

### Verifica installazione:

```sql
-- Controlla tabelle create
SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
AND tablename IN ('subscription_packages', 'subscription_transactions', 'analytics_events');

-- Verifica pacchetti inseriti
SELECT tier, name_it, price_monthly, price_yearly FROM subscription_packages ORDER BY display_order;
```

---

## 2️⃣ Stripe Configuration

### Crea account Stripe

1. Vai su https://stripe.com e registrati
2. Vai a **Developers** → **API Keys**
3. Copia:
   - **Publishable key** (`pk_test_...`)
   - **Secret key** (`sk_test_...`)

### Setup Webhook

1. Vai a **Developers** → **Webhooks** → **Add endpoint**
2. Endpoint URL: `https://your-domain.vercel.app/api/stripe/webhook`
3. Seleziona eventi:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
4. Copia il **Signing secret** (`whsec_...`)

### Variabili Ambiente Vercel

Vai su **Vercel Dashboard** → **Settings** → **Environment Variables**:

```
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

---

## 3️⃣ Resend Email Configuration

### Crea account Resend

1. Vai su https://resend.com e registrati
2. Vai a **API Keys** → **Create API Key**
3. Copia la chiave (`re_...`)

### Verifica dominio (Opzionale ma consigliato)

1. Vai a **Domains** → **Add Domain**
2. Aggiungi il tuo dominio (es: `ilbudgetdeglisposi.it`)
3. Configura i record DNS:
   - **TXT** record per verifica
   - **MX**, **TXT (SPF)**, **CNAME (DKIM)** per autenticazione

### Variabili Ambiente Vercel

```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### Test Email (locale)

Crea `.env.local`:

```
RESEND_API_KEY=re_xxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 4️⃣ Cron Job Configuration

Il cron job è già configurato in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-subscriptions",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Schedule:** Ogni giorno alle 9:00 UTC

### Protezione Endpoint

Genera un secret per proteggere il cron:

```bash
# Su Linux/Mac
openssl rand -base64 32

# Su Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Aggiungi la variabile:

```
CRON_SECRET=your-random-secret-here
```

### Test Manuale

```bash
curl -X GET https://your-domain.vercel.app/api/cron/check-subscriptions \
  -H "Authorization: Bearer your-random-secret-here"
```

Risposta attesa:

```json
{
  "success": true,
  "timestamp": "2025-01-26T09:00:00.000Z",
  "results": {
    "expired": 2,
    "warnings_sent": 5,
    "errors": []
  }
}
```

---

## 5️⃣ Analytics Setup

Gli analytics sono già configurati e tracciati automaticamente. Nessuna configurazione aggiuntiva richiesta!

### Come funziona

Quando un utente:
- **Visualizza** un profilo fornitore → `profile_view` event
- **Clicca** su contatti → `contact_click` event
- **Clicca** su sito web → `website_click` event

I dati vengono salvati in `analytics_events` e aggregati nelle colonne:
- `profile_views`
- `contact_clicks`
- `website_clicks`

### Dashboard Analytics

I fornitori **Premium** e **Premium Plus** vedono le statistiche in `/fornitori-dashboard`.

---

## 6️⃣ Test Completo

### 1. Test Stripe Checkout (Modalità Test)

1. Vai su `/pacchetti-fornitori`
2. Clicca su "Acquista Ora" per un piano
3. Usa carta di test: `4242 4242 4242 4242`
   - CVV: qualsiasi 3 cifre
   - Data: qualsiasi data futura
4. Completa il pagamento
5. Verifica redirect a `/fornitori-dashboard?payment=success`
6. Controlla database:

```sql
SELECT * FROM subscription_transactions ORDER BY created_at DESC LIMIT 1;
SELECT subscription_tier, subscription_expires_at FROM suppliers WHERE id = 'your-supplier-id';
```

### 2. Test Email

Controlla la tua email dopo aver completato un acquisto. Dovresti ricevere:
- Email di conferma attivazione abbonamento

### 3. Test Cron Job

Simula una scadenza:

```sql
-- Imposta scadenza a ieri per test
UPDATE suppliers 
SET subscription_tier = 'premium', 
    subscription_expires_at = NOW() - INTERVAL '1 day'
WHERE id = 'your-test-supplier-id';
```

Esegui manualmente il cron:

```bash
curl -X GET https://your-domain.vercel.app/api/cron/check-subscriptions \
  -H "Authorization: Bearer your-cron-secret"
```

Verifica downgrade:

```sql
SELECT subscription_tier FROM suppliers WHERE id = 'your-test-supplier-id';
-- Dovrebbe tornare 'free'
```

---

## 7️⃣ Go Live - Produzione

### Stripe Produzione

1. Attiva account Stripe (verifica identità)
2. Vai a **Developers** → **API Keys** → Passa a **Live mode**
3. Copia le nuove chiavi (`pk_live_...` e `sk_live_...`)
4. Aggiorna webhook per produzione
5. Aggiorna variabili Vercel **Production**:

```
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx (non test!)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx (nuovo da live webhook)
```

### Resend Produzione

- Se hai verificato il dominio, le email verranno da `noreply@ilbudgetdeglisposi.it`
- Altrimenti, verranno da `onboarding@resend.dev` (gratis ma meno professionale)

### Monitoring

- **Stripe Dashboard**: https://dashboard.stripe.com
  - Vedi tutti i pagamenti in tempo reale
  - Logs, errori, rimborsi
- **Resend Dashboard**: https://resend.com/emails
  - Email inviate, bounce, click rate
- **Vercel Logs**: https://vercel.com/your-project/logs
  - Controlla esecuzioni cron job
  - Errori API

---

## 🔒 Sicurezza

### Chiavi API

**MAI** committare chiavi API nel codice:
- ✅ Usa solo variabili ambiente
- ✅ Aggiungi `.env.local` a `.gitignore`
- ✅ Ruota le chiavi ogni 6 mesi

### Webhook Verification

Il webhook Stripe usa `stripe.webhooks.constructEvent()` che verifica la firma. Questo previene attacchi:
- ✅ Solo Stripe può chiamare il webhook
- ✅ Payload non può essere manipolato

### Cron Secret

Il cron job richiede `Authorization: Bearer <secret>`:
- ✅ Solo Vercel può chiamarlo (con il secret)
- ✅ Cambia il secret se viene compromesso

---

## 📊 Prezzi e Limiti

### Stripe

- **Transazioni**: 1.4% + €0.25 per transazione (EU)
- **Nessun canone mensile**

### Resend

- **Gratis**: 100 email/giorno
- **Pro** ($20/mese): 50,000 email/mese
- **Enterprise**: Illimitate

### Vercel Cron

- **Gratis**: Fino a 100 esecuzioni/giorno
- **Pro**: Illimitate

---

## 🆘 Troubleshooting

### Pagamenti non completano

1. Controlla webhook configurato correttamente
2. Verifica logs Stripe Dashboard → **Developers** → **Webhooks** → Click sul webhook
3. Controlla Vercel logs per errori

### Email non arrivano

1. Verifica dominio configurato su Resend
2. Controlla spam/promozioni
3. Verifica logs Resend Dashboard

### Cron job non esegue

1. Verifica `vercel.json` deployed
2. Controlla Vercel Dashboard → **Settings** → **Cron Jobs**
3. Esegui manualmente per testare

### Analytics non traccia

1. Verifica `supabase-analytics-patch.sql` eseguito
2. Controlla RLS policies abilitate
3. Verifica chiamate API `/api/analytics/track` nei logs browser

---

## 🎯 Next Steps

Opzionali ma consigliati:

1. **Stripe Customer Portal** - Per gestire abbonamenti ricorrenti
2. **Refund API** - Implementa rimborsi
3. **Invoice Generation** - Genera fatture PDF
4. **Advanced Analytics** - Grafici settimanali/mensili con Chart.js
5. **A/B Testing** - Test prezzi diversi

---

## 📚 Risorse

- [Stripe Docs](https://stripe.com/docs/payments/checkout)
- [Resend Docs](https://resend.com/docs/introduction)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Tutto pronto! 🎉** 

Il tuo sistema di abbonamenti è ora completo con pagamenti, email, auto-rinnovo e analytics!
