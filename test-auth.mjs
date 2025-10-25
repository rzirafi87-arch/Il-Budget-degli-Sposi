// Script per testare autenticazione Supabase
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vsguhivizuneylqhygfk.supabase.co";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzZ3VoaXZpenVuZXlscWh5Z2ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzgwNjEsImV4cCI6MjA3NjU1NDA2MX0.3F_wg8USagvwmNoLpsJtHVUOqVKoXlJdUKvBybbWKr0";

const supabase = createClient(url, anonKey);

async function testAuth() {
  console.log("🔐 Testing Supabase Auth...\n");

  // Test 1: Sign up
  console.log("1️⃣  Tentativo registrazione...");
  const testEmail = `test+${Date.now()}@example.com`;
  const testPassword = "TestPassword123!";

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (signUpError) {
    console.log("❌ Errore registrazione:", signUpError.message);
    console.log("Dettagli:", signUpError);
  } else {
    console.log("✅ Registrazione riuscita!");
    console.log("User ID:", signUpData.user?.id);
    console.log("Email:", signUpData.user?.email);
    console.log("Confirmed?:", signUpData.user?.email_confirmed_at ? "SÌ" : "NO");
    console.log("\n⚠️  Controlla se è richiesta conferma email in Supabase!");
  }

  // Test 2: Verifica configurazione
  console.log("\n2️⃣  Verifica configurazione Supabase:");
  console.log("URL:", url);
  console.log("Anon Key presente:", anonKey ? "SÌ" : "NO");
  console.log("Anon Key valida:", anonKey && anonKey.length > 100 ? "SÌ" : "NO");

  // Test 3: Prova login (se email auto-confermata)
  console.log("\n3️⃣  Tentativo login con credenziali appena create...");
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    console.log("❌ Errore login:", signInError.message);
    console.log("Status:", signInError.status);
    
    if (signInError.message.includes("Email not confirmed")) {
      console.log("\n💡 SOLUZIONE: Vai su Supabase Dashboard → Authentication → Settings");
      console.log("   Disabilita 'Confirm email' per test rapidi (NON IN PRODUZIONE!)");
    }
    if (signInError.message.includes("Invalid")) {
      console.log("\n💡 SOLUZIONE: Verifica le chiavi API in .env.local");
    }
  } else {
    console.log("✅ Login riuscito!");
    console.log("Access Token:", signInData.session?.access_token?.substring(0, 50) + "...");
  }
}

testAuth().catch(console.error);
