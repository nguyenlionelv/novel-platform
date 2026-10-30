"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type RefObject } from "react";
import { accountAction, useAccount } from "./provider";

function positionAtViewport(article: HTMLElement) {
  const paragraphs = Array.from(article.querySelectorAll("p"));
  const line = Math.min(window.innerHeight * .3, 160);
  let paragraph = paragraphs.findIndex(p => p.getBoundingClientRect().bottom > line);
  if (paragraph < 0) paragraph = Math.max(0, paragraphs.length - 1);
  const rect = paragraphs[paragraph]?.getBoundingClientRect();
  return { paragraph, offset: rect ? Math.max(0, Math.min(1, (line - rect.top) / rect.height)) : 0 };
}

export function ReadingTracker({ chapterId, articleRef }: { chapterId: string; articleRef: RefObject<HTMLElement | null> }) {
  const { state, error, refresh } = useAccount();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [unlocked, setUnlocked] = useState<string | null>(null);
  const [createdHere, setCreatedHere] = useState<string | null>(null);
  const gate = useRef<HTMLDialogElement>(null);
  const bookmark = state?.bookmark;
  const locked = !!bookmark && bookmark.chapter_id === chapterId && bookmark.id !== unlocked && bookmark.id !== createdHere;
  const ready = !!state && !error;
  const profileId = state?.profile?.user_id;

  useEffect(() => {
    if (!locked || !bookmark || !gate.current) return;
    // Wait for local fonts before restoring a paragraph-relative position.
    let active = true;
    void document.fonts.ready.then(() => {
      if (!active) return;
      const article = articleRef.current;
      const paragraphs = article?.querySelectorAll("p");
      const p = paragraphs?.[Math.min(bookmark.paragraph, paragraphs.length - 1)];
      if (p) window.scrollTo({ top: window.scrollY + p.getBoundingClientRect().top + p.getBoundingClientRect().height * bookmark.offset - 140, behavior: "instant" });
      if (!gate.current?.open) gate.current?.showModal();
    });
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { active = false; document.body.style.overflow = before; };
  }, [locked, bookmark, articleRef]);

  useEffect(() => {
    const article = articleRef.current;
    if (!profileId || !ready || locked || !article) return;
    let active = true;
    let lastSent = -1;
    let sending = false;
    let elapsed = 0;
    async function track() {
      if (!active || sending || document.visibilityState !== "visible") return;
      elapsed += 2;
      const rect = article!.getBoundingClientRect();
      // Measure only the chapter, never the review section below it.
      const progress = elapsed < 4 ? 0 : Math.max(0, Math.min(1, (window.innerHeight - rect.top) / rect.height));
      if (lastSent >= 0 && (progress <= lastSent || progress - lastSent < .05 && !(progress >= .9 && lastSent < .9))) return;
      sending = true;
      try {
        await accountAction({ action: "progress", chapterId, progress });
        lastSent = progress;
        if (active && (progress === 0 || progress >= .9)) void refresh();
      } catch { /* A temporary failure retries on the next active interval. */ }
      finally { sending = false; }
    }
    void track();
    const timer = window.setInterval(() => void track(), 2000);
    return () => { active = false; window.clearInterval(timer); };
  }, [chapterId, profileId, ready, locked, articleRef, refresh]);

  async function putBookmark() {
    if (!articleRef.current) return;
    setBusy(true); setNotice("");
    try {
      const pos = positionAtViewport(articleRef.current);
      const result = await accountAction({ action: "bookmark", chapterId, ...pos });
      // The current visit continues. A later visit must clear this saved mark.
      setCreatedHere(result.bookmarkId);
      await refresh(); setNotice("Đã đặt dấu tại vị trí hiện tại.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Chưa đặt được dấu."); }
    finally { setBusy(false); }
  }
  async function clear() {
    if (!bookmark) return;
    setBusy(true); setNotice("");
    try {
      await accountAction({ action: "remove-bookmark", id: bookmark.id });
      setUnlocked(bookmark.id); gate.current?.close();
      await refresh(); setNotice("Đã bỏ dấu. Bạn có thể đọc tiếp và đặt dấu mới.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Chưa bỏ được dấu. Hãy thử lại."); }
    finally { setBusy(false); }
  }
  if (!state?.profile) return null;
  return <>
    <div className="reading-account-tools"><span className="text-sm text-muted">{(state.progress.find(p => p.chapter_id === chapterId)?.progress ?? 0) >= .9 ? "Đã đọc" : "Đang đọc"}</span>{bookmark ? <Link prefetch={false} href="/tai-khoan" className="reader-control">Quản lý dấu đọc tiếp</Link> : <button type="button" disabled={busy || !ready} className="reader-control" onClick={() => void putBookmark()}>Đặt dấu ở vị trí hiện tại</button>}</div>
    {!locked && notice && <p role="status" className="text-sm my-3">{notice}</p>}
    <dialog ref={gate} className="bookmark-dialog" aria-labelledby="bookmark-title" onCancel={event => event.preventDefault()}>
      <h2 id="bookmark-title" className="font-serif text-2xl">Vị trí đọc đã đánh dấu</h2><p className="my-4 leading-7">Bạn đã quay lại dấu đọc tiếp. Hãy bỏ dấu này để tiếp tục đọc; sau đó bạn có thể đặt dấu mới.</p>
      {notice && <p role="alert" className="admin-message error mb-4">{notice}</p>}
      <div className="flex flex-wrap gap-3"><button type="button" disabled={busy} className="public-button primary" onClick={() => void clear()}>{busy ? "Đang bỏ dấu…" : "Bỏ dấu và đọc tiếp"}</button><Link href="/" prefetch={false} className="public-button secondary">Về trang truyện</Link></div>
    </dialog>
  </>;
}
