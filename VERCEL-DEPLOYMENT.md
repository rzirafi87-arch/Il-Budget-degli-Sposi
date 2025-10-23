# Guida al Deployment su Vercel

## 🚀 Modifiche Necessarie per Vercel

### 1. Configurazione Immagini Esterne
✅ **COMPLETATO** - `next.config.ts` aggiornato per permettere immagini da Unsplash

### 2. Variabili d'Ambiente su Vercel

Dopo aver fatto il deploy, devi configurare le variabili d'ambiente su Vercel:

1. Vai su **Vercel Dashboard** → Il tuo progetto
2. Clicca su **Settings** → **Environment Variables**
3. Aggiungi queste variabili:

```
NEXT_PUBLIC_SUPABASE_URL=<tuo_supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tua_anon_key>
SUPABASE_SERVICE_ROLE=<tua_service_role_key>
```

### 3. Build Command
Vercel userà automaticamente:
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 4. Node.js Version
Il progetto richiede Node.js **18.17.0 o superiore**

Su Vercel, nella sezione **Settings** → **General** → **Node.js Version**, seleziona **18.x** o **20.x**

### 5. Risoluzione Problemi Comuni

#### ❌ Caroselli non visibili
**Causa**: Immagini esterne non configurate  
**Soluzione**: ✅ Già risolto in `next.config.ts`

#### ❌ Errori 500 nelle API
**Causa**: Variabili d'ambiente mancanti  
**Soluzione**: Verifica che tutte le env var siano configurate in Vercel

#### ❌ Database non accessibile
**Causa**: Supabase RLS policies o service role key errata  
**Soluzione**: Verifica che:
- Le policy RLS siano attive
- La SUPABASE_SERVICE_ROLE sia corretta
- Hai eseguito lo script `supabase-families-tables-schema.sql`

### 6. Checklist Pre-Deploy

- [x] `next.config.ts` configurato per immagini esterne
- [ ] Variabili d'ambiente configurate su Vercel
- [ ] Script SQL `supabase-families-tables-schema.sql` eseguito in Supabase
- [ ] Testato in locale con `npm run build`
- [ ] Verificato che non ci siano errori TypeScript

### 7. Test del Build Locale

Prima di deployare su Vercel, testa il build in locale:

```bash
npm run build
npm start
```

Verifica che:
- Il build completi senza errori
- I caroselli siano visibili
- Le API funzionino correttamente
- La navigazione funzioni

### 8. Deploy su Vercel

#### Metodo 1: GitHub (Consigliato)
1. Push del codice su GitHub
2. Collega il repository a Vercel
3. Vercel farà auto-deploy ad ogni push

#### Metodo 2: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
```

### 9. Post-Deploy

Dopo il primo deploy:
1. Vai all'URL di Vercel (es: `your-app.vercel.app`)
2. Testa login/signup
3. Verifica che i caroselli siano visibili
4. Crea una famiglia di test
5. Crea un tavolo di test
6. Verifica che tutto funzioni

### 10. Ottimizzazioni Future

- [ ] Sostituire immagini Unsplash con immagini locali in `/public/images/`
- [ ] Configurare CDN per immagini
- [ ] Aggiungere immagini ottimizzate con `next/image`
- [ ] Configurare caching delle immagini

## 📝 Note Importanti

- **SSR**: Il componente `ImageCarousel` è ora compatibile con SSR
- **Mobile**: I caroselli sono ottimizzati per mobile con altezza ridotta
- **Performance**: Le immagini sono lazy-loaded automaticamente
- **SEO**: Tutte le immagini hanno alt text appropriati

---

**Ultima modifica**: 23 Ottobre 2025  
**Versione Next.js**: 16.0.0  
**Node.js richiesto**: ≥18.17.0
