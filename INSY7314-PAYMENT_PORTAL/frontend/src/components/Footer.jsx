import React from "react";
import "../styles/footer.css";

export default function Footer() {
  return (
    <footer className="mh-footer">
      <div className="mh-footer-inner">
        <div className="col">
          <h4>MacroHard Bank Inc</h4>
          <p>Secure. Global. Instant.</p>
        </div>
        <div className="col">
          <h5>Company</h5>
          <a href="/about">About</a>
          <a href="/careers">Careers</a>
          <a href="/press">Press</a>
        </div>
        <div className="col">
          <h5>Legal</h5>
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
          <a href="/security">Security</a>
        </div>
        <div className="col">
          <h5>Help</h5>
          <a href="/support">Support Center</a>
          <a href="/contact">Contact Us</a>
          <a href="/status">System Status</a>
        </div>
      </div>
      <div className="mh-footer-bar">
        <span>© {new Date().getFullYear()} MacroHard Bank Inc. All rights reserved.</span>
        <span className="badges">PCI DSS • ISO 27001 • TLS 1.3</span>
      </div>
    </footer>
  );
}
