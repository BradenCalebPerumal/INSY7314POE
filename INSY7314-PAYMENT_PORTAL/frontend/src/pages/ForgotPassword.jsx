// frontend/src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { postJSON } from "../lib/api";
import Layout from "../components/Layout";
import { useAuth } from "../AuthContext";
import "../pages/auth.css";

export default function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const { token, username: uName, setToken, setUsername: setUName } = useAuth();
  const isAuthed = Boolean(token);
  const logout = () => { setToken?.(""); setUName?.(""); };

  async function onSubmit(e) {
    e.preventDefault(); setMsg(""); setErr(""); setBusy(true);
    try {
      await postJSON("/auth/forgot-password", { username });
      setMsg("If the account exists and has an email, a reset link was sent.");
    } catch {
      // server replies OK; handle network failures same way
      setMsg("If the account exists and has an email, a reset link was sent.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Layout username={uName} isAuthed={isAuthed} onLogout={logout}>
      <section className="auth-hero ready">
        {/* animated background – matches your theme */}
        <div className="auth-bg" aria-hidden="true">
          <span className="orb orb-a" />
          <span className="orb orb-b" />
          <span className="orb orb-c" />
          <div className="particles">
            {Array.from({ length: 36 }).map((_, i) => (
              <span key={i} style={{ "--i": i }} />
            ))}
          </div>
        </div>

        <div className="auth-wrap">
          <h1 className="fade-up s1 shimmer-text">Forgot Password</h1>
          <p className="subtitle fade-up s2">
            Enter your username to receive a password reset link.
          </p>

          {/* success / error banners using your glass styles */}
          {msg && (
            <div className="fade-up s2" style={{
              border: "1px solid rgba(48,162,120,.35)",
              background: "rgba(48,162,120,.12)",
              color: "#7affc3",
              padding: ".75rem .85rem",
              borderRadius: "10px",
              marginBottom: "12px"
            }}>
              {msg}
            </div>
          )}
          {err && (
            <div className="f-error fade-up s2" role="alert">{err}</div>
          )}

          {/* glass card */}
          <form className="auth-card glass fancy-glow fade-up s3" onSubmit={onSubmit}>
            <div className="f-row">
              <label htmlFor="fp-username">Username</label>
              <div className="field">
                <input
                  id="fp-username"
                  value={username}
                  onChange={(e)=>setUsername(e.target.value)}
                  required
                  placeholder="your.username"
                  autoComplete="username"
                />
                <span className="focus-underline" />
              </div>
            </div>

            <button
              className={`btn solid xlg shimmer cta-magnet ${busy ? "loading" : ""}`}
              style={{ width: "100%" }}
              disabled={busy}
            >
              {busy ? "Sending..." : "Send reset link"}
            </button>

            <div className="f-secure muted" style={{ marginTop: ".8rem", textAlign: "center" }}>
              We never email your full credentials • TLS 1.3 • Rate limiting
            </div>
          </form>

          {/* quick nav help */}
          <div className="f-alt fade-up s3">
            <span className="muted">Remembered it?</span>
            <a className="link" href="/login">Back to sign in</a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
