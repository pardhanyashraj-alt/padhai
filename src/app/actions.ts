"use server";

import { getApiBase } from "./lib/api";

export async function proxyLogin(endpoint: string, body: any) {
  const base = getApiBase();
  const url = `${base}${endpoint}`;

  try {
    console.log(`[ProxyLogin] Calling: ${url}`);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const status = res.status;
    const ok = res.ok;
    
    console.log(`[ProxyLogin] Status: ${status}`);
    
    let data = null;
    const responseText = await res.text();
    console.log(`[ProxyLogin] Response: ${responseText.slice(0, 200)}`);

    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = null;
    }

    return { ok, status, data };
  } catch (error) {
    console.error("Server Action Login Error:", error);
    return {
      ok: false,
      status: 500,
      data: { detail: error instanceof Error ? error.message : "Connection failed to backend" },
    };
  }
}
