import fs from "node:fs";

function read(path: string) {
  return fs.readFileSync(path, "utf8");
}

describe("Branch 52 M4 integration boundaries", () => {
  const migration = read("supabase/migrations/20260920072942_branch_52_supplier_timeline_appointments.sql");
  const timelineRoute = read("src/app/api/my/timeline/route.ts");
  const appointmentsRoute = read("src/app/api/my/appointments/route.ts");
  const appointmentRoute = read("src/app/api/my/appointments/[id]/route.ts");

  it("uses additive nullable XOR endpoints and composite same-event foreign keys", () => {
    expect(migration).toContain("add column if not exists private_supplier_id uuid");
    expect(migration).toContain("add column if not exists client_key uuid");
    expect(migration).toContain("timeline_items_event_client_key_uidx");
    expect(migration).toContain("appointments_event_client_key_uidx");
    expect(migration).toContain("enforce_supplier_work_identity_immutable");
    expect(migration).toContain("timeline_items_supplier_xor_check");
    expect(migration).toContain("appointments_supplier_xor_check");
    expect(migration).toContain("foreign key (saved_supplier_id, event_id)");
    expect(migration).toContain("foreign key (private_supplier_id, event_id, private_supplier_entity_type)");
    expect(migration).toContain("on delete set null (saved_supplier_id)");
    expect(migration).toContain("on delete set null (private_supplier_id)");
    expect(migration).not.toMatch(/\binsert\s+into\s+public\.(timeline_items|appointments|suppliers|saved_suppliers)/i);
    expect(migration).not.toMatch(/\bupdate\s+public\.(timeline_items|appointments|suppliers|saved_suppliers)/i);
  });

  it("derives the event server-side, filters every resource mutation and uses explicit projections", () => {
    for (const source of [timelineRoute, appointmentsRoute, appointmentRoute]) {
      expect(source).toContain("requirePlanningSelectionAccess");
      expect(source).not.toContain('.select("*")');
      expect(source).not.toMatch(/\bas any\b/);
    }
    expect(timelineRoute).toContain('.eq("event_id", currentEvent.eventId)');
    expect(appointmentRoute).toContain('.eq("event_id", currentEvent.eventId)');
    expect(timelineRoute).not.toMatch(/body\.event_id|event_id:\s*body/);
    expect(appointmentsRoute).not.toMatch(/body\.event_id|event_id:\s*body/);
  });

  it("uses event-scoped client keys for idempotent retry and concurrent creates", () => {
    expect(timelineRoute).toContain('onConflict: "event_id,client_key"');
    expect(appointmentsRoute).toContain('onConflict: "event_id,client_key"');
    expect(timelineRoute).toContain("ignoreDuplicates: true");
    expect(appointmentsRoute).toContain("ignoreDuplicates: true");
  });

  it("does not create notifications, email, reminders or automatic tasks", () => {
    const implementation = [timelineRoute, appointmentsRoute, appointmentRoute].join("\n");
    expect(implementation).not.toMatch(/payment_reminders|sendEmail|notification|reminder_7d_sent|reminder_48h_sent/);
    expect(implementation).not.toMatch(/cron\/check-appointments/);
  });

  it("provides bidirectional saved/private navigation and accessible manual controls", () => {
    const timelinePage = read("src/app/[locale]/(routes)/timeline/page.tsx");
    const appointmentsPage = read("src/app/[locale]/(routes)/documenti/appuntamenti/page.tsx");
    const globalDetail = read("src/app/[locale]/(routes)/fornitori/[id]/page.tsx");
    const privateDetail = read("src/app/[locale]/(routes)/fornitori/privati/[id]/page.tsx");
    expect(timelinePage).toContain("SupplierSelector");
    expect(appointmentsPage).toContain("SupplierSelector");
    expect(globalDetail).toContain("SupplierWorkSummary");
    expect(privateDetail).toContain("SupplierWorkSummary");
    expect(timelinePage).toContain('aria-live="polite"');
    expect(appointmentsPage).toContain('aria-live="polite"');
  });
});
