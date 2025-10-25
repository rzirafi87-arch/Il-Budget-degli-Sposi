// Script per testare autenticazione con email reale
import { createClient } from '@supabase/supabase-js';

const url = "https://vsguhivizuneylqhygfk.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzZ3VoaXZpenVuZXlscWh5Z2ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzgwNjEsImV4cCI6MjA3NjU1NDA2MX0.3F_wg8USagvwmNoLpsJtHVUOqVKoXlJdUKvBybbWKr0";

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
