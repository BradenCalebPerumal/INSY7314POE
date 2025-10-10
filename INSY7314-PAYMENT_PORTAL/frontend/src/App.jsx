import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Splash from "./pages/Splash";
import NewPayment from "./pages/NewPayment";
import PaymentsList from "./pages/PaymentsList";
import PaymentAuth from "./pages/PaymentAuth";
import PaymentSummary from "./pages/PaymentSummary";
import RequireAuth from "./components/RequireAuth";
import Beneficiaries from "./pages/Beneficiaries";
import ProfileSettings from "./pages/ProfileSettings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

export default function App() {
  return (
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
        <Route path="/beneficiaries" element={<RequireAuth><Beneficiaries /></RequireAuth>} />
      </Routes>
    </main>
  );
}
