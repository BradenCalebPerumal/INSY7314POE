import React from "react";
import { useLocation, useParams } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { postJSON } from "../lib/api";

export default function PaymentSummary() {
  const { id } = useParams();
  const { state } = useLocation(); // summary can be passed via state (fallback to minimal)
  const { token } = useAuth();

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
  
  
  return (
    <div style={{ maxWidth: 720, margin: "60px auto", fontFamily: "Inter, system-ui, sans-serif" }}>
      <h2>Payment complete</h2>
      <p>Reference: <strong>{s.popRef || "(generated)"}</strong></p>
      <div style={{ marginTop: 8 }}>
        <div>Amount: <strong>{s.amount} {s.currency}</strong></div>
        <div>Provider: {s.provider}</div>
        <div>Beneficiary: {s.beneficiaryName}</div>
        <div>SWIFT/BIC: {s.beneficiarySwift}</div>
        <div>Created: {s.createdAt ? new Date(s.createdAt).toLocaleString() : "-"}</div>
        <div>Completed: {s.completedAt ? new Date(s.completedAt).toLocaleString() : "-"}</div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <button onClick={downloadPop}>Download POP (PDF)</button>
        <button onClick={emailPop}>Email POP</button>
      </div>
    </div>
  );
}
