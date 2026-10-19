"use client";

import { useState, type FormEvent } from "react";
import { adminRequest, errorMessage, jsonRequest } from "./client";

export function LoginForm({ onSuccess, reauth = false }: { onSuccess: () => Promise<void> | void; reauth?: boolean }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      await adminRequest("/api/admin/session", jsonRequest({ password }));
      setPassword("");
      await onSuccess();
    } catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={login} className="admin-form">
      <label htmlFor={reauth ? "reauth-password" : "admin-password"}>Mật khẩu quản trị</label>
      <input id={reauth ? "reauth-password" : "admin-password"} type="password" autoComplete="current-password" required maxLength={256} value={password} disabled={busy} onChange={event => setPassword(event.target.value)} />
      {error && <p role="alert" className="admin-message error">{error}</p>}
      <button type="submit" className="admin-button primary w-full" disabled={busy}>{busy ? "Đang kiểm tra…" : reauth ? "Đăng nhập lại" : "Vào quản trị"}</button>
    </form>
  );
}
