CREATE TABLE countries (
  code CHAR(2) PRIMARY KEY, -- ISO 3166-1 alpha-2
  name TEXT NOT NULL,
  native_name TEXT,
  region TEXT
);

INSERT INTO countries (code, name, native_name, region) VALUES
  ('IT', 'Italy', 'Italia', 'Europe'),
  ('FR', 'France', 'France', 'Europe'),
  ('DE', 'Germany', 'Deutschland', 'Europe'),
  ('ES', 'Spain', 'España', 'Europe'),
  ('US', 'United States', 'United States', 'Americas'),
  ('MX', 'Mexico', 'México', 'Americas'),
  ('IN', 'India', 'भारत', 'Asia'),
  ('CN', 'China', '中国', 'Asia'),
  ('JP', 'Japan', '日本', 'Asia'),
  ('BR', 'Brazil', 'Brasil', 'Americas');
-- ... (aggiungere tutti i paesi ISO necessari)
