import React, { useEffect, useState } from "react";
import { getJSON } from "../lib/api";
import { useAuth } from "../AuthContext";

export default function PaymentsList() {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await getJSON("/payments", token);
        setPayments(res.payments || []);
      } catch (e) { console.error(e); }
    }
    load();
  }, [token]);

  return (
    <div style={{ maxWidth: 900, margin: "40px auto" }}>
      <h2>Your Payments</h2>
      {payments.length === 0 && <p>No payments yet</p>}
      {payments.map(p => (
        <div key={p.id} style={{ border: "1px solid #eee", padding: 12, marginBottom: 8 }}>
          <div><strong>{p.amount} {p.currency}</strong> — {p.provider}</div>
          <div>Beneficiary: {p.beneficiaryName} ({p.beneficiaryAccount})</div>
          <div>SWIFT: {p.beneficiarySwift}</div>
          <div>Status: {p.status} — {new Date(p.createdAt).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
