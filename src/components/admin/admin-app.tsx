"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AdminOverview, AdminReview, ChapterSummary } from "@/lib/admin/types";
import { LoginForm } from "./login-form";
import { NovelForm } from "./novel-form";
import { ChapterManager } from "./chapter-manager";
import { ReviewManager } from "./review-manager";
import { adminRequest, errorMessage } from "./client";

function ReauthDialog({ onSuccess }: { onSuccess: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (!ref.current?.open) ref.current?.showModal(); }, []);
  return <dialog ref={ref} onCancel={event => event.preventDefault()} aria-labelledby="reauth-title" className="admin-dialog"><h2 id="reauth-title" className="font-serif text-2xl">Đăng nhập lại</h2><p className="mb-6 mt-3 text-sm leading-relaxed text-muted">Phiên quản trị đã hết hạn. Nội dung bạn đang nhập vẫn được giữ trên trang này. Đăng nhập lại rồi chọn lưu.</p><LoginForm reauth onSuccess={onSuccess} /></dialog>;
}

export function AdminApp({ initialData }: { initialData: AdminOverview | null }) {
  const [data, setData] = useState(initialData);
  const [expired, setExpired] = useState(false);
  const [novelDirty, setNovelDirty] = useState(false);
  const [chapterDirty, setChapterDirty] = useState(false);
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const onNovelDirty = useCallback((value: boolean) => setNovelDirty(value), []);
  const onChapterDirty = useCallback((value: boolean) => setChapterDirty(value), []);
  const onExpired = useCallback(() => setExpired(true), []);
  const dirty = !!data && (novelDirty || chapterDirty);

  useEffect(() => {
    if (!dirty) return;
    function beforeUnload(event: BeforeUnloadEvent) { event.preventDefault(); event.returnValue = ""; }
    function navigation(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element).closest?.("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin === window.location.origin && url.pathname === window.location.pathname && url.search === window.location.search) return;
      if (!window.confirm("Có nội dung chưa lưu. Rời trang và bỏ thay đổi?")) { event.preventDefault(); event.stopPropagation(); }
    }
    window.addEventListener("beforeunload", beforeUnload); document.addEventListener("click", navigation, true);
    return () => { window.removeEventListener("beforeunload", beforeUnload); document.removeEventListener("click", navigation, true); };
  }, [dirty]);

  async function login() { setData(await adminRequest<AdminOverview>("/api/admin/overview")); }
  async function refresh() { setData(await adminRequest<AdminOverview>("/api/admin/overview", undefined, onExpired)); }
  async function moreChapters() {
    if (!data) return;
    const next = await adminRequest<{ chapters: ChapterSummary[]; hasMore: boolean }>(`/api/admin/chapters?offset=${data.chapters.length}`, undefined, onExpired);
    setData(current => current ? { ...current, chapters: [...current.chapters, ...next.chapters], chaptersHasMore: next.hasMore } : current);
  }
  async function moreReviews() {
    if (!data) return;
    const next = await adminRequest<{ reviews: AdminReview[]; hasMore: boolean }>(`/api/admin/reviews?offset=${data.reviews.length}`, undefined, onExpired);
    setData(current => current ? { ...current, reviews: [...current.reviews, ...next.reviews], reviewsHasMore: next.hasMore } : current);
  }
  async function logout() {
    if (dirty && !window.confirm("Có nội dung chưa lưu. Đăng xuất và bỏ thay đổi?")) return;
    setSigningOut(true); setError("");
    try { await adminRequest("/api/admin/session", { method: "DELETE" }); setData(null); setNovelDirty(false); setChapterDirty(false); setExpired(false); }
    catch (error) { setError(errorMessage(error)); }
    finally { setSigningOut(false); }
  }

  if (!data) return <main className="flex min-h-screen items-center justify-center px-5 py-12"><div className="w-full max-w-md"><Link href="/" className="mb-8 inline-block text-sm text-accent">← Về trang truyện</Link><div className="admin-card !p-7 sm:!p-9"><p className="mb-3 text-xs font-semibold tracking-[0.2em] text-accent">QUẢN TRỊ TRUYỆN</p><h1 className="font-serif text-3xl">Vào quản trị</h1><p className="mb-7 mt-3 text-sm leading-relaxed text-muted">Nhập mật khẩu để cập nhật truyện và đăng những chương mới.</p><LoginForm onSuccess={login} /></div><p className="mt-5 text-center text-xs text-muted">Khu vực dành riêng cho chủ website.</p></div></main>;

  return <main className="mx-auto max-w-[1040px] px-4 py-8 sm:px-6 sm:py-12">
    <header className="mb-8 flex flex-wrap items-start justify-between gap-5"><div><p className="mb-2 text-xs font-semibold tracking-[0.2em] text-accent">KHÔNG GIAN QUẢN TRỊ</p><h1 className="font-serif text-3xl sm:text-4xl">Quản trị truyện</h1><p className="mt-2 max-w-lg break-words text-sm text-muted">{data.novel.title || "Thêm thông tin truyện để bắt đầu."}</p></div><div className="flex flex-wrap gap-3"><a href="/" target="_blank" rel="noreferrer" className="admin-button secondary">Xem trang đọc ↗</a><button type="button" onClick={() => void logout()} disabled={signingOut} className="admin-button secondary">{signingOut ? "Đang đăng xuất…" : "Đăng xuất"}</button></div></header>
    <nav aria-label="Khu vực quản trị" className="mb-7 flex flex-wrap gap-2 rounded-xl border border-stone-200 bg-white p-2"><a href="#thong-tin" className="admin-nav-link">Thông tin truyện</a><a href="#chuong" className="admin-nav-link">Chương</a><a href="#danh-gia" className="admin-nav-link">Đánh giá</a></nav>
    {error && <p role="alert" className="admin-message error mb-5">{error}</p>}
    <div className="grid gap-7">
      <NovelForm novel={data.novel} onSaved={novel => setData(current => current ? { ...current, novel } : current)} onDirty={onNovelDirty} onExpired={onExpired} />
      <ChapterManager chapters={data.chapters} hasMore={data.chaptersHasMore} nextPosition={data.nextPosition} onRefresh={refresh} onMore={moreChapters} onDirty={onChapterDirty} onExpired={onExpired} />
      <ReviewManager reviews={data.reviews} hasMore={data.reviewsHasMore} onMore={moreReviews} onExpired={onExpired} onHidden={id => setData(current => current ? { ...current, reviews: current.reviews.map(review => review.id === id ? { ...review, is_hidden: true } : review) } : current)} />
    </div>
    <p className="mt-8 text-center text-xs text-muted">Chọn lưu sau khi chỉnh sửa. Bản nháp chỉ hiển thị trong quản trị.</p>
    {expired && <ReauthDialog onSuccess={() => setExpired(false)} />}
  </main>;
}
