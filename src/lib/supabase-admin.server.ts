import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

const missing: string[] = [];
if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
if (!anonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
if (!serviceRole) missing.push("SUPABASE_SERVICE_ROLE_KEY");

if (missing.length > 0) {
  throw new Error(`Missing Supabase credentials for admin client: ${missing.join(", ")}`);
}

export const supabaseAdmin = createClient(url ?? "", serviceRole ?? "", {
  auth: { persistSession: false },
});
