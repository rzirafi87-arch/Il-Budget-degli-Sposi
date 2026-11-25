import { assertSupabaseEnvironment } from '../supabaseEnvironment';
const jwt=(ref:string,role='service_role')=>'header.'+Buffer.from(JSON.stringify({ref,role})).toString('base64url')+'.signature';
describe('Supabase environment alignment',()=>{
 it('accepts aligned legacy server credentials',()=>expect(()=>assertSupabaseEnvironment('https://qa.supabase.co',jwt('qa'),'qa')).not.toThrow());
 it('rejects a Production server key paired with a QA URL without exposing it',()=>expect(()=>assertSupabaseEnvironment('https://qa.supabase.co',jwt('production'),'qa')).toThrow('SUPABASE_SERVER_KEY_PROJECT_MISMATCH'));
 it('rejects an unexpected project URL',()=>expect(()=>assertSupabaseEnvironment('https://production.supabase.co',jwt('production'),'qa')).toThrow('SUPABASE_PROJECT_MISMATCH'));
 it('rejects an anonymous JWT used as a privileged key',()=>expect(()=>assertSupabaseEnvironment('https://qa.supabase.co',jwt('qa','anon'))).toThrow('SUPABASE_SERVER_KEY_ROLE_INVALID'));
 it('rejects malformed JWT payloads',()=>expect(()=>assertSupabaseEnvironment('https://qa.supabase.co','header.invalid.signature')).toThrow('SUPABASE_SERVER_KEY_INVALID'));
 it('supports opaque server keys without attempting to decode them',()=>expect(()=>assertSupabaseEnvironment('https://qa.supabase.co','sb_secret_test','qa')).not.toThrow());
 it('supports local development URLs',()=>expect(()=>assertSupabaseEnvironment('http://localhost:54321','local-test')).not.toThrow());
});
