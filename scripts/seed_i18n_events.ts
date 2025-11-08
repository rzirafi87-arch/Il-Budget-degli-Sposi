import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const sqlFiles = [
  "supabase/seeds/event_baby_shower_it_en.sql",
  "supabase/seeds/event_proposal_it_en.sql",
];

(async () => {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!);
  for (const f of sqlFiles) {
    const sql = fs.readFileSync(path.resolve(f), "utf8");
    const { error } = await supabase.rpc("exec_sql", { q: sql }); // se non hai exec_sql, esegui via psql o Studio
    if (error) throw error;
    console.log("Seeded:", f);
  }
})();
