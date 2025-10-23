-- =====================================================
-- SCRIPT UNIFICATO: Tutti i Patch SQL in Ordine
-- =====================================================
-- Esegui questo script DOPO aver eseguito supabase-COMPLETE-SETUP.sql
-- Contiene tutti i patch necessari per il funzionamento completo dell'app
-- =====================================================

-- =====================================================
-- PATCH 1: Total Budget
-- =====================================================
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS total_budget NUMERIC DEFAULT 0;

COMMENT ON COLUMN events.total_budget IS 'Budget totale disponibile inserito dagli sposi';

-- =====================================================
-- PATCH 2: Spend Type
-- =====================================================
ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS spend_type TEXT NOT NULL DEFAULT 'common';

COMMENT ON COLUMN public.expenses.spend_type IS 'Type of expense: common (shared), bride, or groom';

-- =====================================================
-- PATCH 3: Per-Spouse Budget (CRITICO PER REGISTRAZIONE!)
-- =====================================================
ALTER TABLE IF EXISTS public.events
  ADD COLUMN IF NOT EXISTS bride_initial_budget NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS groom_initial_budget NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bride_email TEXT,
  ADD COLUMN IF NOT EXISTS groom_email TEXT;

-- Add constraint only if it doesn't exist (PostgreSQL safe way)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'events_budgets_nonnegative'
  ) THEN
    ALTER TABLE public.events
      ADD CONSTRAINT events_budgets_nonnegative
      CHECK (
        COALESCE(bride_initial_budget,0) >= 0 AND
        COALESCE(groom_initial_budget,0) >= 0 AND
        COALESCE(total_budget,0) >= 0
      );
  END IF;
END $$;

-- =====================================================
-- PATCH 4: Expenses Enhancements
-- =====================================================
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS expense_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS from_dashboard BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN expenses.description IS 'Descrizione dettagliata della spesa';
COMMENT ON COLUMN expenses.expense_date IS 'Data in cui è stata sostenuta la spesa';
COMMENT ON COLUMN expenses.from_dashboard IS 'Indica se la spesa era presente nel preventivo della dashboard';

-- =====================================================
-- TUTTI I PATCH APPLICATI CON SUCCESSO!
-- =====================================================
-- Ora puoi procedere con la registrazione dell'utente
-- =====================================================
