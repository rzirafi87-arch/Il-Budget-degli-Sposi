TRUNCATE TABLE languages;
INSERT INTO languages (code, name, native_name, rtl) VALUES
  ('it', 'Italian', 'Italiano', FALSE),
  ('en', 'English', 'English', FALSE),
  ('fr', 'French', 'Français', FALSE),
  ('de', 'German', 'Deutsch', FALSE),
  ('es', 'Spanish', 'Español', FALSE),
  ('pt', 'Portuguese', 'Português', FALSE),
  ('ar', 'Arabic', 'العربية', TRUE),
  ('ru', 'Russian', 'Русский', FALSE),
  ('zh', 'Chinese', '中文', FALSE),
  ('ja', 'Japanese', '日本語', FALSE);
