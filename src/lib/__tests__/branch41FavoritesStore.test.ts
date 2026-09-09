import fs from "node:fs";
import path from "node:path";

describe("Branch 41 favorites persistence contract", () => {
  const route = fs.readFileSync(
    path.join(process.cwd(), "src/app/api/my/favorites/route.ts"),
    "utf8",
  );
  const migration = fs.readFileSync(
    path.join(process.cwd(), "supabase/migrations/20260909033000_branch_41_user_favorites.sql"),
    "utf8",
  );

  it("backs the authenticated favorites API with a real user-global table", () => {
    expect(route).toContain('.from("user_favorites")');
    expect(migration).toContain("create table if not exists public.user_favorites");
    expect(migration).toContain("user_id uuid not null references auth.users(id) on delete cascade");
    expect(migration).not.toContain("event_id");
  });

  it("allows only the supported polymorphic catalog types", () => {
    expect(migration).toContain("item_type in ('supplier', 'location', 'church')");
    expect(migration).toContain("unique (user_id, item_type, item_id)");
  });

  it("enables owner-only RLS and does not expose favorites to anonymous users", () => {
    expect(migration).toContain("alter table public.user_favorites enable row level security");
    expect(migration).toContain("(select auth.uid()) = user_id");
    expect(migration).toContain("revoke all on table public.user_favorites from public, anon");
  });
});

