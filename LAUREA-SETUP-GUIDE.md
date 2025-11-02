# 🚀 Laurea - Setup Veloce

## ✅ Cosa è incluso
- SQL seed: `supabase-graduation-event-seed.sql`
- Template: `src/data/templates/graduation.ts`
- API seed: `POST /api/graduation/seed/[eventId]`
- API dashboard: `GET/POST /api/my/graduation-dashboard`
- Ensure-Default: integrazione per `eventType=graduation`
- Tabs/Frontend: NavTabs + header visibili per Laurea

---

## 🧪 Test Rapido

### 1) Database (opzionale in locale)
```powershell
node scripts/run-sql.mjs supabase-graduation-event-seed.sql
```

### 2) Primo accesso Laurea
- Vai a `/select-event-type` → scegli "Laurea"
- Verrai portato su `/dashboard`
- Al primo accesso: create event + seed categorie

### 3) API Demo
- Senza login: `GET /api/my/graduation-dashboard` → ritorna demo template
- Con login: ritorna dati reali dal DB

---

## 📊 Dati
- 10 categorie, 42+ sottocategorie
- Percentuali budget pronte per Idea di Budget
- Budget singolo (spese comuni)

---

## 🧩 Integrazione Nav
- `NavTabs.tsx`: aggiunto `graduationTabs`
- `ClientLayoutShell.tsx`: visibilità Tabs per `eventType === 'graduation'`

---

## 📌 Note Tecniche
- Seed idempotente (ON CONFLICT lato SQL)
- Endpoint con JWT (service role server-side)
- Demo mode per GET se non autenticati

**Status**: ✅ Ready
