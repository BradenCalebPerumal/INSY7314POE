export default function AuthShell({ title, subtitle, children, ready }) {
    return (
      <section className={`auth-hero ${ready ? "ready" : ""}`}>
        <div className="auth-bg" aria-hidden="true">
          <span className="orb orb-a" /><span className="orb orb-b" /><span className="orb orb-c" />
          <div className="particles">{Array.from({ length: 36 }).map((_, i) => <span key={i} style={{ "--i": i }} />)}</div>
        </div>
        <div className="auth-wrap">
          <h1 className="fade-up s1 shimmer-text">{title}</h1>
          <p className="subtitle fade-up s2">{subtitle}</p>
          {children}
        </div>
      </section>
    );
  }
  