# Documentazione Tecnica – Il Budget degli Sposi

Questa sezione raccoglie e organizza la documentazione tecnica essenziale per sviluppatori e manutentori del progetto.

## Indice

- [Panoramica Architetturale](#panoramica-architetturale)
- [Setup e Workflow](#setup-e-workflow)
- [Deploy e Ambiente](#deploy-e-ambiente)
- [Struttura Database](#struttura-database)
- [API Custom](#api-custom)
- [Componenti Principali](#componenti-principali)
- [Guide e Approfondimenti](#guide-e-approfondimenti)

---

## Panoramica Architetturale

Applicazione Next.js 16 (App Router) + React 19 + Supabase + Tailwind CSS 4. Gestione eventi, budget, fornitori, location, chiese. Pipeline Codex per sync automatico SQL → GitHub → Vercel.

- Vedi: [.github/copilot-instructions.md](../.github/copilot-instructions.md)

## Setup e Workflow

- Setup ambiente, variabili, seed database, pipeline Codex.
- Vedi: [.github/copilot-instructions.md](../.github/copilot-instructions.md)
- Vedi: [MATRIMONIO-SETUP-GUIDE.md](../MATRIMONIO-SETUP-GUIDE.md)

## Deploy e Ambiente

- Guida deploy su Vercel, variabili ambiente, post-deploy.
- Vedi: [DEPLOYMENT-GUIDE.md](../DEPLOYMENT-GUIDE.md)

## Struttura Database

- Schema tabelle, relazioni, seed, patch.
- Vedi: [.github/copilot-instructions.md](../.github/copilot-instructions.md)
- Vedi: [CHECKLIST_SQL_SEEDS.md](../CHECKLIST_SQL_SEEDS.md)

## API Custom

- Documentare endpoint custom in `/app/api/` (pattern, parametri, esempi risposta).
- TODO: Elenco e dettagli endpoint.

## Componenti Principali

- Esempi d’uso e logica: context eventi, timeline, dashboard, ecc.
- Vedi: [IMPLEMENTAZIONE-COMPLETA-20251106.md](../IMPLEMENTAZIONE-COMPLETA-20251106.md)

## Guide e Approfondimenti

- Approfondimenti su localizzazione, integrazioni, troubleshooting.
- Vedi: [GUIDA-MIGRAZIONE-I18N-LOCALE.md](../GUIDA-MIGRAZIONE-I18N-LOCALE.md)
- Vedi: [DATABASE-CONNECTIONS.md](../DATABASE-CONNECTIONS.md)

---

> Aggiorna questa pagina con nuove sezioni e link utili man mano che il progetto evolve.
