import React, { useEffect, useMemo, useState } from "react";
import { getJSON } from "../lib/api";
import { useAuth } from "../AuthContext";
import Layout from "../components/Layout";

// reuse your existing styles
import "../pages/auth.css";
import "../pages/dashboard.css";

export default function Beneficiaries() {
  const { token, username, setToken, setUsername } = useAuth();
  const isAuthed = Boolean(token);
  const logout = () => { setToken(""); setUsername(""); };

  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setBusy(true);
        const res = await getJSON("/payments/beneficiaries", token);
        if (!mounted) return;
        setItems(res.beneficiaries || []);
        setError("");
      } catch (e) {
        if (!mounted) return;
        setError(e.message || "Failed to load beneficiaries");
      } finally {
        if (mounted) setBusy(false);
      }
    })();
    return () => { mounted = false; };
  }, [token]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(b =>
      (b.name || "").toLowerCase().includes(s) ||
      (b.accountNumber || "").toLowerCase().includes(s) ||
      (b.swift || "").toLowerCase().includes(s)
    );
  }, [items, q]);

  return (
    <Layout username={username} isAuthed={isAuthed} onLogout={logout}>
      <section className="auth-hero ready">
        {/* animated background — same vibe as other pages */}
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

        <div className="dash-wrap">
          <div className="dash-header fade-up s1">
            <h1 className="shimmer-text">Beneficiaries</h1>
            <a className="btn solid" href="/pay/new" >New Payment</a>
          </div>

          {/* quick filter + count */}
          <div className="card glass fade-up s2" style={{ padding: 12 }}>
            <div style={{ display:"flex", gap:10, alignItems:"center", justifyContent:"space-between", flexWrap:"wrap" }}>
              <div className="muted">{filtered.length} saved</div>
              <div className="field" style={{ minWidth: 220, flex: "0 0 280px" }}>
                <input
                  placeholder="Search name, account, or SWIFT"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <span className="focus-underline" />
              </div>
            </div>
          </div>

          {/* list */}
          <div className="card glass fade-up s3">
            <div className="table">
              <div className="tr th">
                <div>Name</div>
                <div>Account</div>
                <div>SWIFT/BIC</div>
                <div className="right">Actions</div>
                <div className="right">Added</div>
              </div>

              {busy && (
                <>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="tr" aria-busy="true" style={{ opacity:.6 }}>
                      <div className="cell ref"><div className="skeleton" style={{ width:"60%" }} /></div>
                      <div className="cell benef"><div className="skeleton" style={{ width:"70%" }} /></div>
                      <div className="cell amt"><div className="skeleton" style={{ width:"40%" }} /></div>
                      <div className="cell status right"><div className="skeleton" style={{ width:"90px", marginLeft:"auto" }} /></div>
                      <div className="cell date right"><div className="skeleton" style={{ width:"110px", marginLeft:"auto" }} /></div>
                    </div>
                  ))}
                </>
              )}

              {!busy && error && (
                <div className="tr">
                  <div className="cell" style={{ gridColumn: "1 / -1", color:"#ffbcbc" }}>
                    {error}
                  </div>
                </div>
              )}

              {!busy && !error && filtered.length === 0 && (
                <div className="tr">
                  <div className="cell" style={{ gridColumn: "1 / -1" }}>
                    <span className="muted">No beneficiaries found.</span>
                  </div>
                </div>
              )}

              {!busy && !error && filtered.map(b => (
                <div key={b.id} className="tr">
                  <div className="cell ref">
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div className="avatar" style={{ width:28, height:28, borderRadius:8, fontSize:12 }}>
                        {(b.name || "?").slice(0,1).toUpperCase()}
                      </div>
                      <strong className="bene-name">{b.name}</strong>
                    </div>
                  </div>

                  <div className="cell benef mono">{b.accountNumber}</div>
                  <div className="cell mono">{b.swift}</div>

                  <div className="cell right">
                    <a className="btn small" href="/payments" title="Use for new payment">
                      Use
                    </a>
                  </div>

                  <div className="cell date right muted">
                    {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "-"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="f-secure muted" style={{ textAlign:"center", marginTop:8 }}>
            Stored securely • KYC/KYB • AML monitoring
          </div>
        </div>
      </section>
    </Layout>
  );
}
