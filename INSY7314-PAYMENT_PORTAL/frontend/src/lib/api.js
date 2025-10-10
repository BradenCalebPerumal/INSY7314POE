// frontend/src/lib/api.js
// Prefer env; default to your HTTPS dev API.
const API_BASE =
  (import.meta.env.VITE_API_BASE && import.meta.env.VITE_API_BASE.replace(/\/+$/, "")) ||
  "https://localhost:4001";

// Generic request helper with better errors + abort timeout
async function req(method, path, body, token) {
  const url = `${API_BASE}${path}`;
  const auth = token || (typeof localStorage !== "undefined" ? localStorage.getItem("token") : "");

  // 15s safety timeout
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 15000);

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      credentials: "include", // harmless with JWT header; useful if you later add cookies
      mode: "cors",
      signal: ac.signal,
    });
  } catch (e) {
    clearTimeout(t);
    // Typical when backend is down, wrong port, or self-signed cert not trusted
    throw new Error(e?.name === "AbortError" ? "Request timed out" : `Network error: ${e?.message || e}`);
  }
  clearTimeout(t);

  // Try JSON first; fall back to text
  let data = null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try { data = await res.json(); } catch { data = null; }
  } else {
    try { data = await res.text(); } catch { data = null; }
  }

  if (!res.ok) {
    // Build a helpful message from structured payloads or raw text
    if (data && typeof data === "object") {
      const parts = [];
      if (data.error) parts.push(data.error);
      if (Array.isArray(data.errors)) parts.push(data.errors.join(", "));
      if (Array.isArray(data.reason)) parts.push(data.reason.join(", "));
      const msg = parts.filter(Boolean).join(" | ");
      throw new Error(msg || `HTTP ${res.status}`);
    }
    throw new Error(typeof data === "string" && data.trim() ? data.trim() : `HTTP ${res.status}`);
  }

  return data ?? {};
}

export const postJSON = (path, body, token) => req("POST", path, body, token);
export const getJSON  = (path, token)      => req("GET",  path, undefined, token);
export const putJSON  = (path, body, token) => req("PUT",  path, body, token);
export const delJSON  = (path, token)      => req("DELETE", path, undefined, token);
