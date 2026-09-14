import fs from "fs";
import path from "path";

const migration = fs
  .readFileSync(
    path.join(
      process.cwd(),
      "supabase/migrations/20260914114238_branch_48_safe_event_deletion.sql",
    ),
    "utf8",
  )
  .toLowerCase();
const deletionUi = fs.readFileSync(
  path.join(process.cwd(), "src/components/EventDeletionSection.tsx"),
  "utf8",
);
describe("Branch 48 safe event deletion migration", () => {
  it("changes only the blocking budget relation to cascade", () => {
    expect(migration).toContain(
      "foreign key (event_id) references public.events(id) on delete cascade",
    );
  });
  it("contains no existing-data DML or orphan cleanup", () => {
    expect(migration).not.toMatch(
      /\b(insert|update|delete|truncate)\s+(into\s+|from\s+)?public\./,
    );
    expect(migration).not.toMatch(/owner_id|auth\.users|suppliers/);
  });
  it("keeps the destructive dialog responsive and theme-aware", () => {
    expect(deletionUi).toMatch(/max-w-md/);
    expect(deletionUi).toMatch(/p-3 sm:p-4/);
    expect(deletionUi).toMatch(/dark:text-red-400/);
    expect(deletionUi).toMatch(/aria-modal="true"/);
    expect(deletionUi).toMatch(/window\.location\.replace/);
  });
});
