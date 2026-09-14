import fs from "node:fs";
import path from "node:path";
const read=(file:string)=>fs.readFileSync(path.join(process.cwd(),file),"utf8");
describe("Branch 48 partner lifecycle",()=>{
 const migration=read("supabase/migrations/20260914150000_branch_48_partner_lifecycle.sql");
 const invitation=read("src/app/api/my/event-invitations/route.ts");
 test("keeps owner/partner as the only roles and adds rejection",()=>{expect(migration).toContain("role = 'partner'");expect(migration).toContain("'rejected'");expect(migration).not.toMatch(/role\s*=\s*'(admin|editor|viewer)'/);});
 test("enforces one active partner and pending invitation",()=>{expect(migration).toContain("event_members_one_active_partner_idx");expect(migration).toContain("event_invitations_one_pending_partner_idx");});
 test("uses hashed one-use tokens and atomic row locking",()=>{expect(migration).toContain("digest(p_token,'sha256')");expect(migration).toContain("for update");expect(invitation).not.toMatch(/invitation:\s*data,\s*token/);});
 test("checks email, owner validity, expiry and active partner",()=>{for(const value of ["INVITATION_EMAIL_MISMATCH","INVITATION_EVENT_INVALID","INVITATION_EXPIRED","PARTNER_ALREADY_ACTIVE"])expect(migration).toContain(value);});
 test("uses configured mailer with controlled resend",()=>{expect(invitation).toContain("sendMail(");expect(invitation).toContain("partner-resend:");expect(invitation).toContain("INVITATION_RESEND_COOLDOWN");});
 test("does not log a token or secret",()=>{expect(invitation).not.toMatch(/console\.(log|error|warn)[^\n]*(token|secret)/i);});
 test.each(["it","en","es","fr","de"])("has %s runtime messages",locale=>{const json=JSON.parse(read(`src/messages/${locale}.json`));expect(json.runtimeUi.partnerLifecycle.states.expired).toBeTruthy();});
 test("provides accept, reject, revoke, remove and leave endpoints",()=>{for(const file of ["src/app/api/invitations/accept/route.ts","src/app/api/invitations/reject/route.ts","src/app/api/my/event-invitations/[id]/route.ts","src/app/api/my/event-members/[id]/route.ts","src/app/api/my/event-members/leave/route.ts"])expect(fs.existsSync(path.join(process.cwd(),file))).toBe(true);});
});
