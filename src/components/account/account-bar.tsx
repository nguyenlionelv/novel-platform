"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAccount } from "./provider";

export function AccountBar() {
  const { state, error, refresh } = useAccount();
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !menu.current?.contains(event.target) && menu.current) menu.current.open = false;
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  function close() { if (menu.current) menu.current.open = false; }
  return <nav aria-label="Tài khoản độc giả" className="account-bar">
    <details ref={menu} className="account-menu" onKeyDown={event => {
      if (event.key === "Escape") { close(); menu.current?.querySelector("summary")?.focus(); }
    }}>
      <summary aria-label="Mở menu tài khoản" title="Tài khoản" className="account-menu-toggle">
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        {!!state?.unread && <span className="account-menu-dot" aria-label="Có thông báo mới" />}
      </summary>
      <div className="account-menu-content">
        {error ? <button type="button" onClick={() => void refresh()}>Thử lại tài khoản</button> : state?.profile ? <>
          {state.bookmark?.available && <Link prefetch={false} href={`/chuong/${state.bookmark.chapter_id}?resume=${state.bookmark.id}`} onClick={close}>Đọc tiếp</Link>}
          <Link prefetch={false} href="/tai-khoan" onClick={close}>Tài khoản{state.unread > 0 ? ` · ${state.unread} thông báo` : ""}</Link>
        </> : <Link prefetch={false} href={`/dang-nhap?next=${encodeURIComponent(pathname)}`} onClick={close}>Đăng nhập / Đăng ký</Link>}
      </div>
    </details>
  </nav>;
}
