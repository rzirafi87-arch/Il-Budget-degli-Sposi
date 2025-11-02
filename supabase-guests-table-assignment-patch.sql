-- =====================================================
-- GUESTS TABLE ASSIGNMENT ENHANCEMENT
-- =====================================================
-- Adds support for flexible family table assignments:
-- - exclude_from_family_table: Mark specific family members 
--   to be excluded from automatic family table assignment
--   (e.g., cousins who should sit at a separate table)
-- =====================================================

-- Add exclude_from_family_table column
ALTER TABLE public.guests 
ADD COLUMN IF NOT EXISTS exclude_from_family_table BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.guests.exclude_from_family_table IS 
'If true, this guest will NOT be included in automatic family table assignments. 
Useful for separating family members (e.g., parents at one table, cousins at another).';

-- Create index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_guests_exclude_family_table 
ON public.guests(family_group_id, exclude_from_family_table) 
WHERE family_group_id IS NOT NULL;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check column was added
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'guests' AND column_name = 'exclude_from_family_table';
