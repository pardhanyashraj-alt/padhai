async function testLogin() {
  const email = "superadmin@padhai.com";
  const password = "superAdmin@123";
  const endpoints = ["/sudo-admin/login", "/auth/sudo-admin/login"];
  const base = "http://127.0.0.1:8000";

  for (const endpoint of endpoints) {
    const url = `${base}${endpoint}`;
    console.log(`Testing ${url}...`);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      console.log(`Status: ${res.status}`);
      const text = await res.text();
      console.log(`Response: ${text.slice(0, 500)}`);
    } catch (e) {
      console.log(`Error: ${e.message}`);
    }
    console.log("-------------------");
  }
}

testLogin();
