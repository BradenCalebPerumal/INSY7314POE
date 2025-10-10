// frontend/src/pages/NewPayment.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postJSON, getJSON } from "../lib/api";
import { useAuth } from "../AuthContext";
import ReCaptchaBox from "../components/ReCaptchaBox";
import Layout from "../components/Layout";                   // ⬅️ brings your navbar + footer
import { reAmount, reSwift, currencyAllow } from "../lib/validators";

// ⬅️ reuse the SAME styles you already have (no new stylesheet)
import "../pages/auth.css";
import "../pages/dashboard.css";   // (ok if you already have it; safe to keep or remove)

export default function NewPayment() {
  const navigate = useNavigate();
  const { token, username, setToken, setUsername } = useAuth();
  const isAuthed = Boolean(token);
  const logout = () => { setToken(""); setUsername(""); };

  const [form, setForm] = useState({
    amount: "",
    currency: "ZAR",
    provider: "SWIFT",
    beneficiaryName: "",
    beneficiaryAccount: "",
    beneficiarySwift: "",
  });
  const [saveBeneficiary, setSaveBeneficiary] = useState(false);
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [beneficiaries, setBeneficiaries] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await getJSON("/payments/beneficiaries", token);
        setBeneficiaries(res.beneficiaries || []);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [token]);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function selectBeneficiary(b) {
    setForm({
      ...form,
      beneficiaryName: b.name,
      beneficiaryAccount: b.accountNumber,
      beneficiarySwift: b.swift,
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    const localErrors = [];
    if (!reAmount.test(form.amount)) localErrors.push("invalid amount");
    if (!currencyAllow.has(form.currency)) localErrors.push("invalid currency");
    if (!reSwift.test(form.beneficiarySwift)) localErrors.push("invalid SWIFT/BIC");
    if (!/^\d{8,20}$/.test(form.beneficiaryAccount)) localErrors.push("invalid account");
    if (!captchaToken) localErrors.push("complete CAPTCHA");
    if (localErrors.length) return setErrors(localErrors);

    try {
      setBusy(true);
      setErrors([]);
      const res = await postJSON("/payments", { ...form, saveBeneficiary, captchaToken }, token);
      navigate(`/pay/auth/${res.paymentId}`);
    } catch (err) {
      setErrors([err.message || String(err)]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Layout username={username} isAuthed={isAuthed} onLogout={logout}>
      {/* use your auth-hero + background orbs/particles for the same vibe */}
      <section className="auth-hero ready">
        {/* animated background (exact classes you already use) */}
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
          <h1 className="fade-up s1 shimmer-text">New Payment</h1>
          <p className="subtitle fade-up s2">Create a secure international transfer.</p>

          {errors.length > 0 && (
            <div className="f-error fade-up s2">
              <strong style={{ display: "block", marginBottom: 6 }}>Please fix:</strong>
              <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
                {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          {/* glass card using your existing classes */}
          <form className="auth-card glass fancy-glow fade-up s3" onSubmit={onSubmit}>
            {/* Amount + Currency (use your field + underline focus styles) */}
            <div className="two-col">
              <div className="f-row">
                <label htmlFor="amount">Amount</label>
                <div className="field">
                  <input
                    id="amount"
                    name="amount"
                    value={form.amount}
                    onChange={onChange}
                    placeholder="e.g. 1000.00"
                    inputMode="decimal"
                  />
                  <span className="focus-underline" />
                </div>
              </div>

              <div className="f-row">
  <label htmlFor="currency">Currency</label>
  <div className="field select">{/* ⬅️ was: className="field" */}
    <select id="currency" name="currency" value={form.currency} onChange={onChange}>
      {Array.from(currencyAllow).map((c) => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
    <span className="focus-underline" />
  </div>
</div>
            </div>

            {/* Provider (read-only) */}
            <div className="f-row">
              <label htmlFor="provider">Provider</label>
              <div className="field">
                <input id="provider" name="provider" value={form.provider} onChange={onChange} readOnly />
                <span className="focus-underline" />
              </div>
            </div>

            {/* Saved beneficiaries — reuse your carousel.one + bene styles */}
            <div className="bene-wrap">
              <div className="card-head">
                <h3>Saved beneficiaries</h3>
                <span className="muted">{beneficiaries.length || 0} saved</span>
              </div>

              {beneficiaries.length === 0 ? (
                <p className="muted">No saved beneficiaries</p>
              ) : (
                <div className="carousel one">
                  <div className="rail">
                    {beneficiaries.map((b) => (
                      <div key={b.id} className="bene full">
                        <div className="avatar">{(b.name || "?").slice(0,1).toUpperCase()}</div>
                        <div className="bene-name">{b.name}</div>
                        <div className="bene-swift mono">Acct: {b.accountNumber}</div>
                        <div className="bene-sub">SWIFT: <span className="mono">{b.swift}</span></div>
                        <button type="button" className="btn small" onClick={() => selectBeneficiary(b)}>
                          Use
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Beneficiary details */}
            <div className="two-col">
              <div className="f-row">
                <label htmlFor="beneficiaryName">Beneficiary name</label>
                <div className="field">
                  <input
                    id="beneficiaryName"
                    name="beneficiaryName"
                    value={form.beneficiaryName}
                    onChange={onChange}
                  />
                  <span className="focus-underline" />
                </div>
              </div>

              <div className="f-row">
                <label htmlFor="beneficiaryAccount">Beneficiary account</label>
                <div className="field">
                  <input
                    id="beneficiaryAccount"
                    name="beneficiaryAccount"
                    value={form.beneficiaryAccount}
                    onChange={onChange}
                    inputMode="numeric"
                  />
                  <span className="focus-underline" />
                </div>
              </div>
            </div>

            <div className="f-row">
              <label htmlFor="beneficiarySwift">Beneficiary SWIFT/BIC</label>
              <div className="field">
                <input
                  id="beneficiarySwift"
                  name="beneficiarySwift"
                  value={form.beneficiarySwift}
                  onChange={onChange}
                  style={{ textTransform: "uppercase" }}
                />
                <span className="focus-underline" />
              </div>
            </div>

            {/* Save toggle (use your checkbox but styled area) */}
            <div className="f-row">
  <label className="save-inline">
    <input
      type="checkbox"
      checked={saveBeneficiary}
      onChange={(e) => setSaveBeneficiary(e.target.checked)}
    />
    Save beneficiary for later
  </label>
</div>

            {/* reCAPTCHA in your captcha-wrap box */}
            <div className="captcha-wrap">
              <span className="captcha-label">Verification</span>
              <div className="captcha-inner">
                <ReCaptchaBox siteKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY} onChange={setCaptchaToken} />
                <span className="captcha-note">Protected against bots & abuse.</span>
              </div>
            </div>

            {/* Submit uses your shimmer + cta-magnet button styles */}
            <button
              disabled={busy}
              className={`btn solid xlg shimmer cta-magnet ${busy ? "loading" : ""}`}
              style={{ width: "100%" }}
            >
              {busy ? "Processing..." : "Pay Now"}
            </button>

            <div className="f-secure muted" style={{ marginTop: ".8rem", textAlign: "center" }}>
              TLS 1.3 • reCAPTCHA • CSRF • Rate limiting
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
}
