-- Aggiunge la colonna total_budget alla tabella events

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS total_budget NUMERIC DEFAULT 0;

COMMENT ON COLUMN events.total_budget IS 'Budget totale disponibile inserito dagli sposi';
