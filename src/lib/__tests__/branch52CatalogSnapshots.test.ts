import fs from "node:fs";
import path from "node:path";
import {
  parseCatalogOverrides,
  parsePrivateCatalogCreate,
  resolveCatalogRecord,
} from "@/lib/catalogSnapshotContracts";

const root = process.cwd();
const migration = fs.readFileSync(
  path.join(root, "supabase/migrations/20260919161056_branch_52_event_catalog_snapshots.sql"),
  "utf8",
);

describe("Branch 52 M2 immutable catalog model", () => {
  it("resolves private override before snapshot before current global data", () => {
    expect(resolveCatalogRecord(
      { name: "Global changed", phone: "global", city: "Global city" },
      { name: "Saved name", phone: "snapshot" },
      { phone: "private" },
    )).toEqual({ name: "Saved name", phone: "private", city: "Global city" });
  });

  it("keeps legacy rows compatible by falling back to the global record", () => {
    expect(resolveCatalogRecord({ name: "Legacy global", city: "Licata" }, null, {}))
      .toEqual({ name: "Legacy global", city: "Licata" });
  });

  it("allows descriptive overrides and rejects provenance or identity fields", () => {
    expect(parseCatalogOverrides("supplier", { name: "Privato", phone: "+39 123" })).toEqual({
      ok: true,
      value: { name: "Privato", phone: "+39 123" },
    });
    expect(parseCatalogOverrides("supplier", { source: "forged" })).toEqual({
      ok: false,
      error: "CATALOG_OVERRIDE_FIELD_FORBIDDEN",
    });
    expect(parseCatalogOverrides("supplier", { id: "52200000-0000-4000-8000-000000000001" })).toEqual({
      ok: false,
      error: "CATALOG_OVERRIDE_FIELD_FORBIDDEN",
    });
  });

  it("requires an explicit idempotency key for private-only records", () => {
    const first = parsePrivateCatalogCreate({
      entity_type: "supplier",
      client_key: "52200000-0000-4000-8000-000000000040",
      record: { name: "Same name", city: "Licata" },
    });
    const second = parsePrivateCatalogCreate({
      entity_type: "supplier",
      client_key: "52200000-0000-4000-8000-000000000041",
      record: { name: "Same name", city: "Licata" },
    });
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(first).not.toEqual(second);
    expect(parsePrivateCatalogCreate({ entity_type: "supplier", record: { name: "Missing key" } }))
      .toEqual({ ok: false, error: "INVALID_CLIENT_KEY" });
  });

  it("is schema-only, additive and contains no application-data DML", () => {
    expect(migration).not.toMatch(/^\s*(insert\s+into|update\s+public\.|delete\s+from|truncate\s+)/im);
    expect(migration).not.toMatch(/drop\s+table|drop\s+column|alter\s+column\s+\w+\s+drop\s+not\s+null/i);
    expect(migration).toContain("add column if not exists catalog_snapshot jsonb");
    expect(migration).toContain("create table if not exists public.event_private_catalog_records");
    expect(migration).toContain("unique (event_id, entity_type, client_key)");
  });

  it("locks immutable snapshots while keeping overrides separate", () => {
    expect(migration).toContain("create or replace function public.protect_saved_catalog_snapshot()");
    expect(migration).toContain("saved catalog identity and snapshot are immutable");
    expect(migration).toContain("private catalog identity and snapshot are immutable");
    expect(migration).toContain("private_overrides jsonb not null default '{}'::jsonb");
  });

  it("preserves the two distinct favorite meanings without migration", () => {
    const favoritesRoute = fs.readFileSync(path.join(root, "src/app/api/my/favorites/route.ts"), "utf8");
    const favoritesMigration = fs.readFileSync(path.join(root, "supabase/migrations/20260909033000_branch_41_user_favorites.sql"), "utf8");
    expect(favoritesMigration).not.toContain("event_id");
    expect(favoritesRoute).not.toContain("requireCurrentEvent");
    expect(migration).not.toMatch(/alter table public\.user_favorites/i);
    expect(migration).not.toMatch(/insert\s+into\s+public\.user_favorites/i);
  });

  it.each([0, 1, 3])("keeps personal favorites independent with %i accessible events", () => {
    const favoritesRoute = fs.readFileSync(path.join(root, "src/app/api/my/favorites/route.ts"), "utf8");
    expect(favoritesRoute).toContain('.from("user_favorites")');
    expect(favoritesRoute).not.toContain('.from("events")');
    expect(favoritesRoute).not.toContain("CURRENT_EVENT_COOKIE");
  });

  it("uses explicit projections and never adds a new unsafe cast", () => {
    const files = [
      "src/app/api/my/churches/route.ts",
      "src/app/api/my/locations/route.ts",
      "src/app/api/my/suppliers/route.ts",
      "src/app/api/my/private-catalog/route.ts",
      "src/app/api/my/favorites/route.ts",
    ].map((file) => fs.readFileSync(path.join(root, file), "utf8"));
    for (const source of files) {
      expect(source).not.toContain('select("*")');
      expect(source).not.toContain(" as any");
    }
  });
});
