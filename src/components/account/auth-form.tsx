"use client";

import { useState, type FormEvent } from "react";
import { useAccount } from "./provider";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function AuthForm({ next, callbackError }: { next: string; callbackError: boolean }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(callbackError ? "Liên kết đăng nhập đã hết hạn, bị huỷ hoặc chưa cấu hình đúng. Hãy thử lại." : "");
  const { refresh } = useAccount();
  const router = useRouter();
  async function submit(action: "login" | "signup" | "google", form?: HTMLFormElement) {
    setBusy(true); setNotice("");
    const values = form ? Object.fromEntries(new FormData(form)) : {};
    try {
      const response = await fetch("/api/reader/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, action, next }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (data.url) { window.location.assign(data.url); return; }
      if (data.confirmation) { setNotice("Hãy mở email xác nhận để hoàn tất đăng ký. Nếu tài khoản đã có, bạn có thể chuyển sang Đăng nhập."); return; }
      await refresh(); router.replace(next); router.refresh();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Chưa kết nối được. Vui lòng thử lại."); }
    finally { setBusy(false); }
  }
  function send(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void submit(mode, event.currentTarget); }
  return <section className="account-card max-w-lg mx-auto" aria-labelledby="auth-heading">
    <h1 id="auth-heading" className="font-serif text-2xl">{mode === "login" ? "Đăng nhập" : "Đăng ký"}</h1>
    <p className="text-sm text-muted my-3">Lưu tiến độ đọc, dấu đọc tiếp và đánh giá của bạn.</p>
    <div role="tablist" aria-label="Đăng nhập hoặc đăng ký" className="account-tabs">{([ ["login", "Đăng nhập"], ["signup", "Đăng ký"] ] as const).map(([value, label]) => <button key={value} type="button" role="tab" id={`tab-${value}`} aria-controls="auth-fields" aria-selected={mode === value} onClick={() => { setMode(value); setNotice(""); }} disabled={busy}>{label}</button>)}</div>
    <form onSubmit={send} id="auth-fields" role="tabpanel" aria-labelledby={`tab-${mode}`}>
      <fieldset disabled={busy} className="grid gap-4 mt-5">
        {mode === "signup" && <label>Tên hiển thị<input name="displayName" autoComplete="nickname" required maxLength={50} /></label>}
        <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
        <label>Mật khẩu<input key={mode} name="password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={8} maxLength={128} /></label>
        <p className="text-xs text-muted">Mật khẩu từ 8 đến 128 ký tự.{mode === "signup" && " Cần xác nhận email trước khi đăng nhập."}</p>
        <button type="submit" className="public-button primary">{busy ? "Đang xử lý…" : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</button>
      </fieldset>
    </form>
    <p className="text-center text-sm text-muted my-4">hoặc</p>
    <button type="button" className="public-button secondary w-full" disabled={busy} onClick={() => void submit("google")}>Tiếp tục với Google</button>
    {notice && <p role="status" className="admin-message mt-4">{notice}</p>}
    <Link prefetch={false} href="/" className="mt-4 inline-flex min-h-11 items-center text-sm text-muted">← Về trang truyện</Link>
  </section>;
}
