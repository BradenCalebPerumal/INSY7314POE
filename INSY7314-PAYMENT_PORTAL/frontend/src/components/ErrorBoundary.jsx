import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(p){ super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err){ return { err }; }
  componentDidCatch(err, info){ console.error("Render error:", err, info); }
  render(){
    if (this.state.err) {
      return (
        <div style={{ padding:16, fontFamily:"Inter, system-ui, sans-serif" }}>
          <h2>Something broke while rendering 😬</h2>
          <pre style={{ whiteSpace:"pre-wrap", background:"#fff3cd", padding:12, borderRadius:8 }}>
            {String(this.state.err?.message || this.state.err)}
          </pre>
          <p>Open DevTools → Console for stack trace.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
