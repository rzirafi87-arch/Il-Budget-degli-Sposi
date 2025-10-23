--- Script SQL per aggiungere gestione famiglie e formazione tavoli
-- Eseguire in Supabase SQL Editor dopo le altre migrations

-- =====================================================
-- 1. TABELLA FAMILY_GROUPS: Gruppi familiari di invitati
-- =====================================================
CREATE TABLE IF NOT EXISTS family_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  family_name VARCHAR(255) NOT NULL, -- Es: "Famiglia Rossi"
  main_contact_guest_id UUID, -- ID del guest che è il contatto principale (FK aggiunto dopo)
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_family_groups_event ON family_groups(event_id);
CREATE INDEX IF NOT EXISTS idx_family_groups_main_contact ON family_groups(main_contact_guest_id);

-- =====================================================
-- 2. MODIFICA TABELLA GUESTS: Aggiungere family_group_id
-- =====================================================
ALTER TABLE guests 
ADD COLUMN IF NOT EXISTS family_group_id UUID REFERENCES family_groups(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_guests_family_group ON guests(family_group_id);

-- Aggiungere FK da family_groups a guests per main_contact
ALTER TABLE family_groups
ADD CONSTRAINT fk_family_main_contact 
FOREIGN KEY (main_contact_guest_id) REFERENCES guests(id) ON DELETE SET NULL;

-- =====================================================
-- 3. TABELLA TABLES: Tavoli del ricevimento
-- =====================================================
CREATE TABLE IF NOT EXISTS tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL, -- Numero tavolo (1, 2, 3, ...)
  table_name VARCHAR(255), -- Nome tavolo opzionale (es: "Tavolo Sposi", "Tavolo Nonni")
  table_type VARCHAR(50) NOT NULL DEFAULT 'round', -- 'round', 'square', 'rectangular', 'imperial'
  total_seats INTEGER NOT NULL DEFAULT 8, -- Numero posti totali
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, table_number)
);

CREATE INDEX IF NOT EXISTS idx_tables_event ON tables(event_id);

COMMENT ON COLUMN tables.table_type IS 'Tipo tavolo: round (tondo), square (quadrato), rectangular (rettangolare), imperial (imperiale)';

-- =====================================================
-- 4. TABELLA TABLE_ASSIGNMENTS: Assegnazioni invitati ai tavoli
-- =====================================================
CREATE TABLE IF NOT EXISTS table_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  seat_number INTEGER, -- Posto specifico al tavolo (opzionale)
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(guest_id) -- Un invitato può essere assegnato solo a un tavolo
);

CREATE INDEX IF NOT EXISTS idx_table_assignments_table ON table_assignments(table_id);
CREATE INDEX IF NOT EXISTS idx_table_assignments_guest ON table_assignments(guest_id);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Family Groups RLS
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own family groups"
  ON family_groups FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own family groups"
  ON family_groups FOR INSERT
  WITH CHECK (
    event_id IN (
      SELECT id FROM events WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own family groups"
  ON family_groups FOR UPDATE
  USING (
    event_id IN (
      SELECT id FROM events WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own family groups"
  ON family_groups FOR DELETE
  USING (
    event_id IN (
      SELECT id FROM events WHERE owner_id = auth.uid()
    )
  );

-- Tables RLS
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tables"
  ON tables FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own tables"
  ON tables FOR INSERT
  WITH CHECK (
    event_id IN (
      SELECT id FROM events WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own tables"
  ON tables FOR UPDATE
  USING (
    event_id IN (
      SELECT id FROM events WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own tables"
  ON tables FOR DELETE
  USING (
    event_id IN (
      SELECT id FROM events WHERE owner_id = auth.uid()
    )
  );

-- Table Assignments RLS
ALTER TABLE table_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own table assignments"
  ON table_assignments FOR SELECT
  USING (
    table_id IN (
      SELECT id FROM tables WHERE event_id IN (
        SELECT id FROM events WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert their own table assignments"
  ON table_assignments FOR INSERT
  WITH CHECK (
    table_id IN (
      SELECT id FROM tables WHERE event_id IN (
        SELECT id FROM events WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own table assignments"
  ON table_assignments FOR UPDATE
  USING (
    table_id IN (
      SELECT id FROM tables WHERE event_id IN (
        SELECT id FROM events WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their own table assignments"
  ON table_assignments FOR DELETE
  USING (
    table_id IN (
      SELECT id FROM tables WHERE event_id IN (
        SELECT id FROM events WHERE owner_id = auth.uid()
      )
    )
  );

-- =====================================================
-- 6. FUNZIONI HELPER
-- =====================================================

-- Funzione per ottenere statistiche tavoli
CREATE OR REPLACE FUNCTION get_table_stats(p_event_id UUID)
RETURNS TABLE (
  total_tables INTEGER,
  total_seats INTEGER,
  assigned_seats INTEGER,
  available_seats INTEGER
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT t.id)::INTEGER as total_tables,
    COALESCE(SUM(t.total_seats), 0)::INTEGER as total_seats,
    COUNT(DISTINCT ta.id)::INTEGER as assigned_seats,
    (COALESCE(SUM(t.total_seats), 0) - COUNT(DISTINCT ta.id))::INTEGER as available_seats
  FROM tables t
  LEFT JOIN table_assignments ta ON ta.table_id = t.id
  WHERE t.event_id = p_event_id;
END;
$$;

-- Funzione per verificare disponibilità posti al tavolo
CREATE OR REPLACE FUNCTION check_table_availability(p_table_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
  v_total_seats INTEGER;
  v_assigned_seats INTEGER;
BEGIN
  SELECT total_seats INTO v_total_seats
  FROM tables WHERE id = p_table_id;
  
  SELECT COUNT(*) INTO v_assigned_seats
  FROM table_assignments WHERE table_id = p_table_id;
  
  RETURN (v_assigned_seats < v_total_seats);
END;
$$;

-- =====================================================
-- 7. TRIGGER PER UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_family_groups_updated_at
  BEFORE UPDATE ON family_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tables_updated_at
  BEFORE UPDATE ON tables
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SCRIPT COMPLETATO
-- =====================================================
-- Dopo aver eseguito questo script:
-- 1. Aggiornare l'API /api/my/guests per supportare family_group_id
-- 2. Creare l'API /api/my/tables per gestire tavoli e assegnazioni
-- 3. Creare la pagina /formazione-tavoli per l'interfaccia drag-and-drop
-- =====================================================
