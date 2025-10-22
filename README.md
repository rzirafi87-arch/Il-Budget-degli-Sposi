# Il Budget degli Sposi

Un'applicazione Next.js per la gestione del budget matrimoniale.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Features

- 💰 Budget tracking per categorie
- 📊 Dashboard con statistiche
- 🏰 Database chiese e location
- 🏢 Gestione fornitori
- 💸 Tracciamento spese ed entrate
- 💌 Generazione partecipazioni (PDF)
- 🔐 Autenticazione con Supabase

## Database Setup

1. Esegui gli script SQL in ordine:
   - `supabase-COMPLETE-SETUP.sql`
   - `supabase-seed-functions.sql`
   - `supabase-suppliers-seed.sql`
   - `supabase-locations-seed.sql`
   - `supabase-churches-seed.sql`
   - `supabase-wedding-cards-table.sql`

2. Configura le variabili d'ambiente:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE=your_service_role_key
   ```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
