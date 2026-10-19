"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import type { ReviewPage } from "@/lib/reviews/types";

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function Reviews({ initialPage }: { initialPage: ReviewPage }) {
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
  const [page, setPage] = useState(initialPage);
  const [displayName, setDisplayName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [website, setWebsite] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ text: "", error: false });
  const [listError, setListError] = useState("");

  async function loadMore() {
    setLoading(true); setListError("");
    try {
      const last = page.reviews.at(-1);
      const response = await fetch(`/api/reviews${last ? `?before=${encodeURIComponent(`${last.created_at}|${last.id}`)}` : ""}`, { cache: "no-store" });
      if (!response.ok) throw new Error();
      const next: ReviewPage = await response.json();
      setPage(current => ({ ...next, reviews: [...current.reviews, ...next.reviews.filter(review => !current.reviews.some(item => item.id === review.id))] }));
    } catch { setListError("Chưa tải được đánh giá. Vui lòng thử lại."); }
    finally { setLoading(false); }
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSending(true); setNotice({ text: "", error: false });
    try {
      const response = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayName, rating, comment, website }) });
      if (!response.ok) { const data = await response.json().catch(() => null); throw new Error(data?.error || "Chưa gửi được đánh giá. Nội dung vẫn được giữ; hãy thử lại."); }
      setDisplayName(""); setRating(0); setComment(""); setNotice({ text: "Đã gửi đánh giá.", error: false });
      try {
        const updated = await fetch("/api/reviews", { cache: "no-store" });
        if (!updated.ok) throw new Error();
        setPage(await updated.json()); setListError("");
      } catch { setNotice({ text: "Đã gửi đánh giá. Chưa tải lại được danh sách; hãy tải lại trang để xem.", error: false }); }
    } catch (error) { setNotice({ text: error instanceof Error && !(error instanceof TypeError) ? error.message : "Không thể kết nối. Nội dung vẫn được giữ; hãy thử lại.", error: true }); }
    finally { setSending(false); }
  }

  return <section id="danh-gia" aria-labelledby="reviews-heading" className="public-section mt-8 scroll-mt-6">
    <div className="public-section-heading"><div><p className="public-eyebrow">GỬI LẠI MỘT CẢM NHẬN</p><h2 id="reviews-heading" className="font-serif text-3xl">Đánh giá truyện</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted">Đánh giá chung của truyện, hiển thị ở mọi chương.</p></div><div id="review-summary" aria-live="polite" className="text-right">{page.summary.count > 0 && page.summary.average !== null ? <><p className="text-xl font-semibold text-accent">{page.summary.average.toFixed(1).replace(".", ",")} <span className="text-sm font-normal text-muted">/ 5</span></p><p className="mt-1 text-xs text-muted">{page.summary.count} đánh giá</p></> : <p className="text-sm text-muted">Chưa có đánh giá.</p>}</div></div>
    <form onSubmit={send} className="review-form">
      <fieldset disabled={!ready || sending} className="grid min-w-0 gap-5">
        <div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="review-name">Tên của bạn</label><input id="review-name" autoComplete="nickname" required maxLength={50} value={displayName} onChange={event => setDisplayName(event.target.value)} /></div><fieldset><legend className="review-label">Số sao</legend><div className="review-stars">{[1, 2, 3, 4, 5].map(star => <label key={star} className={rating === star ? "selected" : ""}><input type="radio" name="review-rating" required value={star} checked={rating === star} aria-label={`${star} sao`} onChange={() => setRating(star)} /><span aria-hidden="true">{star} ★</span></label>)}</div></fieldset></div>
        <div><label htmlFor="review-comment">Nhận xét <span className="font-normal text-muted">(không bắt buộc)</span></label><textarea id="review-comment" rows={4} maxLength={1000} value={comment} onChange={event => setComment(event.target.value)} /><p className="mt-2 text-xs text-muted">Tối đa 1.000 ký tự.</p></div>
        <div className="review-honeypot" aria-hidden="true"><label htmlFor="review-website">Website</label><input id="review-website" tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)} /></div>
        <div className="flex flex-wrap items-center justify-between gap-4"><p className="text-xs text-muted">Chỉ cần tên và số sao, không cần tài khoản.</p><button type="submit" className="public-button primary">{sending ? "Đang gửi…" : "Gửi đánh giá"}</button></div>
      </fieldset>
      {notice.text && <p role={notice.error ? "alert" : "status"} className={`admin-message mt-4 ${notice.error ? "error" : "success"}`}>{notice.text}</p>}
    </form>
    {page.reviews.length > 0 && <ul className="review-list" aria-label="Đánh giá của độc giả">{page.reviews.map(review => <li key={review.id}><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="break-words font-semibold">{review.display_name}</p><time dateTime={review.created_at} className="mt-1 block text-xs text-muted">{new Date(review.created_at).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</time></div><p className="text-sm text-accent">{review.rating}/5 sao</p></div>{review.comment && <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-muted">{review.comment}</p>}</li>)}</ul>}
    {page.hasMore && <button type="button" className="public-button secondary mt-5" disabled={loading || sending} onClick={() => void loadMore()}>{loading ? "Đang tải…" : "Xem thêm đánh giá"}</button>}
    {listError && <p role="alert" className="mt-4 text-sm text-red-800">{listError}</p>}
  </section>;
}
