import React from "react";
import { useAuth } from "../AuthContext";
import { Link } from "react-router-dom";

export default function Splash() {
  const { username, fullName } = useAuth();
  const display = fullName || username || "there";

  return (
    <div style={{ maxWidth: 720, margin: "60px auto", textAlign: "center", fontFamily: "Inter, system-ui, sans-serif" }}>
      <h1>Welcome, {display}! 🎉</h1>
      <p>You’re signed in to the International Payments Portal.</p>
      <p style={{ marginTop: 24 }}>
        Next up: make an international payment — choose amount, currency, and SWIFT beneficiary.
      </p>

      {/* ✅ quick access to new payment */}
      <div style={{ marginTop: 28 }}>
        <Link to="/pay/new">
          <button style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #ddd" }}>
            Make a new payment
          </button>
        </Link>
      </div>
    </div>
  );
}
