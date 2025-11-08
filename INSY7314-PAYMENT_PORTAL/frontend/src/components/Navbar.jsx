import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "../styles/navbar.css";
import logo from "../assets/macrohard-logo.png";

export default function Navbar() {
  const navigate = useNavigate();
  const { username, isLoggedIn, isStaff, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();                // clear token/session
    navigate("/");           // redirect to home
  }

  return (
    <header className="mh-nav">
      <div className="mh-nav-inner">
        {/* Brand */}
        <div className="mh-brand" onClick={() => navigate("/")}>
          <img src={logo} alt="MacroHard Bank Inc" />
          <div className="mh-brand-text">
            <span className="bank-name">MacroHard Bank Inc</span>
            <span className="bank-suite">International Payments</span>
          </div>
        </div>

        {/* Main links */}
        <nav className="mh-links">
          <NavLink to="/" end>Home</NavLink>
          {isLoggedIn && <NavLink to="/payments">Payments</NavLink>}
          {isLoggedIn && <NavLink to="/welcome">Dashboard</NavLink>}
          {isLoggedIn && <NavLink to="/beneficiaries">Beneficiaries</NavLink>}
          <NavLink to="/support">Support</NavLink>

          {/* 🏢 Staff Portal visible if staff/admin */}
          {(isStaff || isAdmin) && (
            <NavLink to="/staff">Staff Portal</NavLink>
          )}
        </nav>

        {/* Right side actions */}
        <div className="mh-actions">
          {isLoggedIn ? (
            <div className="mh-user" onClick={() => setOpen(!open)}>
              <div className="avatar">
                {username?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="u-name">{username}</span>

              <div className={`dropdown ${open ? "open" : ""}`}>
                <NavLink to="/settings">Profile</NavLink>
                <NavLink to="/welcome">Dashboard</NavLink>

                {/* Staff/Admin quick access */}
                {(isStaff || isAdmin) && (
                  <NavLink to="/staff">Staff Portal</NavLink>
                )}

                <button onClick={handleLogout} className="logout-btn">
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <div className="mh-auth">
              <NavLink className="btn ghost" to="/login">Sign in</NavLink>
              <NavLink className="btn solid" to="/register">Open account</NavLink>

              {/* Employee login shortcut */}
              <NavLink className="btn ghost" to="/staff/login">
                Employee Login
              </NavLink>
            </div>
          )}
        </div>

        {/* Mobile burger */}
        <button
          className="mh-burger"
          aria-label="Toggle menu"
          onClick={() => document.body.classList.toggle("nav-open")}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
