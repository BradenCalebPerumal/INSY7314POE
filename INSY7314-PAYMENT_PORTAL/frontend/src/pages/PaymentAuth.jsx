import React, { useEffect, useState } from "react";
import { getJSON, postJSON } from "../lib/api";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function PaymentAuth() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [timeLeft, setTimeLeft] = useState(59);
  const [authToken, setAuthToken] = useState(null);
  const [error, setError] = useState("");

  // Load auth window status + token from backend
  useEffect(() => {
    let timer;
    async function load() {
      try {
        const res = await getJSON(`/payments/${id}/auth`, token);
        if (res.status === "expired") {
          setError("Authentication window expired. Go back and try again.");
          setTimeLeft(0);
          setAuthToken(null);
          return;
        }
        setAuthToken(res.token);
        setTimeLeft(res.remainingSeconds ?? 59);
      } catch (e) {
        setError(e.message || "Failed to load auth window");
      }
    }
    load();

    // simple 1s countdown
    timer = setInterval(() => setTimeLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [id, token]);

  async function confirmAuth() {
    try {
      setError("");
      await postJSON(`/payments/${id}/approve`, { token: authToken }, token);

      // fetch summary for the next page
      const { summary } = await getJSON(`/payments/${id}/summary`, token);
      navigate(`/payments/${id}/summary`, { state: summary });
    } catch (e) {
      setError(e.message || "Approval failed");
    }
  }

  const disabled = timeLeft <= 0 || !authToken;

  return (
    <div style={{ maxWidth: 560, margin: "60px auto", fontFamily: "Inter, system-ui, sans-serif" }}>
      <h2>Authenticate your payment</h2>
      <p>For your security, approve this payment within <strong>{timeLeft}s</strong>.</p>

      {error && (
        <div style={{ background: "#fee", border: "1px solid #f99", padding: 12, borderRadius: 8, margin: "12px 0" }}>
          {error}
        </div>
      )}

      <button onClick={confirmAuth} disabled={disabled} style={{ padding: "10px 16px", borderRadius: 8 }}>
        I approve in my banking app
      </button>

      {timeLeft <= 0 && <p style={{ color: "#b00", marginTop: 12 }}>Authentication window expired. Go back and try again.</p>}
    </div>
  );
}
