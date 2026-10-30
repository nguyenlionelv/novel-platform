"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { accountAction, useAccount } from "./provider";

const date = (value: string) => new Date(value).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
export function AccountPage() {
  const { state, error, refresh } = useAccount();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  async function act(data: Record<string, unknown>) {
    setBusy(true); setNotice("");
    try { await accountAction(data); await refresh(); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Chưa hoàn tất. Hãy thử lại."); }
    finally { setBusy(false); }
  }
  async function logout() {
    setBusy(true); setNotice("");
    try { const response = await fetch("/api/reader/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) }); if (!response.ok) throw new Error(); await refresh(); }
    catch { setNotice("Chưa đăng xuất được. Hãy thử lại."); }
    finally { setBusy(false); }
  }
  function rename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); void act({ action: "profile", displayName: new FormData(event.currentTarget).get("displayName") });
  }
  if (error) return <div role="alert" className="account-card">{error}<button className="public-button secondary" onClick={() => void refresh()}>Thử lại</button></div>;
  if (!state) return <p role="status">Đang tải tài khoản…</p>;
  if (!state.profile) return <div className="account-card"><h1 className="font-serif text-3xl">Tài khoản độc giả</h1><p className="my-4">Đăng nhập để đồng bộ tiến độ và dấu đọc tiếp.</p><Link href="/dang-nhap" className="public-button primary">Đăng nhập / Đăng ký</Link></div>;
  return <>
    <div className="flex flex-wrap justify-between items-center gap-4 mb-6"><h1 className="font-serif text-3xl">Xin chào, {state.profile.display_name}</h1><button disabled={busy} className="public-button secondary" onClick={() => void logout()}>Đăng xuất</button></div>
    {notice && <p role="alert" className="admin-message error mb-5">{notice}</p>}
    <section className="account-card"><h2 className="font-serif text-2xl">Hồ sơ</h2><form onSubmit={rename} className="flex flex-wrap items-end gap-3 mt-4"><label>Tên hiển thị<input key={state.profile.display_name} name="displayName" defaultValue={state.profile.display_name} required maxLength={50} /></label><button disabled={busy} className="public-button secondary">Lưu tên</button></form></section>
    <section className="account-card"><h2 className="font-serif text-2xl">Dấu đọc tiếp</h2>{state.bookmark ? <div className="mt-4"><p>Chương {state.bookmark.position}: {state.bookmark.title}</p><div className="flex flex-wrap gap-3 mt-4"><Link prefetch={false} className="public-button primary" href={`/chuong/${state.bookmark.chapter_id}?resume=${state.bookmark.id}`}>Về vị trí đã đánh dấu</Link><button disabled={busy} className="public-button secondary" onClick={() => void act({ action: "remove-bookmark", id: state.bookmark!.id })}>Bỏ dấu</button></div><p className="text-sm text-muted mt-3">Mỗi tài khoản giữ một dấu; bỏ dấu cũ trước khi đặt dấu mới.</p></div> : <p className="mt-4 text-muted">Bạn chưa đặt dấu đọc tiếp.</p>}</section>
    <section className="account-card" id="thong-bao"><div className="flex flex-wrap gap-3 justify-between items-center"><h2 className="font-serif text-2xl">Chương mới {state.unread > 0 && `(${state.unread} chưa xem)`}</h2>{state.unread > 0 && <button disabled={busy} className="public-button secondary" onClick={() => void act({ action: "read-notifications", before: state.notifications[0].created_at })}>Đánh dấu đã xem</button>}</div><p className="mt-3 text-sm text-muted">30 thông báo gần nhất từ khi bạn tạo hồ sơ.</p>{state.notifications.length ? <ul className="account-list">{state.notifications.map(item => <li key={item.chapter_id}><Link prefetch={false} href={`/chuong/${item.chapter_id}`}>{item.unread && "● Mới · "}Chương {item.position}: {item.title}</Link><time dateTime={item.created_at}>{date(item.created_at)}</time></li>)}</ul> : <p className="mt-4 text-muted">Chưa có chương mới.</p>}</section>
    <section className="account-card"><h2 className="font-serif text-2xl">Đánh giá của tôi</h2><p className="mt-3 text-sm text-muted">100 đánh giá gần nhất. Đánh giá đã gửi giữ tên tại thời điểm gửi.</p>{state.reviews.length ? <ul className="account-list">{state.reviews.map(item => <li key={item.id}><p>{item.rating}/5 sao{item.is_hidden && " · Đã được quản trị viên ẩn"}</p><time dateTime={item.created_at}>{date(item.created_at)}</time><p className="whitespace-pre-wrap break-words mt-2">{item.comment}</p></li>)}</ul> : <p className="mt-4 text-muted">Bạn chưa gửi đánh giá.</p>}</section>
    <section className="account-card"><h2 className="font-serif text-2xl">Tiến độ đọc</h2>{state.progress.length ? <ul className="account-list">{state.progress.map(item => <li key={item.chapter_id}><Link prefetch={false} href={`/chuong/${item.chapter_id}`}>Chương {item.position}: {item.title}</Link><span className="text-sm">{item.progress >= .9 ? "Đã đọc" : "Đang đọc"}</span></li>)}</ul> : <p className="mt-4 text-muted">Chọn một chương để bắt đầu đọc.</p>}</section>
  </>;
}
