"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import type { PublishedChapter } from "@/lib/reader/types";
import { DEFAULT_READING, FONT_SIZES, parseReadingPreferences, READING_KEY, type ReadingPreferences } from "@/lib/reader/preferences";

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

export function Reader({ novelTitle, chapter, fontClassName }: { novelTitle: string; chapter: PublishedChapter; fontClassName: string }) {
  const stored = useSyncExternalStore<string | null>(subscribe, snapshot, () => null);
  const ready = stored !== null;
  const preferences = parseReadingPreferences(stored);
  const index = FONT_SIZES.indexOf(preferences.fontSize);
  const block = (event: { preventDefault: () => void }) => event.preventDefault();

  return <main className={`reader-page ${fontClassName}`} data-theme={preferences.theme} data-font={preferences.font}>
    <div className="mx-auto max-w-[768px] px-5 pb-12 pt-7 sm:px-6 sm:pt-10">
      <Link href="/#muc-luc" prefetch={false} className="reader-back">← Mục lục</Link>
      <header className="reader-heading"><p className="mb-4 break-words text-sm">{novelTitle}</p><p className="public-eyebrow mb-3">CHƯƠNG {chapter.position}</p><h1 className="break-words font-serif text-3xl leading-snug sm:text-4xl">{chapter.title}</h1></header>
      <div className="reading-controls" role="group" aria-label="Tuỳ chọn đọc">
        <span className="text-sm">Cỡ chữ</span><button type="button" className="reader-control" aria-label="Giảm cỡ chữ" disabled={!ready || index === 0} onClick={() => savePreferences({ ...preferences, fontSize: FONT_SIZES[index - 1] })}>A−</button><span className="min-w-12 text-center text-sm tabular-nums" aria-live="polite">{preferences.fontSize} px</span><button type="button" className="reader-control" aria-label="Tăng cỡ chữ" disabled={!ready || index === FONT_SIZES.length - 1} onClick={() => savePreferences({ ...preferences, fontSize: FONT_SIZES[index + 1] })}>A+</button><button type="button" className="reader-control ml-auto" disabled={!ready} aria-label={preferences.theme === "light" ? "Chuyển sang nền tối" : "Chuyển sang nền sáng"} aria-pressed={preferences.theme === "dark"} onClick={() => savePreferences({ ...preferences, theme: preferences.theme === "light" ? "dark" : "light" })}>{preferences.theme === "light" ? "☾ Nền tối" : "☀ Nền sáng"}</button>
      </div>
      <div className="reading-font"><label htmlFor="reading-font">Kiểu chữ</label><select id="reading-font" className="reader-control" disabled={!ready} value={preferences.font} onChange={event => savePreferences({ ...preferences, font: event.target.value === "times" ? "times" : "dejavu" })}><option value="dejavu">DejaVu Serif</option><option value="times">Times New Roman</option></select>{preferences.font === "times" && <p>Times New Roman dùng font trên thiết bị; nếu thiếu sẽ dùng DejaVu Serif.</p>}</div>
      <article aria-label="Nội dung chương" tabIndex={0} className="chapter-content" style={{ fontSize: `${preferences.fontSize}px` }} draggable={false} onCopy={block} onCut={block} onContextMenu={block} onDragStart={block}>{chapter.content}</article>
      <nav aria-label="Điều hướng chương" className="chapter-navigation">
        {chapter.previous_id ? <Link prefetch={false} href={`/chuong/${chapter.previous_id}`} className="reader-control">← Chương trước</Link> : <button disabled className="reader-control">← Chương trước</button>}
        <Link prefetch={false} href="/#muc-luc" className="reader-control">Mục lục</Link>
        {chapter.next_id ? <Link prefetch={false} href={`/chuong/${chapter.next_id}`} className="reader-control">Chương sau →</Link> : <button disabled className="reader-control">Chương sau →</button>}
      </nav>
      <p className="reader-endnote">Hết chương {chapter.position}</p>
    </div>
  </main>;
}
