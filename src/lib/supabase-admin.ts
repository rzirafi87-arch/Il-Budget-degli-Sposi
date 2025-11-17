import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE;

if (!url || !serviceRole) {
  throw new Error("Missing Supabase credentials for admin client");
}

export const supabaseAdmin = createClient(url, serviceRole, {
  auth: { persistSession: false },
});
