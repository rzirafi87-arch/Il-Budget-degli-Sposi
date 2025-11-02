-- Seed: event types
INSERT INTO event_types (slug, name) VALUES
  ('wedding','Matrimonio'),
  ('battesimo','Battesimo'),
  ('diciottesimo','Diciottesimo'),
  ('compleanno','Compleanno'),
  ('anniversario','Anniversario di Matrimonio'),
  ('pensione','Pensione')
ON CONFLICT (slug) DO NOTHING;

