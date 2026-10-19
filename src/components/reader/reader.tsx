"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import type { ChapterPage, PublishedChapter } from "@/lib/reader/types";
import { DEFAULT_READING, READING_WIDTHS, parseReadingPreferences, READING_KEY, type ReadingPreferences } from "@/lib/reader/preferences";
import { ChapterList } from "./chapter-list";
import { ChapterNavigation } from "./chapter-navigation";
import { ReaderPanel } from "./reader-panel";
import { ReadingOptions } from "./reading-options";
import { splitChapterParagraphs } from "@/lib/reader/paragraphs";

const defaultSnapshot = JSON.stringify(DEFAULT_READING);
let fallback = defaultSnapshot;
let transient: string | null = null;
function snapshot() { if (transient !== null) return transient; try { return localStorage.getItem(READING_KEY) ?? fallback; } catch { return fallback; } }
function subscribe(notify: () => void) {
  function storage(event: StorageEvent) { if (event.key === READING_KEY || event.key === null) { fallback = defaultSnapshot; transient = null; notify(); } }
  window.addEventListener("storage", storage); window.addEventListener("novel-reading-change", notify);
  return () => { window.removeEventListener("storage", storage); window.removeEventListener("novel-reading-change", notify); };
}
function savePreferences(value: ReadingPreferences) {
  fallback = JSON.stringify(value);
  try { localStorage.setItem(READING_KEY, fallback); transient = null; } catch { transient = fallback; }
  window.dispatchEvent(new Event("novel-reading-change"));
}

export function Reader({ novelTitle, chapter, toc, children }: { novelTitle: string; chapter: PublishedChapter; toc: ChapterPage; children: ReactNode }) {
  const stored = useSyncExternalStore<string | null>(subscribe, snapshot, () => null);
  const ready = stored !== null;
  const preferences = parseReadingPreferences(stored);
  const optionsRef = useRef<HTMLDialogElement>(null);
  const tocRef = useRef<HTMLDialogElement>(null);
  const [panel, setPanel] = useState<"toc" | "options" | null>(null);
  const block = (event: { preventDefault: () => void }) => event.preventDefault();
  useEffect(() => {
    if (!panel) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [panel]);
  function openPanel(target: "toc" | "options") {
    const dialog = target === "toc" ? tocRef.current : optionsRef.current;
    if (dialog && !dialog.open) { dialog.showModal(); setPanel(target); }
  }
  function scrollDown() {
    document.getElementById("cuoi-chuong")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  }

  return <main className="reader-page" data-theme={preferences.theme} data-font={preferences.font} style={{ "--reading-width": `${READING_WIDTHS[preferences.width]}px` } as CSSProperties}>
    <div className="reader-toolbar"><div className="reader-toolbar-inner"><button type="button" className="reader-control" disabled={!ready} aria-haspopup="dialog" aria-controls="reader-toc" aria-expanded={panel === "toc"} onClick={() => openPanel("toc")}>☷ <span>Mục lục</span></button><div className="flex gap-2"><button type="button" className="reader-control" disabled={!ready} aria-haspopup="dialog" aria-controls="reader-options" aria-expanded={panel === "options"} onClick={() => openPanel("options")}>⚙ Tuỳ chọn đọc</button><button type="button" className="reader-control" disabled={!ready} aria-label="Xuống cuối chương" title="Xuống cuối chương" onClick={scrollDown}>↓</button></div></div></div>
    <div className="reader-frame">
      <header className="reader-heading"><Link href="/" prefetch={false} className="reader-novel-title reader-display">{novelTitle}</Link><p className="public-eyebrow my-4">CHƯƠNG {chapter.position}</p><h1 className="reader-chapter-title reader-display">{chapter.title}</h1></header>
      <ChapterNavigation previousId={chapter.previous_id} nextId={chapter.next_id} position="top" onOpenToc={() => openPanel("toc")} />
      <article aria-label="Nội dung chương" tabIndex={0} className="chapter-content" style={{ fontSize: `${preferences.fontSize}px`, lineHeight: preferences.lineHeight, "--paragraph-gap": `${preferences.paragraphGap}em` } as CSSProperties} draggable={false} onCopy={block} onCut={block} onContextMenu={block} onDragStart={block}>{splitChapterParagraphs(chapter.content).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</article>
      <div id="cuoi-chuong"><p className="reader-endnote">Hết chương {chapter.position}</p><ChapterNavigation previousId={chapter.previous_id} nextId={chapter.next_id} position="bottom" onOpenToc={() => openPanel("toc")} /></div>
      {children}
    </div>
    <ReaderPanel dialogRef={optionsRef} id="reader-options" title="Tuỳ chọn đọc" side="right" onClose={() => setPanel(null)}><ReadingOptions value={preferences} onChange={savePreferences} /></ReaderPanel>
    <ReaderPanel dialogRef={tocRef} id="reader-toc" title="Mục lục" side="left" onClose={() => setPanel(null)}><p className="reader-toc-novel">{novelTitle}</p><p className="mb-5 text-sm text-muted">Đang đọc chương {chapter.position}</p><ChapterList initialPage={toc} currentId={chapter.id} onNavigate={() => tocRef.current?.close()} /><Link prefetch={false} href="/#muc-luc" className="reader-back mt-6" onClick={() => tocRef.current?.close()}>← Về trang truyện</Link></ReaderPanel>
  </main>;
}
