# Branch 41 – audit cataloghi beta

Audit Production del 2026-09-08, eseguito in sola lettura.

- Churches: 2 record, entrambi `country_code=mx`, entrambi senza coordinate.
- Locations: 128 record verificati; 124 Italia e 4 Messico.
- Tutte le location sono prive di coordinate.
- Le API condivise usano `search_global_catalog` con filtri country/region/city, paginazione e stato verifica.
- Non è emerso un bug RLS che nasconda un catalogo italiano di chiese: quel dataset non esiste in Production.
- La ricerca geografica non può produrre risultati attendibili finché latitudine/longitudine restano assenti.

## Scope preparato per Branch 42 (non avviato)

1. Definire fonti reali e verificabili per chiese italiane e ristoranti/location.
2. Ingestion idempotente tramite pipeline esistente, senza record fittizi.
3. Normalizzazione country/region/province/city e geocoding.
4. Deduplicazione tramite chiavi normalizzate e/o identificatori esterni.
5. Verifica editoriale e stato `VERIFIED/PROBABLE/TO_CHECK`.
6. Test di copertura regionale, geo search, paginazione e visibilità pubblica.
