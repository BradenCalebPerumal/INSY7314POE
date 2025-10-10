import React, { useState } from "react";
import "../styles/navbar.css";
import logo from "../assets/macrohard-logo.png";

export default function Navbar({ username, isAuthed, onLogout }) {
  const [open, setOpen] = useState(false);
  function handleLogout() {
    onLogout();                                  // clears token/session
    navigate("/");                               // redirect to home
  }

  return (
    <header className="mh-nav">
      <div className="mh-nav-inner">
        <div className="mh-brand">
          <img src={logo} alt="MacroHard Bank Inc" />
          <div className="mh-brand-text">
            <span className="bank-name">MacroHard Bank Inc</span>
            <span className="bank-suite">International Payments</span>
          </div>
        </div>

        <nav className="mh-links">
          <a href="/">Home</a>
          <a href="/payments">Payments</a>

          {/* ✅ Only show these if logged in */}
          {isAuthed && (
            <>
             <a href="/welcome">Dashboard</a>
              <a href="/beneficiaries">Beneficiaries</a>
            </>
          )}

          <a href="/support">Support</a>
        </nav>

        <div className="mh-actions">
          {isAuthed ? (
            <div className="mh-user" onClick={() => setOpen(!open)}>
              <div className="avatar">{username?.[0]?.toUpperCase() || "U"}</div>
              <span className="u-name">{username}</span>
              <div className={`dropdown ${open ? "open" : ""}`}>
                <a href="/settings">Profile</a>
                <a href="/welcome">Dashboard</a>
                
{/* ✅ Redirects to home after logout */}
<button onClick={handleLogout} className="logout-btn">
                  Log out
                </button>      
                        </div>
            </div>
          ) : (
            <div className="mh-auth">
              <a className="btn ghost" href="/login">Sign in</a>
              <a className="btn solid" href="/register">Open account</a>
            </div>
          )}
        </div>

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
