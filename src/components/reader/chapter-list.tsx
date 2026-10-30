"use client";

import Link from "next/link";
import { useState } from "react";
import type { ChapterPage } from "@/lib/reader/types";
import { useAccount } from "@/components/account/provider";

export function ChapterList({ initialPage, currentId, onNavigate }: { initialPage: ChapterPage; currentId?: string; onNavigate?: () => void }) {
  const { state } = useAccount();
  const progress = new Map(state?.progress.map(item => [item.chapter_id, item.progress]));
  const [page, setPage] = useState(initialPage);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function more() {
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/chapters?after=${page.chapters.at(-1)?.position ?? 0}`, { cache: "no-store" });
      if (!response.ok) throw new Error();
      const next: ChapterPage = await response.json();
      setPage(current => ({ chapters: [...current.chapters, ...next.chapters.filter(chapter => !current.chapters.some(existing => existing.id === chapter.id))], hasMore: next.hasMore }));
    } catch { setError("Chưa tải được mục lục. Vui lòng thử lại."); }
    finally { setBusy(false); }
  }

  if (!page.chapters.length) return <p className="public-empty">Truyện chưa có chương được đăng.</p>;

  return <>
    <ol className="chapter-list" aria-label="Danh sách chương">
      {page.chapters.map(chapter => <li key={chapter.id}><Link prefetch={false} href={`/chuong/${chapter.id}`} aria-current={currentId === chapter.id ? "page" : undefined} onClick={onNavigate}><span className="chapter-number">{chapter.position}</span><span className="min-w-0 flex-1 break-words">{chapter.title}{state?.profile && <small className="block mt-1 text-muted">{!progress.has(chapter.id) ? "Chưa đọc" : progress.get(chapter.id)! >= .9 ? "Đã đọc" : "Đang đọc"}</small>}</span><span aria-hidden="true" className="text-accent">{currentId === chapter.id ? "•" : "→"}</span></Link></li>)}
    </ol>
    {page.hasMore && <button type="button" className="public-button secondary mt-6" disabled={busy} onClick={() => void more()}>{busy ? "Đang tải…" : "Xem thêm chương"}</button>}
    {error && <p role="alert" className="mt-4 text-sm text-red-800">{error}</p>}
  </>;
}
