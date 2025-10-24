# 🔑 Come Generare una Nuova Google API Key (Sicura)

## 📋 STEP 1: Revoca la Vecchia Key (URGENTE)

### 1.1 Accedi a Google Cloud Console
1. Vai su [console.cloud.google.com](https://console.cloud.google.com)
2. Accedi con il tuo account Google
3. Seleziona il progetto attuale (o creane uno nuovo)

### 1.2 Revoca la Key Esposta
1. Nel menu laterale → **APIs & Services** → **Credentials**
2. Trova la key: `AIzaSyCn_d4D8Y174q4NF4Z373iCTFp0JWClwSA`
3. Clicca sui **3 puntini** (...) a destra
4. Clicca **"Delete"** o **"Revoke"**
5. Conferma la cancellazione

⚠️ **Importante:** Questa key è pubblica su GitHub, DEVE essere revocata!

---

## 🆕 STEP 2: Genera Nuova API Key

### 2.1 Crea Nuova Key
1. Sempre in **Credentials** → clicca **"+ CREATE CREDENTIALS"**
2. Seleziona **"API key"**
3. Google genera automaticamente una nuova key
4. ✅ **Copia subito la key** in un posto sicuro (notepad)

### 2.2 Restrizioni HTTP Referrers (Sicurezza)
Subito dopo la creazione:

1. Clicca **"RESTRICT KEY"** (o clicca sulla key appena creata)
2. In **"Application restrictions"**:
   - Seleziona **"HTTP referrers (web sites)"**
   - Clicca **"ADD AN ITEM"**
   - Aggiungi questi referrer:
     ```
     https://il-budget-degli-sposi.vercel.app/*
     https://*.vercel.app/*
     http://localhost:3000/*
     ```
   - Clicca **"Done"**

3. In **"API restrictions"**:
   - Seleziona **"Restrict key"**
   - Cerca e seleziona **SOLO**:
     - ✅ **Places API (New)**
   - Deseleziona tutto il resto
   - Clicca **"OK"**

4. Clicca **"SAVE"** in basso

**Esempio Screenshot Configurazione:**
```
┌─────────────────────────────────────────────┐
│ Application restrictions                    │
├─────────────────────────────────────────────┤
│ ○ None                                      │
│ ● HTTP referrers (web sites)               │
│   Website restrictions:                     │
│   • https://il-budget-degli-sposi.vercel.app/*│
│   • https://*.vercel.app/*                  │
│   • http://localhost:3000/*                 │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ API restrictions                            │
├─────────────────────────────────────────────┤
│ ○ Don't restrict key                       │
│ ● Restrict key                             │
│   APIs:                                     │
│   ✅ Places API (New)                       │
└─────────────────────────────────────────────┘
```

---

## ✅ STEP 3: Abilita Places API (se non già fatto)

### 3.1 Verifica API Abilitata
1. Menu laterale → **APIs & Services** → **Library**
2. Cerca **"Places API (New)"**
3. Se vedi **"MANAGE"** → già abilitata ✅
4. Se vedi **"ENABLE"** → clicca per abilitarla

### 3.2 Billing Account (OBBLIGATORIO)
Google Places API **richiede** carta di credito collegata:

1. Menu laterale → **Billing**
2. Se non hai account billing:
   - Clicca **"Link a billing account"**
   - Segui wizard per aggiungere carta di credito
3. **Tranquillo:** Google dà **$200 crediti gratis/mese**
   - Places API costa ~$17 per 1000 richieste
   - Con uso normale = 100% coperto dai crediti gratuiti

### 3.3 Imposta Budget Alert (Opzionale ma Consigliato)
1. In **Billing** → **Budgets & alerts**
2. Clicca **"CREATE BUDGET"**
3. Imposta:
   - Budget: **$50/mese**
   - Alert soglia: **50%**, **90%**, **100%**
4. Inserisci email per notifiche
5. Salva

Ti avviserà se superi i crediti gratuiti!

---

## 🔐 STEP 4: Aggiorna la Key su Vercel

### 4.1 Accedi a Vercel
1. Vai su [vercel.com](https://vercel.com)
2. Seleziona progetto **"Il-Budget-degli-Sposi"**
3. Vai su **Settings** → **Environment Variables**

### 4.2 Aggiorna la Variabile
1. Trova `GOOGLE_PLACES_API_KEY`
2. Clicca su **"Edit"** (icona matita)
3. **Sostituisci** il valore con la nuova key appena generata
4. Assicurati che sia abilitata per:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Clicca **"Save"**

### 4.3 Redeploy
Vercel **richiede redeploy** per applicare la nuova variabile:

1. Vai su **Deployments**
2. Trova l'ultimo deployment
3. Clicca sui **3 puntini** → **"Redeploy"**
4. Conferma

Oppure fai un commit qualsiasi:
```bash
git commit --allow-empty -m "chore: trigger redeploy with new API key"
git push origin main
```

---

## 🏠 STEP 5: Aggiorna su Localhost

### 5.1 File .env.local
1. Apri il file `.env.local` nel progetto
2. Trova la riga:
   ```env
   GOOGLE_PLACES_API_KEY=AIzaSyCn_d4D8Y174q4NF4Z373iCTFp0JWClwSA
   ```
3. Sostituisci con la nuova key:
   ```env
   GOOGLE_PLACES_API_KEY=LA_TUA_NUOVA_KEY_QUI
   ```
4. Salva il file

### 5.2 Riavvia Dev Server
```bash
# Ferma il server (Ctrl+C)
# Riavvia
npm run dev
```

---

## ✅ STEP 6: Testa la Nuova Key

### 6.1 Test Locale
```bash
# Nel browser o con curl
http://localhost:3000/api/sync/places?region=Sicilia&type=location
```

Risposta attesa:
```json
{
  "success": true,
  "region": "Sicilia",
  "type": "location",
  "count": 120,
  "message": "Synced 120 vendors..."
}
```

### 6.2 Test su Vercel
```
https://il-budget-degli-sposi.vercel.app/api/sync/places?region=Sicilia&type=location
```

Se ricevi errore tipo:
```json
{
  "error": "Google Places API error: 403 - API key not valid"
}
```

Possibili cause:
- ⏱️ Aspetta 5-10 minuti (propagazione restrizioni)
- 🔍 Verifica che referrer sia corretto nelle restrizioni
- 🔄 Fai redeploy su Vercel

---

## 🎯 CHECKLIST FINALE

- [ ] Revocata vecchia key da Google Cloud Console
- [ ] Generata nuova key
- [ ] Impostate restrizioni HTTP referrers
- [ ] Impostate restrizioni API (solo Places API New)
- [ ] Places API abilitata nel progetto
- [ ] Billing account collegato
- [ ] Budget alert configurato (opzionale)
- [ ] Variabile aggiornata su Vercel
- [ ] Redeploy eseguito su Vercel
- [ ] File .env.local aggiornato localmente
- [ ] Test locale funzionante
- [ ] Test produzione funzionante

---

## 🆘 Problemi Comuni

### "API key not valid. Please pass a valid API key"
**Soluzione:** 
- Verifica che hai abilitato "Places API (New)" (non "Places API" vecchia!)
- Aspetta 5-10 minuti per propagazione

### "This API project is not authorized to use this API"
**Soluzione:**
- Vai su APIs & Services → Library
- Cerca "Places API (New)"
- Clicca ENABLE

### "You must enable Billing on the Google Cloud Project"
**Soluzione:**
- Vai su Billing
- Collega carta di credito
- $200 crediti gratis/mese coprono tutto l'uso normale

### "CORS error" o "Referer blocked"
**Soluzione:**
- Verifica HTTP referrers nelle restrizioni
- Assicurati di aver aggiunto:
  - `https://il-budget-degli-sposi.vercel.app/*`
  - `https://*.vercel.app/*`

---

## 💰 Costi Previsti

Con l'uso normale del tuo sito:

**Crediti Google Gratuiti:** $200/mese
**Costo Places API:** ~$17 per 1000 richieste

**Stima uso normale:**
- 100 sync al giorno = 3000/mese
- 3 richieste per sync = 9000 richieste/mese
- Costo: ~$153/mese
- **Coperto 100% dai crediti gratuiti!** ✅

Solo se superi 11.000+ richieste/mese inizierai a pagare.

---

## 📞 Supporto

**Google Cloud Support:**
- Documentazione: [cloud.google.com/docs](https://cloud.google.com/docs)
- Forum: [stackoverflow.com/questions/tagged/google-cloud-platform](https://stackoverflow.com/questions/tagged/google-cloud-platform)

**Places API (New) Docs:**
- [developers.google.com/maps/documentation/places/web-service/op-overview](https://developers.google.com/maps/documentation/places/web-service/op-overview)

---

**Fatto! La nuova key è sicura e funzionante! 🔐✨**
