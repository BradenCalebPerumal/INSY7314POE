import React from "react";
import { useLocation, useParams } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { postJSON } from "../lib/api";
import Layout from "../components/Layout";           // navbar + footer
import "../pages/auth.css";                          // reuse your glass/orbs
import "./pay-summary.css";                          // page-specific visuals

export default function PaymentSummary() {
  const { id } = useParams();
  const { state } = useLocation();                   // summary passed via state
  const { token, username, setToken, setUsername } = useAuth();

  const s = state || {}; // amount, currency, beneficiaryName, popRef, etc.

  async function emailPop() {
    const to = prompt("Enter email address to send POP to:");
    if (!to) return;
    try {
      await postJSON(`/payments/${id}/email-pop`, { to }, token);
      alert("POP email queued.");
    } catch (e) {
      alert(e.message);
    }
  }

  // PaymentSummary.jsx
  function downloadPop() {
    (async () => {
      try {
        const base = import.meta.env.VITE_API_BASE || "http://localhost:4000";
        const resp = await fetch(`${base}/payments/${id}/pop.pdf`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(text || "Failed to download POP");
        }
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `POP-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch (e) {
        alert(e.message);
      }
    })();
  }

  const isAuthed = Boolean(token);
  const logout = () => { setToken?.(""); setUsername?.(""); };

  return (
    <Layout username={username} isAuthed={isAuthed} onLogout={logout}>
      <section className="auth-hero ready paysum-hero">
        {/* background orbs + twinkles (matches your theme) */}
        <div className="auth-bg" aria-hidden="true">
          <span className="orb orb-a" />
          <span className="orb orb-b" />
          <span className="orb orb-c" />
          <div className="particles">
            {Array.from({ length: 40 }).map((_, i) => (
              <span key={i} style={{ "--i": i }} />
            ))}
          </div>
        </div>

        <div className="auth-wrap">
          <h1 className="fade-up s1 shimmer-text">Payment complete</h1>
          <p className="subtitle fade-up s2">
            Reference: <strong className="mono">{s.popRef || "(generated)"}</strong>
          </p>

          {/* success badge with confetti */}
          <div className="confetti" aria-hidden="true">
            {Array.from({ length: 26 }).map((_, i) => <i key={i} style={{ "--i": i }} />)}
          </div>
          <div className="success-badge fade-up s2" aria-hidden="true">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" opacity=".35"/>
              <path d="M7 12.5l3 3 7-7" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Approved</span>
          </div>

          {/* receipt card */}
          <div className="auth-card glass fancy-glow fade-up s3 paysum-card">
            <div className="receipt">
              <div className="row big">
                <div>Amount</div>
                <div className="mono strong">{s.amount} {s.currency}</div>
              </div>
              <div className="row">
                <div>Provider</div>
                <div className="mono">{s.provider}</div>
              </div>
              <div className="row">
                <div>Beneficiary</div>
                <div className="ellipsis">{s.beneficiaryName}</div>
              </div>
              <div className="row">
                <div>SWIFT/BIC</div>
                <div className="mono">{s.beneficiarySwift}</div>
              </div>
              <div className="row">
                <div>Created</div>
                <div>{s.createdAt ? new Date(s.createdAt).toLocaleString() : "-"}</div>
              </div>
              <div className="row">
                <div>Completed</div>
                <div>{s.completedAt ? new Date(s.completedAt).toLocaleString() : "-"}</div>
              </div>
              <div className="tear" aria-hidden="true" />
            </div>

            {/* actions */}
            <div className="actions">
              <button className="btn solid xlg shimmer cta-magnet" onClick={downloadPop}>
                Download POP (PDF)
              </button>
              <button className="btn ghost xlg" onClick={emailPop}>
                Email POP
              </button>
            </div>

            <div className="f-secure muted" style={{ textAlign: "center" }}>
              TLS 1.3 • Proof of Payment • MT103 available on request
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
