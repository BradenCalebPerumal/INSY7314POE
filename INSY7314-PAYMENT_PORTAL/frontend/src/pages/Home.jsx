import React from "react";
import { useAuth } from "../AuthContext";
import Layout from "../components/Layout";
import "../styles/home.css";

export default function Home() {
  const { token, username, setToken, setUsername } = useAuth();
  function logout() { setToken(""); setUsername(""); }

  const isAuthed = Boolean(token);

  return (
    <Layout username={username} isAuthed={isAuthed} onLogout={logout}>
      <section className="hero">
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-wrap">
          <h1>International Payments Portal</h1>
          <p className="subtitle">
            Move money globally with bank-grade security, real-time FX, and smart compliance.
          </p>

          {!isAuthed ? (
            <div className="cta">
              <a className="btn solid xlg" href="/register">Create account</a>
              <a className="btn ghost xlg" href="/login">Sign in</a>
            </div>
          ) : (
            <div className="welcome-card glass">
              <div className="w-head">
                <span className="hi">Welcome back,</span>
                <strong>{username}</strong>
              </div>
              <div className="w-actions">
                <a className="quick" href="/payments">
                  <span className="q-title">New Payment</span>
                  <span className="q-sub">SWIFT / SEPA / RTP</span>
                </a>
                <a className="quick" href="/beneficiaries">
                  <span className="q-title">Beneficiaries</span>
                  <span className="q-sub">Add & manage payees</span>
                </a>
                <a className="quick" href="/history">
                  <span className="q-title">Payment History</span>
                  <span className="q-sub">Receipts & tracking</span>
                </a>
              </div>
              <div className="w-secure">
                <span>Security: HTTPS • reCAPTCHA • CSRF • Rate-limiting</span>
                <button className="logout-link" onClick={logout}>Log out</button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="features">
        <div className="grid">
          <article className="card glass">
            <h3>Real-time FX</h3>
            <p>Transparent rates with instant previews before you send.</p>
          </article>
          <article className="card glass">
            <h3>Global coverage</h3>
            <p>Send to 180+ countries with multi-rail routing.</p>
          </article>
          <article className="card glass">
            <h3>Compliance first</h3>
            <p>KYC/KYB, AML screening, and continuous monitoring.</p>
          </article>
          <article className="card glass">
            <h3>Receipts & tracking</h3>
            <p>Proof of payment, SWIFT MT103, and live status updates.</p>
          </article>
        </div>
      </section>
    </Layout>
  );
}
