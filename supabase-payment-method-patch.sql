-- =====================================================
-- PAYMENT METHOD TRACKING PATCH
-- =====================================================
-- Aggiunge campo payment_method alla tabella expenses
-- per tracciare il metodo di pagamento di ogni spesa
-- =====================================================

-- Add payment_method column to expenses table
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS payment_method TEXT 
CHECK (payment_method IN ('cash', 'bank_transfer', 'credit_card', 'debit_card', 'check', 'paypal', 'other'))
DEFAULT 'cash';

-- Add payment_date column (useful for tracking when payment was made)
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS payment_date DATE;

-- Add payment_status column (pending, paid, partial, overdue)
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS payment_status TEXT 
CHECK (payment_status IN ('pending', 'paid', 'partial', 'overdue', 'canceled'))
DEFAULT 'pending';

-- Add payment_notes column for additional payment details
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS payment_notes TEXT;

-- Create index for faster queries by payment status
CREATE INDEX IF NOT EXISTS idx_expenses_payment_status 
ON expenses(payment_status);

-- Create index for faster queries by payment method
CREATE INDEX IF NOT EXISTS idx_expenses_payment_method 
ON expenses(payment_method);

-- Create index for payment date range queries
CREATE INDEX IF NOT EXISTS idx_expenses_payment_date 
ON expenses(payment_date);

-- Add comment to explain the new columns
COMMENT ON COLUMN expenses.payment_method IS 'Method used for payment: cash, bank_transfer, credit_card, debit_card, check, paypal, other';
COMMENT ON COLUMN expenses.payment_date IS 'Date when the payment was actually made';
COMMENT ON COLUMN expenses.payment_status IS 'Current payment status: pending, paid, partial, overdue, canceled';
COMMENT ON COLUMN expenses.payment_notes IS 'Additional notes about the payment (e.g., transaction ID, installment info)';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Payment method tracking columns added to expenses table successfully';
  RAISE NOTICE '   - payment_method: tracks how the expense was paid';
  RAISE NOTICE '   - payment_date: tracks when payment was made';
  RAISE NOTICE '   - payment_status: tracks payment completion status';
  RAISE NOTICE '   - payment_notes: additional payment details';
END $$;
