"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { ReaderState } from "@/lib/reader-account/types";
import { usePathname } from "next/navigation";

interface AccountContext { state: ReaderState | null; error: string; refresh: () => Promise<void> }
const Context = createContext<AccountContext | null>(null);

export async function accountAction(data: Record<string, unknown>) {
  const response = await fetch("/api/reader", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  if (!response.ok) { const body = await response.json().catch(() => null); throw new Error(body?.error || "Chưa lưu được. Vui lòng thử lại."); }
  return response.json();
}

async function fetchAccount(): Promise<ReaderState> {
  const response = await fetch("/api/reader", { cache: "no-store", signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error();
  return response.json();
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ReaderState | null>(null);
  const [error, setError] = useState("");
  const pathname = usePathname();
  const sequence = useRef(0);
  const refresh = useCallback(async () => {
    const request = ++sequence.current;
    try {
      const next = await fetchAccount();
      if (request === sequence.current) { setState(next); setError(""); }
    } catch { if (request === sequence.current) setError("Chưa tải được tài khoản. Hãy thử lại."); }
  }, []);
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    let active = true;
    const request = ++sequence.current;
    void fetchAccount().then(next => { if (active && request === sequence.current) { setState(next); setError(""); } }).catch(() => { if (active && request === sequence.current) setError("Chưa tải được tài khoản. Hãy thử lại."); });
    return () => { active = false; };
  }, [pathname]);
  useEffect(() => {
    if (!state?.profile) return;
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, 60000);
    return () => window.clearInterval(timer);
  }, [state?.profile, refresh]);
  return <Context.Provider value={{ state, error, refresh }}>{children}</Context.Provider>;
}

export function useAccount() {
  const context = useContext(Context);
  if (!context) throw new Error("AccountProvider missing");
  return context;
}
