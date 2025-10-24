-- =========================================
-- SCRIPT PER RILEVARE E RIMUOVERE DOPPIONI
-- =========================================
-- Questo script trova e rimuove le location duplicate nella tabella locations
-- Un duplicato è definito come: stesso name, region, province, city

-- STEP 1: Trova i doppioni (solo per verifica, non modifica dati)
SELECT 
    name, 
    region, 
    province, 
    city, 
    COUNT(*) as numero_duplicati
FROM locations
GROUP BY name, region, province, city
HAVING COUNT(*) > 1
ORDER BY numero_duplicati DESC, name;

-- STEP 2: Mostra tutti i record duplicati con i loro ID
SELECT 
    l.id,
    l.name,
    l.region,
    l.province,
    l.city,
    l.inserted_at
FROM locations l
INNER JOIN (
    SELECT name, region, province, city
    FROM locations
    GROUP BY name, region, province, city
    HAVING COUNT(*) > 1
) duplicates
ON l.name = duplicates.name 
   AND l.region = duplicates.region
   AND l.province = duplicates.province
   AND l.city = duplicates.city
ORDER BY l.name, l.inserted_at;

-- STEP 3: Rimuovi i doppioni mantenendo solo il record più vecchio (con inserted_at più antica)
-- ATTENZIONE: Questa query ELIMINA i doppioni! Esegui solo dopo aver verificato i risultati sopra!

-- Decommentato e pronto all'uso:
DELETE FROM locations
WHERE id IN (
    SELECT id
    FROM (
        SELECT 
            id,
            ROW_NUMBER() OVER (
                PARTITION BY name, region, province, city 
                ORDER BY inserted_at ASC
            ) as row_num
        FROM locations
    ) t
    WHERE row_num > 1
);

-- STEP 4: Verifica che non ci siano più doppioni
SELECT 
    name, 
    region, 
    province, 
    city, 
    COUNT(*) as conteggio
FROM locations
GROUP BY name, region, province, city
HAVING COUNT(*) > 1;

-- Se non ci sono risultati, tutti i doppioni sono stati rimossi!

-- STEP 5 (OPZIONALE): Crea un constraint per prevenire futuri duplicati
-- Decommentato e pronto all'uso:
ALTER TABLE locations 
ADD CONSTRAINT unique_location 
UNIQUE (name, region, province, city);

-- NOTA: Se aggiungi il constraint unique, qualsiasi tentativo di inserire
-- un duplicato genererà un errore, prevenendo il problema alla fonte.
