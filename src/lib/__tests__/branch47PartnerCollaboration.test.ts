import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

describe("Branch 47 partner collaboration contract", () => {
  const migration = read("supabase/migrations/20260913132811_branch_47_partner_collaboration.sql");

  it("defines canonical memberships, invitations and owner-only destructive access", () => {
    expect(migration).toContain("create table if not exists public.event_members");
    expect(migration).toContain("unique (event_id, user_id)");
    expect(migration).toContain("create table if not exists public.event_invitations");
    expect(migration).toContain("alter policy events_delete_own on public.events using (public.is_event_owner(id))");
    expect(migration).toContain("role = 'partner'");
  });

  it("keeps raw tokens out of storage and makes acceptance atomic and server-only", () => {
    expect(migration).toContain("token_hash text not null unique");
    expect(migration).toContain("encode(digest(p_token, 'sha256'), 'hex')");
    expect(migration).toContain("for update;");
    expect(migration).toContain("grant execute on function public.accept_event_invitation(text, uuid) to service_role");
    expect(migration).not.toMatch(/insert into public\.event_invitations[\s\S]{0,500}\btoken\s*[,)]/);
  });

  it("makes canonical membership precede the legacy email fallback", () => {
    expect(migration).toMatch(/not exists \([\s\S]*public\.event_members[\s\S]*and exists \([\s\S]*bride_email/);
    const resolver = read("src/lib/currentEvent.ts");
    expect(resolver).toContain("canonicalEventIds");
    expect(resolver).toContain('membership.status !== "active"');
    expect(resolver).toContain("!canonicalEventIds.has(event.id)");
  });

  it("reuses one expense form in Budget and Accounting and keeps canonical links", () => {
    const budget = read("src/app/[locale]/(routes)/budget/page.tsx");
    const expenses = read("src/app/[locale]/(routes)/spese/page.tsx");
    const footer = read("src/components/Footer.tsx");
    expect(budget).toContain("<ExpenseForm");
    expect(expenses).toContain("<ExpenseForm");
    expect(footer).toContain("/${locale}/contabilita");
    expect(footer).not.toContain("/${locale}/spese");
  });
});
