import React, { useState } from "react";
import { postJSON } from "../lib/api";
import { useNavigate } from "react-router-dom";
import {
  reFullName, reSAIdNumber, reAccountNumber, reUsername,
  validatePasswordClient
} from "../lib/validators";
import { useAuth } from "../AuthContext";
import PasswordStrength from "../components/PasswordStrength";
import ReCaptchaBox from "../components/ReCaptchaBox";

export default function Register() {
  const navigate = useNavigate();
  const { setToken, setUsername, setFullName } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    idNumber: "",
    accountNumber: "",
    email: "",             // 👈 add email to state
    username: "",
    password: ""
  });

  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    const localErrors = [];

    if (!reFullName.test(form.fullName)) localErrors.push("Full name invalid");
    if (!reSAIdNumber.test(form.idNumber)) localErrors.push("ID number invalid (13 digits)");
    if (!reAccountNumber.test(form.accountNumber)) localErrors.push("Account number invalid (8–16 digits)");
    if (!reUsername.test(form.username)) localErrors.push("Username invalid");

    // simple email sanity check; server is source of truth
    const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!reEmail.test(form.email)) localErrors.push("Email invalid");

    const pwErrs = validatePasswordClient(form.password, {
      username: form.username,
      name: form.fullName
    });
    if (pwErrs.length) localErrors.push(...pwErrs.map(e => `Password: ${e}`));

    if (!captchaToken) localErrors.push("Please complete the CAPTCHA");

    if (localErrors.length) return setErrors(localErrors);

    try {
      setBusy(true);
      setErrors([]);
      // 👇 include email + captcha token
      const res = await postJSON("/auth/register", { ...form, captchaToken });
      setToken(res.token);
      setUsername(res.username);
      if (res.fullName && setFullName) setFullName(res.fullName);
      navigate("/welcome");
    } catch (err) {
      setErrors([err.message]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", fontFamily: "Inter, system-ui, sans-serif" }}>
      <h2>Create your account</h2>
      <p style={{ color: "#666" }}>Fill in your details exactly as per the bank records.</p>

      {errors.length > 0 && (
        <div style={{ background: "#fee", border: "1px solid #f99", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <strong>Fix the following:</strong>
          <ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </div>
      )}

      <form onSubmit={onSubmit}>
        <label>Full name</label>
        <input
          name="fullName"
          value={form.fullName}
          onChange={onChange}
          placeholder="e.g., John D-Lionel"
          required
        />

        <label style={{ marginTop: 8 }}>South African ID (13 digits)</label>
        <input
          name="idNumber"
          value={form.idNumber}
          onChange={onChange}
          inputMode="numeric"
          placeholder="e.g., 9001011234087"
          required
        />

        <label style={{ marginTop: 8 }}>Account number</label>
        <input
          name="accountNumber"
          value={form.accountNumber}
          onChange={onChange}
          inputMode="numeric"
          placeholder="8–16 digits"
          required
        />

        <label style={{ marginTop: 8 }}>Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          placeholder="you@example.com"
          required
        />

        <label style={{ marginTop: 8 }}>Username</label>
        <input
          name="username"
          value={form.username}
          onChange={onChange}
          placeholder="john.lionel"
          required
        />

        <label style={{ marginTop: 8 }}>Password</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type={showPw ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={onChange}
            placeholder="min 12 chars, upper/lower/digit/symbol"
            required
            style={{ flex: 1 }}
          />
          <button type="button" onClick={() => setShowPw(s => !s)}>
            {showPw ? "Hide" : "Show"}
          </button>
        </div>
        <PasswordStrength password={form.password} />

        {/* ✅ mandatory reCAPTCHA */}
        <ReCaptchaBox
          siteKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
          onChange={setCaptchaToken}
        />

        <button disabled={busy} style={{ marginTop: 12 }}>
          {busy ? "Creating..." : "Create account"}
        </button>
      </form>
    </div>
  );
}
