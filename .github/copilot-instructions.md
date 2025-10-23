# Il Budget degli Sposi - AI Coding Agent Instructions

## Project Overview
Wedding budget management application built with Next.js 16 (App Router), React 19, Supabase, and Tailwind CSS 4. Italian-language interface for couples to plan wedding expenses, track budgets separately (bride/groom/common), and manage suppliers, venues, and churches.

## Architecture & Data Flow

### Database Schema (Supabase)
Core tables hierarchy: `events` → `categories` → `subcategories` → `expenses`/`incomes`
- **events**: Wedding events owned by users (with `total_budget`, `bride_initial_budget`, `groom_initial_budget`)
- **categories**: Top-level expense groups (e.g., "Sposa", "Location & Catering")
- **subcategories**: Detailed line items (e.g., "Abito sposa", "Torta nuziale")
- **expenses**: Actual spend records with `spend_type` ("common"|"bride"|"groom"), linked to subcategories
- **incomes**: Revenue tracking for budget sources
- Seed tables: `suppliers`, `locations`, `churches` (pre-populated regional data)

### Authentication Pattern
Two Supabase clients with distinct purposes:
- **Client-side** (`getBrowserClient()`): For "use client" components, uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`, session-aware
- **Server-side** (`getServiceClient()`): For API routes ONLY, uses `SUPABASE_SERVICE_ROLE`, bypasses RLS
- All API routes use `export const runtime = "nodejs"` and manually verify JWT from `Authorization: Bearer <token>` header

### Demo-First Design
Unauthenticated users see full demo UI with empty data. API routes return placeholder data when no JWT provided. Authentication only required to persist changes (POST/PUT/DELETE operations).

## Development Workflow

### Setup & Database
1. **Environment variables** (`.env.local`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE=your_service_role
   ```

2. **Database initialization order** (run SQL scripts in Supabase SQL editor):
   - `supabase-COMPLETE-SETUP.sql` (tables)
   - `supabase-seed-functions.sql` (stored procedures)
   - `supabase-suppliers-seed.sql`, `supabase-locations-seed.sql`, `supabase-churches-seed.sql`
   - Patch files: `supabase-*-patch.sql` (schema updates)
   - `supabase-wedding-cards-table.sql` (invitations feature)

3. **Run dev server**: `npm run dev` (Node.js >=18.17.0 required)

### Key Commands
- Build: `npm run build`
- Lint: `npm run lint` (ESLint v9, config in `eslint.config.mjs`)
- Start production: `npm start`

## Code Conventions & Patterns

### Component Structure
- **App Router only** (`src/app/`): All routes use file-based routing
- **Client components** marked with `"use client"` directive (all page components, interactive UI)
- **Server components**: Only used in `layout.tsx` for static shell
- Imports use `@/` alias (resolves to `src/`)

### API Routes Pattern
Every `route.ts` follows this structure:
```typescript
export const runtime = "nodejs"; // Required!
import { getServiceClient } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];
  
  if (!jwt) {
    return NextResponse.json({ /* demo data */ });
  }
  
  const db = getServiceClient();
  const { data: userData, error } = await db.auth.getUser(jwt);
  if (error) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  
  const userId = userData.user.id;
  // ... query user's data
}
```

### Client-Side Data Fetching
Pages fetch from API routes with session token:
```typescript
const supabase = getBrowserClient();
const { data } = await supabase.auth.getSession();
const jwt = data.session?.access_token;
const headers: HeadersInit = {};
if (jwt) headers.Authorization = `Bearer ${jwt}`;
const res = await fetch("/api/my/dashboard", { headers });
```

### Styling Conventions
- Tailwind CSS 4 with `@import "tailwindcss"` in `globals.css`
- Custom wedding-themed backgrounds: `.bg-wedding-rose-floral`, `.bg-wedding-sage-dots`, etc. (see `globals.css`)
- `<Background />` component changes gradient based on route
- Brand color: `#A3B59D` (sage green) for primary actions/active states
- Use Italian terminology in UI text

### Event Management
- One event per user (primary user + optional partner)
- First-time users trigger `/api/event/ensure-default` (POST) to create event and run `seed_full_event()` RPC
- Dashboard auto-generates ALL category/subcategory rows (see `CATEGORIES_MAP` in `dashboard/page.tsx`)
- Budget split tracking: separate bride/groom budgets + common expenses

### Routing & Navigation
Tab navigation in `<NavTabs>` component uses `usePathname()` and `clsx()` for active state styling. Routes:
- `/dashboard` - Main budget overview with all categories
- `/budget` - Budget table view
- `/spese` - Expenses management
- `/entrate` - Income tracking
- `/fornitori`, `/location`, `/chiese` - Supplier/venue databases
- `/partecipazione` - Wedding invitation PDF generation (uses `jspdf`)

## Common Tasks

### Adding a New Expense Category
1. Update `CATEGORIES_MAP` in both `src/app/dashboard/page.tsx` and `src/app/api/my/dashboard/route.ts`
2. Categories auto-create on save via POST endpoint (no migration needed)

### Adding a New API Endpoint
1. Create `src/app/api/[feature]/route.ts`
2. Add `export const runtime = "nodejs"`
3. Implement JWT verification pattern from existing routes
4. Return demo data for unauthenticated requests

### Working with Supabase Types
No generated types - use inline type annotations. Example from dashboard:
```typescript
type SpendRow = {
  id?: string;
  category: string;
  subcategory: string;
  supplier: string;
  amount: number;
  spendType: "common" | "bride" | "groom";
  notes: string;
};
```

## Dependencies & Versions
- **Next.js 16.0.0** (App Router, React 19 compatible)
- **React 19.2.0** (note: newer JSX transform in tsconfig)
- **Tailwind CSS 4** (PostCSS-based, uses `@tailwindcss/postcss`)
- **Supabase JS client 2.76.1** (auth + database)
- **jsPDF 3.0.3** (PDF generation for wedding invitations)
- **clsx 2.1.1** (conditional class names)

## Troubleshooting
- **"Not authenticated" errors**: Check JWT extraction in API route and session token in fetch call
- **Demo data not showing**: Ensure unauthenticated fallback returns `generateAllRows()` or equivalent
- **Supabase RLS issues**: API routes bypass RLS with service role - never use service client in client components
- **TypeScript errors in `tsconfig.json`**: Ignore duplicate `.next\\dev/types/**/*.ts` entries (Windows path quirk)

## Testing Strategy
No automated tests currently. Manual testing workflow:
1. Test unauthenticated flow (demo data visible)
2. Sign up new user → verify event creation + seeding
3. Add expenses in dashboard → save → verify persistence
4. Check bride/groom budget calculations match
