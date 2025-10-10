// frontend/src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { postJSON } from "../lib/api";

export default function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [msg, setMsg] = useState(""); const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault(); setMsg(""); setErr("");
    try {
      await postJSON("/auth/forgot-password", { username });
      setMsg("If the account exists and has an email, a reset link was sent.");
    } catch (e2) {
      // server always replies ok; but handle network failures
      setMsg("If the account exists and has an email, a reset link was sent.");
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "60px auto" }}>
      <h2>Forgot Password</h2>
      {msg && <div style={{ background:"#efe", border:"1px solid #9c9", padding:10, borderRadius:8 }}>{msg}</div>}
      {err && <div style={{ background:"#fee", border:"1px solid #f99", padding:10, borderRadius:8 }}>{err}</div>}
      <form onSubmit={onSubmit}>
        <label>Username</label>
        <input value={username} onChange={e=>setUsername(e.target.value)} required />
        <button style={{marginTop:12}}>Send reset link</button>
      </form>
    </div>
  );
}
