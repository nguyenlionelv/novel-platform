"use client";

import Link from "next/link";

export function ChapterNavigation({ previousId, nextId, position, onOpenToc }: { previousId: string | null; nextId: string | null; position: "top" | "bottom"; onOpenToc: () => void }) {
  return <nav aria-label={position === "top" ? "Điều hướng đầu chương" : "Điều hướng cuối chương"} className={`chapter-navigation ${position}`}>
    {previousId ? <Link prefetch={false} href={`/chuong/${previousId}`} className="reader-control">← Chương trước</Link> : <button disabled className="reader-control">← Chương trước</button>}
    <button type="button" className="reader-control" onClick={onOpenToc}>Mục lục</button>
    {nextId ? <Link prefetch={false} href={`/chuong/${nextId}`} className="reader-control">Chương sau →</Link> : <button disabled className="reader-control">Chương sau →</button>}
  </nav>;
}
