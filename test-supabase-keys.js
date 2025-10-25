// Test delle chiavi Supabase
const url1 = "https://vsguhivizuneylqhygfk.supabase.co";
const key1 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzZ3VoaXZpenVuZXlscWh5Z2ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzgwNjEsImV4cCI6MjA3NjU1NDA2MX0.3F_wg8USagvwmNoLpsJtHVUOqVKoXlJdUKvBybbWKr0";

async function testConnection() {
  console.log("🔍 Testing Supabase connection...\n");
  console.log("URL:", url1);
  console.log("Key (first 50 chars):", key1.substring(0, 50) + "...\n");

  try {
    const response = await fetch(`${url1}/rest/v1/`, {
      headers: {
        'apikey': key1,
        'Authorization': `Bearer ${key1}`
      }
    });

    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);

    if (response.ok) {
      console.log("\n✅ Connection successful!");
      const data = await response.json();
      console.log("Response:", data);
    } else {
      console.log("\n❌ Connection failed!");
      const error = await response.text();
      console.log("Error:", error);
    }
  } catch (error) {
    console.log("\n❌ Network error!");
    console.error(error.message);
  }
}

testConnection();
