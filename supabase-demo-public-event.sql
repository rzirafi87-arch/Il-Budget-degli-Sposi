-- Minimal public demo event seed for the core schema.
-- Run in Supabase SQL Editor (or with service role) after applying:
--   1) supabase-core-events-schema.sql
--   2) supabase-seed-event-types.sql

DO $$ BEGIN
  -- Ensure event type exists
  INSERT INTO event_types (slug, name)
  VALUES ('battesimo','Battesimo')
  ON CONFLICT (slug) DO NOTHING;

  -- Create a demo owner (placeholder UUID). Replace with a real user id if desired.
  -- When running in SQL editor, RLS may be bypassed; otherwise use service role.
  -- You can also set this to an existing auth.users.id from your project.
  PERFORM 1;

  -- Insert demo event
  INSERT INTO events (id, owner_id, type_id, title, public_id, is_public)
  VALUES (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    (SELECT id FROM event_types WHERE slug='battesimo'),
    'Demo Battesimo Pubblico',
    'demo-public-001',
    true
  );
END $$;

