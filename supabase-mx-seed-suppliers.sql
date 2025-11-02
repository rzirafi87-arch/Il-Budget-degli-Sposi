-- Mexican suppliers seed
-- Keeps it minimal and compatible with existing schema. Add subscription fields if present in your DB.

INSERT INTO public.suppliers (
  name, region, province, city, address, phone, email, website, description,
  category, verified, country
) VALUES
  ('Floristería Azucena', 'CDMX', 'CDMX', 'Ciudad de México', 'Calle Flores 22', '555-1112233', 'ventas@azucena.mx', 'https://azucena.mx', 'Fiori e decorazioni per matrimoni', 'Fiorai', true, 'mx'),
  ('Catering El Sabor', 'Yucatán', 'Yucatán', 'Mérida', 'Calle 60 #123', '999-2223344', 'info@elsabor.mx', 'https://elsabor.mx', 'Catering tradizionale messicano', 'Catering', true, 'mx'),
  ('Fotógrafo Luna', 'Jalisco', 'Jalisco', 'Guadalajara', 'Av. Sol 99', '333-9876543', 'contacto@fotoluna.mx', 'https://fotoluna.mx', 'Servizi fotografici per matrimoni', 'Fotografi', true, 'mx')
ON CONFLICT DO NOTHING;
