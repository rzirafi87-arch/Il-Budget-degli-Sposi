Supabase Postgres — Connection Guide

Use these exact values for your project:

- Server: `db.vsguhivizuneylqhygfk.supabase.co`
- Port: `5432` (if blocked, try `6543` pooled)
- Database: `postgres`
- User: `postgres`
- SSL mode: `require`

Connection strings
- Without password (for VS Code forms):
  - `postgresql://postgres@db.vsguhivizuneylqhygfk.supabase.co:5432/postgres?sslmode=require`
- With password (for tools that accept it in the URL):
  - Example with `!` encoded: `postgresql://postgres:YOUR_PASSWORD_URL_ENCODED@db.vsguhivizuneylqhygfk.supabase.co:5432/postgres?sslmode=require`
  - Encode special chars: `!` → `%21`, `@` → `%40`, `#` → `%23`.

VS Code (Microsoft PostgreSQL extension)
1) Create a new connection.
2) Authentication: `Password`.
3) Server: `db.vsguhivizuneylqhygfk.supabase.co` (no `postgresql://`).
4) Port: `5432`.
5) Database: `postgres`.
6) User: `postgres`.
7) SSL: `require`.
8) Password: your DB password from Supabase Project Settings → Database → Connection info.

If you see “getaddrinfo failed”
- Re-type the host by hand (avoid copy/paste typos).
- Flush DNS cache: `ipconfig /flushdns` (Windows).
- Disable VPN/Proxy and retry.
- Test connectivity: see scripts in `scripts/` below.
- If outbound 5432 is blocked, try pooled port 6543:
  - `postgresql://postgres@db.vsguhivizuneylqhygfk.supabase.co:6543/postgres?sslmode=require`

Quick tests (PowerShell)
- DNS: `[System.Net.Dns]::GetHostAddresses("db.vsguhivizuneylqhygfk.supabase.co")`
- Port: `Test-NetConnection db.vsguhivizuneylqhygfk.supabase.co -Port 5432`

psql check (optional)
- `$env:PGPASSWORD='YOUR_PASSWORD'`
- `$env:PGSSLMODE='require'`
- `psql -h db.vsguhivizuneylqhygfk.supabase.co -p 5432 -U postgres -d postgres -c "select now();"`

Security notes
- Do not commit real passwords or keys to git.
- `.env.local` is ignored by git in this repo; keep secrets there if needed.

