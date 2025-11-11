## Test E2E con Playwright

Per eseguire i test end-to-end:

1. Avvia il server locale:
   ```bash
   npm run dev
   ```
2. In un altro terminale, lancia i test Playwright:
   ```bash
   npm run test:e2e
   ```

**Nota:**

- I test E2E Playwright non vanno eseguiti tramite Jest.
- Se è la prima volta che usi Playwright, puoi inizializzare i browser con:
  ```bash
  npx playwright install
  ```
