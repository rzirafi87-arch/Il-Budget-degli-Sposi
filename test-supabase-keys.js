// Test delle chiavi Supabase
const url1 = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key1 = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url1 || !key1) throw new Error("Missing Supabase test environment variables");

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
