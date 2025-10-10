import React, { useState } from "react";
import { postJSON } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { reUsername, reAccountNumber } from "../lib/validators";
import { useAuth } from "../AuthContext";
import ReCaptchaBox from "../components/ReCaptchaBox";

export default function Login() {
  const navigate = useNavigate();
  const { setToken, setUsername, setFullName } = useAuth(); // ✅ include setFullName
  const [form, setForm] = useState({ username: "", accountNumber: "", password: "" });
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null); // ✅ captcha state

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    const localErrors = [];
    if (!reUsername.test(form.username)) localErrors.push("Username invalid");
    if (!reAccountNumber.test(form.accountNumber)) localErrors.push("Account number invalid");
    if (!form.password) localErrors.push("Password required");
    if (!captchaToken) localErrors.push("Please complete the CAPTCHA");
    if (localErrors.length) return setErrors(localErrors);

    try {
      setBusy(true); setErrors([]);
      const res = await postJSON("/auth/login", { ...form, captchaToken }); // ✅ send token
      setToken(res.token);
      setUsername(res.username);
      if (res.fullName && setFullName) setFullName(res.fullName);
      navigate("/welcome"); // ✅ go to splash
    } catch (err) {
      setErrors([err.message]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", fontFamily: "Inter, system-ui, sans-serif" }}>
      <h2>Sign in</h2>

      {errors.length > 0 && (
        <div style={{ background: "#fee", border: "1px solid #f99", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <strong>Fix the following:</strong>
          <ul>{errors.map((e,i)=><li key={i}>{e}</li>)}</ul>
        </div>
      )}

      <form onSubmit={onSubmit}>
        <label>Username</label>
        <input name="username" value={form.username} onChange={onChange} required />

        <label style={{ marginTop: 8 }}>Account number</label>
        <input name="accountNumber" value={form.accountNumber} onChange={onChange} inputMode="numeric" required />

        <label style={{ marginTop: 8 }}>Password</label>
        <input type="password" name="password" value={form.password} onChange={onChange} required />

        {/* ✅ mandatory reCAPTCHA */}
        <ReCaptchaBox
          siteKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
          onChange={setCaptchaToken}
        />

        <button disabled={busy} style={{ marginTop: 12 }}>
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
