-- Core schema for multi-event types (Battesimo, Diciottesimo, Compleanno, Anniversario, Pensione)
-- NOTE: This is additive and may not be fully compatible with the existing schema in this repo.
-- Run on a fresh Supabase project or after careful review. Policies below override access patterns.

-- 0) Prerequisite (run once per DB)
-- If not already active
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid()

-- 1) Tables
-- === BASE TABLES ===
CREATE TABLE IF NOT EXISTS event_types (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,      -- e.g. 'battesimo','diciottesimo', ...
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,                 -- auth.users.id (Supabase)
  type_id INT NOT NULL REFERENCES event_types(id) ON DELETE RESTRICT,
  title TEXT,
  public_id TEXT UNIQUE,                  -- public token (8-12 chars)
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_members (
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner','editor','viewer')) DEFAULT 'viewer',
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_id INT NOT NULL REFERENCES event_types(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  qty NUMERIC(12,2) DEFAULT 1,
  unit_cost NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) GENERATED ALWAYS AS (COALESCE(qty,1) * COALESCE(unit_cost,0)) STORED,
  paid NUMERIC(12,2) DEFAULT 0,
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS incomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  received_at DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_share_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;     -- read-only
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;  -- read-only
ALTER TABLE event_share_tokens ENABLE ROW LEVEL SECURITY;

-- Events: public read-only for public events
DROP POLICY IF EXISTS "public can read public events" ON events;
CREATE POLICY "public can read public events"
ON events FOR SELECT TO PUBLIC
USING (is_public = true);

-- Owner: full access
DROP POLICY IF EXISTS "owner can manage event" ON events;
CREATE POLICY "owner can manage event"
ON events FOR ALL TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Members: visibility via membership (read)
DROP POLICY IF EXISTS "member can read event via membership" ON events;
CREATE POLICY "member can read event via membership"
ON events FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM event_members m
    WHERE m.event_id = events.id AND m.user_id = auth.uid()
  )
);

-- Members table management restricted to owner
DROP POLICY IF EXISTS "owner manages members" ON event_members;
CREATE POLICY "owner manages members"
ON event_members FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events e WHERE e.id = event_members.event_id AND e.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM events e WHERE e.id = event_members.event_id AND e.owner_id = auth.uid()
  )
);

-- Expenses: members read/write based on role
DROP POLICY IF EXISTS "members read expenses" ON expenses;
CREATE POLICY "members read expenses"
ON expenses FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM event_members m WHERE m.event_id = expenses.event_id AND m.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "members write expenses" ON expenses;
CREATE POLICY "members write expenses"
ON expenses FOR INSERT, UPDATE, DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM event_members m WHERE m.event_id = expenses.event_id AND m.user_id = auth.uid() AND m.role IN ('owner','editor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM event_members m WHERE m.event_id = expenses.event_id AND m.user_id = auth.uid() AND m.role IN ('owner','editor')
  )
);

-- Incomes: members read/write based on role
DROP POLICY IF EXISTS "members read incomes" ON incomes;
CREATE POLICY "members read incomes"
ON incomes FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM event_members m WHERE m.event_id = incomes.event_id AND m.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "members write incomes" ON incomes;
CREATE POLICY "members write incomes"
ON incomes FOR INSERT, UPDATE, DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM event_members m WHERE m.event_id = incomes.event_id AND m.user_id = auth.uid() AND m.role IN ('owner','editor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM event_members m WHERE m.event_id = incomes.event_id AND m.user_id = auth.uid() AND m.role IN ('owner','editor')
  )
);

-- Suppliers: members read/write based on role
DROP POLICY IF EXISTS "members read suppliers" ON suppliers;
CREATE POLICY "members read suppliers"
ON suppliers FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM event_members m WHERE m.event_id = suppliers.event_id AND m.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "members write suppliers" ON suppliers;
CREATE POLICY "members write suppliers"
ON suppliers FOR INSERT, UPDATE, DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM event_members m WHERE m.event_id = suppliers.event_id AND m.user_id = auth.uid() AND m.role IN ('owner','editor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM event_members m WHERE m.event_id = suppliers.event_id AND m.user_id = auth.uid() AND m.role IN ('owner','editor')
  )
);

-- Categories/Subcategories: public read (dictionary tables)
DROP POLICY IF EXISTS "anyone can read categories" ON categories;
CREATE POLICY "anyone can read categories"
ON categories FOR SELECT TO PUBLIC USING (true);

DROP POLICY IF EXISTS "anyone can read subcategories" ON subcategories;
CREATE POLICY "anyone can read subcategories"
ON subcategories FOR SELECT TO PUBLIC USING (true);

-- Share tokens: readable if not expired
DROP POLICY IF EXISTS "public read active share tokens" ON event_share_tokens;
CREATE POLICY "public read active share tokens"
ON event_share_tokens FOR SELECT TO PUBLIC
USING (expires_at > now());

-- Share tokens: members (owner/editor) can create tokens for their event
DROP POLICY IF EXISTS "members create share tokens" ON event_share_tokens;
CREATE POLICY "members create share tokens"
ON event_share_tokens FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM event_members m
    JOIN events e ON e.id = m.event_id
    WHERE m.event_id = event_share_tokens.event_id
      AND m.user_id = auth.uid()
      AND m.role IN ('owner','editor')
  )
);
