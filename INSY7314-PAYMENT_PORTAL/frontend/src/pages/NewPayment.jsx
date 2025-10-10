// frontend/src/pages/NewPayment.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postJSON, getJSON } from "../lib/api";
import { useAuth } from "../AuthContext";
import ReCaptchaBox from "../components/ReCaptchaBox";
import { reAmount, reSwift, currencyAllow } from "../lib/validators"; // ensure currencyAllow is exported

export default function NewPayment() {
  const navigate = useNavigate();
  const { token } = useAuth();

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
      // ✅ send token in Authorization header
      const res = await postJSON(
        "/payments",
        { ...form, saveBeneficiary, captchaToken },
        token
      );
      // ✅ go straight to the 59s auth screen
      navigate(`/pay/auth/${res.paymentId}`);
    } catch (err) {
      setErrors([err.message || String(err)]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "40px auto" }}>
      <h2>New Payment</h2>

      {errors.length > 0 && (
        <div style={{ background: "#fee", border: "1px solid #f99", padding: 12, borderRadius: 8 }}>
          <ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </div>
      )}

      <form onSubmit={onSubmit}>
        <label>Amount</label>
        <input
          name="amount"
          value={form.amount}
          onChange={onChange}
          placeholder="e.g. 1000.00"
          inputMode="decimal"
        />

        <label style={{ marginTop: 8 }}>Currency</label>
        <select name="currency" value={form.currency} onChange={onChange}>
          {Array.from(currencyAllow).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <label style={{ marginTop: 8 }}>Provider</label>
        <input name="provider" value={form.provider} onChange={onChange} readOnly />

        <hr />

        <div>
          <h4>Saved beneficiaries</h4>
          {beneficiaries.length === 0 && <p>No saved beneficiaries</p>}
          {beneficiaries.map((b) => (
            <div key={b.id} style={{ border: "1px solid #eee", padding: 8, marginBottom: 6 }}>
              <strong>{b.name}</strong>
              <div>Account: {b.accountNumber}</div>
              <div>SWIFT: {b.swift}</div>
              <button type="button" onClick={() => selectBeneficiary(b)}>Use</button>
            </div>
          ))}
        </div>

        <label style={{ marginTop: 8 }}>Beneficiary name</label>
        <input name="beneficiaryName" value={form.beneficiaryName} onChange={onChange} />

        <label style={{ marginTop: 8 }}>Beneficiary account</label>
        <input
          name="beneficiaryAccount"
          value={form.beneficiaryAccount}
          onChange={onChange}
          inputMode="numeric"
        />

        <label style={{ marginTop: 8 }}>Beneficiary SWIFT/BIC</label>
        <input
          name="beneficiarySwift"
          value={form.beneficiarySwift}
          onChange={onChange}
          style={{ textTransform: "uppercase" }}
        />

        <div style={{ marginTop: 8 }}>
          <label>
            <input
              type="checkbox"
              checked={saveBeneficiary}
              onChange={(e) => setSaveBeneficiary(e.target.checked)}
            />
            Save beneficiary for later
          </label>
        </div>

        <ReCaptchaBox siteKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY} onChange={setCaptchaToken} />

        <button disabled={busy} style={{ marginTop: 12 }}>
          {busy ? "Processing..." : "Pay Now"}
        </button>
      </form>
    </div>
  );
}
