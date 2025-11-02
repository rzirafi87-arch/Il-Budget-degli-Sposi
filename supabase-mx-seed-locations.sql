-- Mexican wedding locations seed
-- Safe to run multiple times: uses plain INSERTs; remove duplicates manually if needed.

INSERT INTO public.locations (
  name, region, province, city, address, phone, email, website, description,
  price_range, capacity_min, capacity_max, location_type, verified, country
) VALUES
  ('Hacienda San José', 'Yucatán', 'Yucatán', 'Tixkokob', 'Carretera Tixkokob-Tekit Km. 30', '999-1234567', 'info@haciendasanjose.com', 'https://haciendasanjose.com', 'Location storica per matrimoni', 'alta', 50, 300, 'hacienda', true, 'mx'),
  ('Jardín de Eventos La Casona', 'CDMX', 'CDMX', 'Ciudad de México', 'Av. Insurgentes Sur 1234', '555-9876543', 'contacto@lacasona.mx', 'https://lacasona.mx', 'Giardino per eventi all’aperto', 'media', 30, 150, 'giardino', true, 'mx'),
  ('Salón Diamante', 'Jalisco', 'Jalisco', 'Guadalajara', 'Calle Diamante 45', '333-4567890', 'info@salondiamante.mx', 'https://salondiamante.mx', 'Salone elegante per ricevimenti', 'media', 40, 200, 'salone', true, 'mx')
ON CONFLICT ON CONSTRAINT unique_location DO UPDATE SET
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  website = EXCLUDED.website,
  description = EXCLUDED.description,
  price_range = EXCLUDED.price_range,
  capacity_min = EXCLUDED.capacity_min,
  capacity_max = EXCLUDED.capacity_max,
  location_type = EXCLUDED.location_type,
  verified = EXCLUDED.verified,
  country = EXCLUDED.country;
