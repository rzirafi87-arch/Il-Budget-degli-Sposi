-- =========================================
-- ADD UNIQUE CONSTRAINT to existing vendors table
-- =========================================

-- Add UNIQUE constraint on source_id (needed for ON CONFLICT in upsert_vendor)
ALTER TABLE vendors 
ADD CONSTRAINT vendors_source_id_unique UNIQUE (source_id);

-- Verify constraint exists
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'vendors'::regclass
  AND conname = 'vendors_source_id_unique';
