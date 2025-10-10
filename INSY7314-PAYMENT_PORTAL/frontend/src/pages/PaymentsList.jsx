import React, { useEffect, useState } from "react";
import { getJSON } from "../lib/api";
import { useAuth } from "../AuthContext";
import Layout from "../components/Layout";
import "../pages/auth.css";
import "../pages/dashboard.css";

export default function PaymentsList() {
  const { token, username, setToken, setUsername } = useAuth();
  const isAuthed = Boolean(token);
  const logout = () => { setToken(""); setUsername(""); };

  const [payments, setPayments] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setBusy(true);
        const res = await getJSON("/payments", token);
        if (!mounted) return;
        setPayments(res.payments || []);
        setError("");
      } catch (e) {
        setError(e.message || "Failed to load payments");
      } finally {
        if (mounted) setBusy(false);
      }
    })();
    return () => { mounted = false; };
  }, [token]);

  return (
    <Layout username={username} isAuthed={isAuthed} onLogout={logout}>
      <section className="auth-hero ready">
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

        <div className="dash-wrap">
          <div className="dash-header fade-up s1">
            <h1 className="shimmer-text">Your Payments</h1>
            <a href="/pay/new" className="btn solid">+ New Payment</a>
          </div>

          {/* error display */}
          {error && (
            <div className="f-error fade-up s2">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* loading skeletons */}
          {busy && (
            <div className="fade-up s2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card glass glow" style={{ marginBottom: 14, padding: 18 }}>
                  <div className="skeleton" style={{ width: "40%", height: 14, marginBottom: 8 }} />
                  <div className="skeleton" style={{ width: "70%", height: 12, marginBottom: 8 }} />
                  <div className="skeleton" style={{ width: "60%", height: 12 }} />
                </div>
              ))}
            </div>
          )}

          {/* list */}
          {!busy && payments.length === 0 && (
            <p className="muted fade-up s2">No payments yet.</p>
          )}

          {!busy && payments.length > 0 && (
            <div className="fade-up s3" style={{ display: "grid", gap: 16 }}>
              {payments.map((p) => (
                <div key={p.id} className="card glass glow hover-lift" style={{ padding: 18 }}>
                  <div className="p-head">
                    <div className="p-amount">
                      <strong className="mono" style={{ fontSize: "1.2rem" }}>
                        {p.amount} {p.currency}
                      </strong>
                      <span className="muted" style={{ marginLeft: 8 }}>{p.provider}</span>
                    </div>
                    <span
                      className={`status ${p.status === "approved" ? "ok" : p.status === "pending" ? "warn" : "err"}`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div className="p-body">
                    <div className="muted">
                      Beneficiary:{" "}
                      <strong>{p.beneficiaryName}</strong>{" "}
                      <span className="mono">({p.beneficiaryAccount})</span>
                    </div>
                    <div className="muted">
                      SWIFT/BIC: <span className="mono">{p.beneficiarySwift}</span>
                    </div>
                    <div className="muted">
                      Created: {new Date(p.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="f-secure muted" style={{ marginTop: 14, textAlign: "center" }}>
            Secured by AES-256 • Rate-limited • TLS 1.3
          </div>
        </div>
      </section>
    </Layout>
  );
}
