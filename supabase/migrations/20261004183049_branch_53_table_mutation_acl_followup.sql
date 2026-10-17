-- Entire plan mutations use the existing event-locked service RPCs. Assignment
-- writes can change the same plan, so browser grants must close both relations.
revoke insert, update, delete on public.tables, public.table_assignments from public, anon, authenticated;
