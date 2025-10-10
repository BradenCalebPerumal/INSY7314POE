import React from "react";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Splash from "./pages/Splash";
import NewPayment from "./pages/NewPayment";
import PaymentsList from "./pages/PaymentsList";
import PaymentAuth from "./pages/PaymentAuth";
import PaymentSummary from "./pages/PaymentSummary";
import RequireAuth from "./components/RequireAuth";
import { useAuth } from "./AuthContext";

// NEW pages
import ProfileSettings from "./pages/ProfileSettings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

export default function App() {
  const { token, setToken, setUsername, setFullName } = useAuth();
  const navigate = useNavigate();

  function logout() {
    setToken("");
    setUsername("");
    setFullName && setFullName("");
    navigate("/login", { replace: true });
  }

  return (
    <div>
      <nav style={{ display: "flex", gap: 12, padding: 12, borderBottom: "1px solid #eee" }}>
        <Link to="/">Home</Link>

        {!token && (
          <>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
            <Link to="/forgot-password">Forgot Password</Link>
          </>
        )}

        {token && (
          <>
            <Link to="/welcome">Welcome</Link>
            <Link to="/pay/new">New Payment</Link>
            <Link to="/payments">My Payments</Link>
            {/* NEW: profile/settings */}
            <Link to="/settings">Settings</Link>
            <button onClick={logout} style={{ marginLeft: "auto" }}>Logout</button>
          </>
        )}
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* public password recovery */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* protected pages */}
          <Route path="/welcome" element={<RequireAuth><Splash /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><ProfileSettings /></RequireAuth>} />
          <Route path="/pay/new" element={<RequireAuth><NewPayment /></RequireAuth>} />
          <Route path="/payments" element={<RequireAuth><PaymentsList /></RequireAuth>} />
          <Route path="/pay/auth/:id" element={<RequireAuth><PaymentAuth /></RequireAuth>} />
          <Route path="/payments/:id/summary" element={<RequireAuth><PaymentSummary /></RequireAuth>} />
        </Routes>
      </main>
    </div>
  );
}
