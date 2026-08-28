// Script per testare autenticazione con email reale
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anonKey) throw new Error("Missing Supabase test environment variables");

const supabase = createClient(url, anonKey);

async function testSimpleAuth() {
  console.log("🔐 Test Autenticazione Supabase\n");

  // Prova con email standard (NO +)
  const testEmail = "testuser@gmail.com";
  const testPassword = "Password123!";

  console.log("📧 Email test:", testEmail);
  console.log("🔑 Password:", testPassword);
  console.log("");

  // Sign up
  console.log("1️⃣  Tentativo registrazione...");
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (error) {
    console.log("❌ ERRORE:", error.message);
    console.log("📊 Status:", error.status);
    console.log("🔖 Code:", error.code);
    console.log("");

    // Diagnosi errore
    if (error.code === 'email_address_invalid') {
      console.log("⚠️  Il server Supabase rifiuta questo formato email!");
      console.log("");
      console.log("🔧 SOLUZIONI POSSIBILI:");
      console.log("1. Controlla Supabase Dashboard → Authentication → Providers");
      console.log("   Verifica che 'Email' provider sia abilitato");
      console.log("");
      console.log("2. Controlla Supabase Dashboard → Authentication → Settings");
      console.log("   Verifica 'Email Auth' settings");
      console.log("");
      console.log("3. Controlla se c'è un 'Email Domain Allowlist' configurato");
      console.log("   che blocca determinati domini");
    }
  } else {
    console.log("✅ REGISTRAZIONE RIUSCITA!");
    console.log("");
    console.log("👤 User ID:", data.user?.id);
    console.log("📧 Email:", data.user?.email);
    console.log("✉️  Email confirmed?:", data.user?.email_confirmed_at ? "SÌ" : "NO - richiesta conferma");
    console.log("🔐 Session presente?:", data.session ? "SÌ" : "NO");

    if (!data.session) {
      console.log("");
      console.log("⚠️  Nessuna sessione attiva = CONFERMA EMAIL RICHIESTA");
      console.log("📬 Controlla la casella email:", testEmail);
      console.log("");
      console.log("💡 Per DISABILITARE la conferma email (solo test):");
      console.log("   Supabase Dashboard → Authentication → Settings");
      console.log("   → Disable 'Confirm email'");
    }
  }

  // Controlla sessione corrente
  console.log("\n2️⃣  Verifica sessione corrente...");
  const { data: sessionData } = await supabase.auth.getSession();
  console.log("Sessione attiva?:", sessionData.session ? "SÌ" : "NO");
}

testSimpleAuth().catch(err => {
  console.error("\n❌ ERRORE FATALE:");
  console.error(err);
});
