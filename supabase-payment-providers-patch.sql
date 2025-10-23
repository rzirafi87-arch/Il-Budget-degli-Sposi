-- =====================================================
-- PAYMENT TRACKING & NEW PROVIDERS TABLES
-- =====================================================
-- This migration adds:
-- - Payment installments and reminders for expenses
-- - Income source tracking (bride/groom/common)
-- - Wedding planner providers table
-- - Ceremony music providers table
-- - Reception music providers table
--
-- Run this AFTER supabase-guests-tables.sql
-- =====================================================

-- =====================================================
-- 1. EXPENSES TABLE UPDATES - Payment Installments
-- =====================================================

-- Add payment installment tracking
ALTER TABLE public.expenses
ADD COLUMN IF NOT EXISTS payment_installments JSONB DEFAULT '[]';

COMMENT ON COLUMN public.expenses.payment_installments IS 
'Array of payment installments: [{amount: number, due_date: date, paid: boolean, paid_date: date, notes: string}]';

-- Add reminder functionality
CREATE TABLE IF NOT EXISTS public.payment_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
    
    -- Reminder details
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    is_paid BOOLEAN DEFAULT false,
    paid_date DATE,
    
    -- Notification
    reminder_sent BOOLEAN DEFAULT false,
    reminder_date DATE,
    
    -- Notes
    notes TEXT DEFAULT '',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_reminders_expense_id ON public.payment_reminders(expense_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_due_date ON public.payment_reminders(due_date);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_is_paid ON public.payment_reminders(is_paid);

COMMENT ON TABLE public.payment_reminders IS 
'Payment reminders for installment tracking and upcoming payment notifications';

-- =====================================================
-- 2. INCOMES TABLE UPDATES - Source Tracking
-- =====================================================

ALTER TABLE public.incomes
ADD COLUMN IF NOT EXISTS income_source TEXT DEFAULT 'common' CHECK (income_source IN ('bride', 'groom', 'common'));

COMMENT ON COLUMN public.incomes.income_source IS 
'Who receives/brings this income: bride, groom, or common';

-- =====================================================
-- 3. WEDDING PLANNERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.wedding_planners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic info
    name TEXT NOT NULL CHECK (LENGTH(TRIM(name)) > 0),
    
    -- Location
    region TEXT NOT NULL,
    province TEXT NOT NULL,
    city TEXT NOT NULL,
    
    -- Contact
    phone TEXT,
    email TEXT,
    website TEXT,
    
    -- Details
    description TEXT,
    price_range TEXT,
    services TEXT, -- "Full planning, Partial planning, Consulenza"
    
    -- Verification & status
    verified BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    
    -- Submission tracking
    submitted_by UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wedding_planners_region ON public.wedding_planners(region);
CREATE INDEX IF NOT EXISTS idx_wedding_planners_province ON public.wedding_planners(province);
CREATE INDEX IF NOT EXISTS idx_wedding_planners_status ON public.wedding_planners(status);

COMMENT ON TABLE public.wedding_planners IS 
'Wedding planner providers directory with verification workflow';

-- =====================================================
-- 4. CEREMONY MUSIC TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.musica_cerimonia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic info
    name TEXT NOT NULL CHECK (LENGTH(TRIM(name)) > 0),
    
    -- Location
    region TEXT NOT NULL,
    province TEXT NOT NULL,
    city TEXT NOT NULL,
    
    -- Contact
    phone TEXT,
    email TEXT,
    website TEXT,
    
    -- Details
    description TEXT,
    price_range TEXT,
    music_type TEXT, -- "Coro, Organo, Arpa, Violino, Band"
    
    -- Verification & status
    verified BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    
    -- Submission tracking
    submitted_by UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_musica_cerimonia_region ON public.musica_cerimonia(region);
CREATE INDEX IF NOT EXISTS idx_musica_cerimonia_province ON public.musica_cerimonia(province);
CREATE INDEX IF NOT EXISTS idx_musica_cerimonia_status ON public.musica_cerimonia(status);

COMMENT ON TABLE public.musica_cerimonia IS 
'Ceremony music providers (musicians, choirs, organists) with verification workflow';

-- =====================================================
-- 5. RECEPTION MUSIC TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.musica_ricevimento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic info
    name TEXT NOT NULL CHECK (LENGTH(TRIM(name)) > 0),
    
    -- Location
    region TEXT NOT NULL,
    province TEXT NOT NULL,
    city TEXT NOT NULL,
    
    -- Contact
    phone TEXT,
    email TEXT,
    website TEXT,
    
    -- Details
    description TEXT,
    price_range TEXT,
    music_type TEXT, -- "DJ, Band live, Orchestra, Duo acustico"
    
    -- Verification & status
    verified BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    
    -- Submission tracking
    submitted_by UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_musica_ricevimento_region ON public.musica_ricevimento(region);
CREATE INDEX IF NOT EXISTS idx_musica_ricevimento_province ON public.musica_ricevimento(province);
CREATE INDEX IF NOT EXISTS idx_musica_ricevimento_status ON public.musica_ricevimento(status);

COMMENT ON TABLE public.musica_ricevimento IS 
'Reception music providers (DJs, bands, orchestras) with verification workflow';

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Payment reminders
ALTER TABLE public.payment_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment reminders"
ON public.payment_reminders
FOR SELECT
USING (
    expense_id IN (
        SELECT e.id FROM public.expenses e
        JOIN public.subcategories s ON e.subcategory_id = s.id
        JOIN public.categories c ON s.category_id = c.id
        JOIN public.events ev ON c.event_id = ev.id
        WHERE ev.user_id = auth.uid() OR ev.partner_user_id = auth.uid()
    )
);

CREATE POLICY "Users can manage their own payment reminders"
ON public.payment_reminders
FOR ALL
USING (
    expense_id IN (
        SELECT e.id FROM public.expenses e
        JOIN public.subcategories s ON e.subcategory_id = s.id
        JOIN public.categories c ON s.category_id = c.id
        JOIN public.events ev ON c.event_id = ev.id
        WHERE ev.user_id = auth.uid() OR ev.partner_user_id = auth.uid()
    )
);

-- Provider tables are public (read-only for approved items)
ALTER TABLE public.wedding_planners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.musica_cerimonia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.musica_ricevimento ENABLE ROW LEVEL SECURITY;

-- Wedding planners
CREATE POLICY "Anyone can view approved wedding planners"
ON public.wedding_planners
FOR SELECT
USING (status = 'approved');

CREATE POLICY "Users can submit wedding planners"
ON public.wedding_planners
FOR INSERT
WITH CHECK (true);

-- Musica cerimonia
CREATE POLICY "Anyone can view approved ceremony musicians"
ON public.musica_cerimonia
FOR SELECT
USING (status = 'approved');

CREATE POLICY "Users can submit ceremony musicians"
ON public.musica_cerimonia
FOR INSERT
WITH CHECK (true);

-- Musica ricevimento
CREATE POLICY "Anyone can view approved reception musicians"
ON public.musica_ricevimento
FOR SELECT
USING (status = 'approved');

CREATE POLICY "Users can submit reception musicians"
ON public.musica_ricevimento
FOR INSERT
WITH CHECK (true);

-- =====================================================
-- 7. TRIGGERS FOR UPDATED_AT
-- =====================================================

DROP TRIGGER IF EXISTS update_payment_reminders_updated_at ON public.payment_reminders;
CREATE TRIGGER update_payment_reminders_updated_at
    BEFORE UPDATE ON public.payment_reminders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_wedding_planners_updated_at ON public.wedding_planners;
CREATE TRIGGER update_wedding_planners_updated_at
    BEFORE UPDATE ON public.wedding_planners
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_musica_cerimonia_updated_at ON public.musica_cerimonia;
CREATE TRIGGER update_musica_cerimonia_updated_at
    BEFORE UPDATE ON public.musica_cerimonia
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_musica_ricevimento_updated_at ON public.musica_ricevimento;
CREATE TRIGGER update_musica_ricevimento_updated_at
    BEFORE UPDATE ON public.musica_ricevimento
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 8. SAMPLE DATA (commented - uncomment for testing)
-- =====================================================

/*
-- Sample payment reminder
INSERT INTO public.payment_reminders (expense_id, amount, due_date, notes)
VALUES ('YOUR_EXPENSE_ID', 500.00, '2025-11-15', 'Acconto fotografo');

-- Sample wedding planner
INSERT INTO public.wedding_planners (name, region, province, city, phone, email, website, description, price_range, services, verified, status)
VALUES 
    ('Wedding Dreams', 'Lombardia', 'Milano', 'Milano', '+39 02 1234567', 'info@weddingdreams.it', 'https://weddingdreams.it', 
     'Organizziamo matrimoni da sogno da oltre 10 anni', '€€€', 'Full planning, Partial planning, Consulenza', true, 'approved');

-- Sample ceremony musician
INSERT INTO public.musica_cerimonia (name, region, province, city, phone, email, description, price_range, music_type, verified, status)
VALUES
    ('Ensemble Armonia', 'Toscana', 'Firenze', 'Firenze', '+39 055 7654321', 'info@ensemblearmonia.it',
     'Gruppo di musicisti classici specializzati in cerimonie religiose', '€€', 'Arpa, Violino, Violoncello', true, 'approved');

-- Sample reception music
INSERT INTO public.musica_ricevimento (name, region, province, city, phone, email, description, price_range, music_type, verified, status)
VALUES
    ('DJ Marco Events', 'Campania', 'Napoli', 'Napoli', '+39 081 9876543', 'marco@djevents.it',
     'DJ professionista con oltre 200 matrimoni all''attivo', '€€', 'DJ con impianto luci', true, 'approved');
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check new columns
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'expenses' AND column_name = 'payment_installments';

-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'incomes' AND column_name = 'income_source';

-- Check new tables
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name IN ('payment_reminders', 'wedding_planners', 'musica_cerimonia', 'musica_ricevimento');
