import { getBrowserClient } from "@/lib/supabaseBrowser";

/** Read tables using the browser session; authorization remains server-side. */
export async function fetchMyTables(): Promise<Response> {
  const { data, error } = await getBrowserClient().auth.getSession();
  if (error) throw error;
  const token = data.session?.access_token;
  return fetch("/api/my/tables", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
}
