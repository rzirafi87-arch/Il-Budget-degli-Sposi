Geo datasets (local Option A)

This app supports local, static datasets for provinces/counties per region via JSON files under `public/geo/<country>/<region>.json`.

Already included
- IT (complete in `src/constants/geo.ts`)
- ES (complete in `src/constants/geo.ts`)
- FR (complete in `src/constants/geo.ts`)
- MX (many states with municipalities; others fallback to input)
- Examples for GB/US/IN/JP in `public/geo/**`

Bulk import
1) Place a dataset file at `scripts/datasets/geo-full.json` with the following shape:

```
{
  "us": { "California": ["Los Angeles", ...], "Texas": ["Harris", ...], ... },
  "gb": { "England": ["Kent", ...], "Scotland": ["Fife", ...], ... },
  "in": { "Maharashtra": ["Mumbai City", ...], ... },
  "jp": { "Tōkyō": ["Shinjuku", ...], ... },
  "mx": { "Yucatán": ["Mérida", ...], ... }
}
```

2) Run the importer:
```
npm run geo:import           # imports all countries from the JSON
npm run geo:import -- us jp  # imports only US and JP
```

The importer will create/update `public/geo/<country>/<region>.json` files.

