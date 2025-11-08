-- Dummy auth schema to allow local setup without full Supabase auth
CREATE SCHEMA IF NOT EXISTS auth;

-- uid() returns NULL for unauthenticated state; RLS will evaluate accordingly
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid AS $$
  SELECT NULL::uuid;
$$ LANGUAGE sql STABLE;

-- Optionally, a helper to simulate a logged-in user can be added by setting a GUC and returning it
-- CREATE OR REPLACE FUNCTION auth.set_test_uid(val uuid) RETURNS void AS $$
-- BEGIN
--   PERFORM set_config('app.test_uid', val::text, true);
-- END;
-- $$ LANGUAGE plpgsql;

-- And modify uid() to return current_setting('app.test_uid', true)::uuid when present.
