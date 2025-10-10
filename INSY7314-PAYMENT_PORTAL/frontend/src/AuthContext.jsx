import React, { createContext, useContext, useMemo, useState, useEffect } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [username, setUsername] = useState(() => localStorage.getItem("username") || "");
  const [fullName, setFullName] = useState(() => localStorage.getItem("fullName") || "");

  useEffect(() => { token ? localStorage.setItem("token", token) : localStorage.removeItem("token"); }, [token]);
  useEffect(() => { username ? localStorage.setItem("username", username) : localStorage.removeItem("username"); }, [username]);
  useEffect(() => { fullName ? localStorage.setItem("fullName", fullName) : localStorage.removeItem("fullName"); }, [fullName]);

  const value = useMemo(() => ({ token, setToken, username, setUsername, fullName, setFullName }), [token, username, fullName]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
