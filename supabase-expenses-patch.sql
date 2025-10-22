-- Aggiunge colonne per tracciare spese e integrazione con dashboard

ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS expense_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS from_dashboard BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN expenses.description IS 'Descrizione dettagliata della spesa';
COMMENT ON COLUMN expenses.expense_date IS 'Data in cui è stata sostenuta la spesa';
COMMENT ON COLUMN expenses.from_dashboard IS 'Indica se la spesa era presente nel preventivo della dashboard';
