# Git Workflow - Il Budget degli Sposi

Guida al workflow Git per il progetto, ottimizzato per l'integrazione con GitHub, Vercel e lo sviluppo collaborativo.

## 🌿 Branching Strategy

### Branch Principali

```
main (production)
  ↑
  └── dev (development)
       ↑
       ├── feature/nome-feature
       ├── fix/nome-fix
       └── hotfix/nome-hotfix
```

### `main` - Production Branch
- **Protetto**: Solo merge tramite PR
- **Deploy**: Automatico su Vercel production
- **Tag**: Ogni release è taggata (v1.0.0, v1.1.0, etc.)
- **Sempre stabile**: Solo codice testato e approvato

### `dev` - Development Branch
- **Integrazione**: Tutte le feature vengono mergiate qui prima
- **Deploy**: Automatico su Vercel preview (opzionale)
- **Testing**: Ambiente di staging per test integrati

### Feature Branches
- **Naming**: `feature/descrizione-breve`
- **Esempi**:
  - `feature/guest-table-assignment`
  - `feature/budget-analytics`
  - `feature/pdf-export-improvements`
- **Lifecycle**: Creato da `dev`, mergiato in `dev`
- **Cancellazione**: Dopo merge, può essere eliminato

### Fix Branches
- **Naming**: `fix/descrizione-bug`
- **Esempi**:
  - `fix/login-redirect-error`
  - `fix/budget-calculation-wrong`
- **Da**: `dev` (se non urgente)
- **A**: `dev`

### Hotfix Branches
- **Naming**: `hotfix/descrizione-urgente`
- **Quando**: Bug critico in production
- **Da**: `main`
- **A**: `main` E `dev` (doppio merge)
- **Deploy**: Immediato in production

## 📝 Commit Message Convention

Seguiamo lo standard **Conventional Commits** per commit chiari e changelog automatici.

### Formato
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types Principali

| Type | Descrizione | Esempi |
|------|-------------|--------|
| `feat` | Nuova funzionalità | `feat(guests): add table assignment UI` |
| `fix` | Bug fix | `fix(budget): correct total calculation` |
| `docs` | Solo documentazione | `docs(readme): update setup instructions` |
| `style` | Formattazione, whitespace | `style(dashboard): improve card spacing` |
| `refactor` | Refactoring senza cambio funzionalità | `refactor(api): simplify auth middleware` |
| `perf` | Miglioramento performance | `perf(dashboard): optimize SQL queries` |
| `test` | Aggiunta test | `test(suppliers): add unit tests` |
| `chore` | Manutenzione, build | `chore(deps): update dependencies` |
| `ci` | Modifiche CI/CD | `ci(github): add automated tests workflow` |
| `revert` | Revert commit precedente | `revert: "feat(guests): add export feature"` |

### Scope Comuni
- `dashboard` - Dashboard principale
- `budget` - Gestione budget
- `guests` - Gestione ospiti
- `suppliers` - Fornitori
- `locations` - Location/chiese
- `auth` - Autenticazione
- `api` - API routes
- `db` - Database/migrations
- `ui` - Componenti UI generici
- `pdf` - Generazione PDF

### Esempi Completi

**Feature con body**:
```
feat(guests): add table assignment drag-and-drop

Implement interactive table assignment with drag-and-drop functionality.
Users can now move guests between tables visually.

- Add DnD library integration
- Create TableAssignment component
- Update guests API to save assignments
```

**Fix semplice**:
```
fix(budget): prevent negative budget values
```

**Breaking change**:
```
feat(api)!: change authentication endpoint structure

BREAKING CHANGE: API routes now require Bearer token in header
instead of query parameter. Update client code accordingly.
```

## 🔄 Workflow Operativo

### 1. Iniziare Nuova Feature

```bash
# Assicurati di essere aggiornato
git checkout dev
git pull origin dev

# Crea branch feature
git checkout -b feature/nome-feature

# Lavora sul codice...
# Commit frequenti con messaggi chiari
git add .
git commit -m "feat(scope): descrizione"

# Push del branch
git push -u origin feature/nome-feature
```

### 2. Aggiornare Branch con Dev

```bash
# Sul tuo feature branch
git fetch origin
git rebase origin/dev

# Se ci sono conflitti, risolvili
git add .
git rebase --continue

# Forza il push (dopo rebase)
git push --force-with-lease
```

### 3. Aprire Pull Request

**Su GitHub**:
1. Vai al repository
2. Click su **"Pull requests" → "New pull request"**
3. Base: `dev` ← Compare: `feature/nome-feature`
4. Compila il template:

```markdown
## Descrizione
Breve descrizione delle modifiche

## Tipo di Cambiamento
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] Ho testato localmente
- [ ] Ho aggiornato la documentazione
- [ ] I miei commit seguono la convention
- [ ] Non ci sono warning ESLint/TypeScript
- [ ] Build production passa (`npm run build`)

## Screenshot (se UI)
[Allega screenshot]
```

### 4. Code Review

**Per il Reviewer**:
- Controlla codice su GitHub
- Testa localmente se necessario:
  ```bash
  git fetch origin
  git checkout feature/nome-feature
  npm install
  npm run dev
  ```
- Lascia commenti inline su GitHub
- Approva o richiedi modifiche

**Per l'Autore**:
- Implementa le modifiche richieste
- Commit e push:
  ```bash
  git add .
  git commit -m "fix(scope): address review comments"
  git push
  ```
- Rispondi ai commenti su GitHub

### 5. Merge su Dev

**Opzioni di merge**:

**A) Squash and Merge (Consigliato)**
- Combina tutti i commit in uno
- Mantiene history di `dev` pulita
- Usa su GitHub UI

**B) Rebase and Merge**
- Mantiene tutti i commit
- History lineare
- Solo se commit sono già puliti

**C) Merge Commit**
- Crea merge commit
- Preserva branch history completa
- Usa per feature complesse

```bash
# Dopo merge, elimina branch locale
git checkout dev
git pull
git branch -d feature/nome-feature

# Elimina branch remoto
git push origin --delete feature/nome-feature
```

### 6. Release su Main

**Processo**:
1. Quando `dev` è stabile e pronto
2. Apri PR: `dev` → `main`
3. Review finale completa
4. Merge su `main` (squash or merge commit)
5. **Tag la release**:
   ```bash
   git checkout main
   git pull
   git tag -a v1.2.0 -m "Release v1.2.0: descrizione breve"
   git push origin v1.2.0
   ```

6. Vercel deploya automaticamente in production

### 7. Hotfix Urgente

```bash
# Da main
git checkout main
git pull origin main
git checkout -b hotfix/descrizione-bug

# Fix il bug
git add .
git commit -m "hotfix(scope): fix critical bug"

# Push
git push -u origin hotfix/descrizione-bug

# Apri PR verso main
# Dopo merge su main, merge anche su dev:
git checkout dev
git pull origin dev
git merge main
git push origin dev
```

## 🔍 Best Practices

### Commit Frequency
✅ **Buono**: Commit piccoli e frequenti
```bash
git commit -m "feat(ui): add button component"
git commit -m "feat(ui): add button variants"
git commit -m "test(ui): add button tests"
```

❌ **Da evitare**: Mega-commit con tutto
```bash
git commit -m "add all new features and fixes"
```

### Commit Atomici
Ogni commit dovrebbe:
- Compilare senza errori
- Testare una singola cosa
- Essere revertibile indipendentemente

### Non Committare

❌ File da `.gitignore`:
- `.env.local`
- `node_modules/`
- `.next/`
- `*.log`
- File personali IDE

❌ Codice commentato/debug:
```javascript
// console.log('debug')
// const oldCode = ...
```

### Before Push Checklist

```bash
# 1. Lint
npm run lint

# 2. Type check
npm run build

# 3. Format
npm run format  # se configurato

# 4. Test (quando implementati)
npm run test
```

## 🛡️ Branch Protection Rules

Configurazione su GitHub: Settings → Branches → Branch protection rules

### Per `main`:
- ✅ Require pull request reviews (almeno 1)
- ✅ Require status checks (CI quando attivo)
- ✅ Require branches to be up to date
- ✅ Do not allow bypassing the above settings
- ✅ Restrict who can push (solo admins)

### Per `dev`:
- ✅ Require pull request reviews
- ✅ Require status checks
- ⚠️ Allow force push (per rebase)

## 🚀 CI/CD Integration (Future)

### GitHub Actions Workflow
`.github/workflows/ci.yml`:
```yaml
name: CI

on:
  pull_request:
    branches: [dev, main]
  push:
    branches: [dev, main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm test
```

### Vercel Integration
- Automatico su ogni push/PR
- Preview deployments per ogni PR
- Production deploy solo da `main`

## 📊 Git Commands Cheat Sheet

```bash
# Status e info
git status                    # Stato working directory
git log --oneline --graph     # History grafica
git diff                      # Modifiche non staged
git diff --staged             # Modifiche staged

# Branching
git branch                    # Lista branch locali
git branch -a                 # Tutti i branch (+ remote)
git branch -d nome            # Delete branch locale
git checkout -b feature/x     # Crea e switch a branch

# Staging e Commit
git add .                     # Stage tutti i file
git add -p                    # Stage interattivo (parti)
git commit -m "message"       # Commit con messaggio
git commit --amend            # Modifica ultimo commit

# Remote
git fetch origin              # Scarica da remote (no merge)
git pull origin dev           # Fetch + merge
git push origin feature/x     # Push branch
git push --force-with-lease   # Force push sicuro

# Stash (salva modifiche temporanee)
git stash                     # Salva modifiche
git stash pop                 # Ripristina ultime modifiche
git stash list                # Lista stash salvati

# Reset (usa con cautela!)
git reset HEAD~1              # Annulla ultimo commit (soft)
git reset --hard HEAD~1       # Annulla ultimo commit (hard!)
git clean -fd                 # Rimuovi file untracked

# Rebase
git rebase dev                # Rebase su dev
git rebase -i HEAD~3          # Interactive rebase (ultimi 3)

# Tag
git tag v1.0.0                # Crea tag lightweight
git tag -a v1.0.0 -m "msg"    # Crea tag annotated
git push origin v1.0.0        # Push tag
```

## 🆘 Troubleshooting

### "Merge conflict"
```bash
# 1. Identifica file in conflitto
git status

# 2. Apri file e risolvi conflitti manualmente
# Cerca markers: <<<<<<< HEAD, =======, >>>>>>>

# 3. Dopo risoluzione
git add file-risolto.ts
git commit -m "resolve merge conflict"
```

### "Accidental commit on wrong branch"
```bash
# 1. Crea branch dal commit corrente
git branch feature/correct-branch

# 2. Torna al branch precedente
git checkout previous-branch

# 3. Reset commit
git reset --hard HEAD~1

# 4. Lavora sul branch corretto
git checkout feature/correct-branch
```

### "Need to undo last push"
```bash
# Solo se nessuno ha ancora pullato!
git reset --hard HEAD~1
git push --force-with-lease
```

### "Diverged branches"
```bash
# Opzione 1: Rebase (preferred)
git pull --rebase origin dev

# Opzione 2: Merge
git pull origin dev
```

---

**Progetto**: Il Budget degli Sposi  
**Workflow**: Feature Branch + Pull Requests  
**Ultima modifica**: Novembre 2025
