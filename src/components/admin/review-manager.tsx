"use client";

import { useState } from "react";
import type { AdminReview } from "@/lib/admin/types";
import { adminRequest, errorMessage, jsonRequest } from "./client";

export function ReviewManager({ reviews, hasMore, onMore, onHidden, onExpired }: { reviews: AdminReview[]; hasMore: boolean; onMore: () => Promise<void>; onHidden: (id: string) => void; onExpired: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function hide(id: string) {
    setBusy(true); setError("");
    try { await adminRequest("/api/admin/reviews", jsonRequest({ id }), onExpired); onHidden(id); }
    catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }
  async function more() {
    setBusy(true); setError("");
    try { await onMore(); } catch (error) { setError(errorMessage(error)); } finally { setBusy(false); }
  }
  return <section id="danh-gia" className="admin-card scroll-mt-6">
    <div className="admin-section-title"><span className="admin-step">03</span><div><h2>Đánh giá của độc giả</h2><p>Ẩn đánh giá spam hoặc nội dung không phù hợp.</p></div></div>
    {reviews.length ? <ul className="divide-y divide-stone-100">{reviews.map(review => <li key={review.id} className="py-4 first:pt-0">
      <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><p className="break-words font-semibold">{review.display_name} <span className="ml-2 text-sm font-normal text-accent">{review.rating}/5 sao</span></p><p className="mt-1 text-xs text-muted">{new Date(review.created_at).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</p></div><button type="button" disabled={busy || review.is_hidden} className="admin-button secondary" onClick={() => void hide(review.id)}>{review.is_hidden ? "Đã ẩn" : "Ẩn đánh giá"}</button></div>
      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted">{review.comment || "Không có nhận xét kèm theo."}</p>
    </li>)}</ul> : <div className="admin-empty">Chưa có đánh giá nào.</div>}
    {hasMore && <button type="button" disabled={busy} onClick={() => void more()} className="admin-button secondary mt-4">Tải thêm đánh giá</button>}
    {error && <p role="alert" className="admin-message error mt-4">{error}</p>}
  </section>;
}
