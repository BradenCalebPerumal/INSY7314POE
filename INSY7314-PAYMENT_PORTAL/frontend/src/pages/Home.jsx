import React from "react";
import { useAuth } from "../AuthContext";

export default function Home() {
  const { token, username, setToken, setUsername } = useAuth();
  function logout() { setToken(""); setUsername(""); }

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", fontFamily: "Inter, system-ui, sans-serif" }}>
      <h1>International Payments Portal (Customer)</h1>
      {token ? (
        <>
          <p>Welcome, <strong>{username}</strong>.</p>
          <button onClick={logout}>Log out</button>
        </>
      ) : (
        <p>Please register or sign in to proceed.</p>
      )}
      <ul>
        <li>Next: Payments page (amount, currency, SWIFT, etc.)</li>
        <li>Security headers, HTTPS, CAPTCHA, CSRF, rate limiting are enforced server-side.</li>
      </ul>
    </div>
  );
}
