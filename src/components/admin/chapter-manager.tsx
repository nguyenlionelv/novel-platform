"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { AdminChapter, ChapterIntent, ChapterSummary } from "@/lib/admin/types";
import { adminRequest, errorMessage, jsonRequest } from "./client";

function emptyChapter(position: number): AdminChapter { return { id: "", position, title: "", content: "", status: "draft", updated_at: "" }; }

export function ChapterManager({ chapters, hasMore, nextPosition, onRefresh, onMore, onDirty, onExpired }: {
  chapters: ChapterSummary[]; hasMore: boolean; nextPosition: number; onRefresh: () => Promise<void>; onMore: () => Promise<void>; onDirty: (dirty: boolean) => void; onExpired: () => void;
}) {
  const [editor, setEditor] = useState<AdminChapter | null>(null);
  const [baseline, setBaseline] = useState<AdminChapter | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState({ text: "", error: false });
  const dirty = !!editor && !!baseline && (editor.position !== baseline.position || editor.title !== baseline.title || editor.content !== baseline.content);
  useEffect(() => onDirty(dirty), [dirty, onDirty]);

  function canSwitch() { return !dirty || window.confirm("Có nội dung chương chưa lưu. Bỏ thay đổi để tiếp tục?"); }
  function create() {
    if (!canSwitch()) return;
    const value = emptyChapter(nextPosition); setEditor(value); setBaseline(value); setNotice({ text: "", error: false });
  }
  async function open(id: string) {
    if (!canSwitch()) return;
    setBusy(true); setNotice({ text: "", error: false });
    try { const result = await adminRequest<{ chapter: AdminChapter }>(`/api/admin/chapters?id=${id}`, undefined, onExpired); setEditor(result.chapter); setBaseline(result.chapter); }
    catch (error) { setNotice({ text: errorMessage(error), error: true }); }
    finally { setBusy(false); }
  }
  async function refreshAfterSave(message: string) {
    try { await onRefresh(); setNotice({ text: message, error: false }); }
    catch { setNotice({ text: `${message} Chưa tải lại được danh sách; hãy thử tải lại sau khi giữ nội dung cần thiết.`, error: false }); }
  }
  async function save(intent: ChapterIntent) {
    if (!editor) return;
    setBusy(true); setNotice({ text: "", error: false });
    try {
      const result = await adminRequest<{ chapter: AdminChapter }>("/api/admin/chapters", jsonRequest({ id: editor.id || undefined, position: editor.position, title: editor.title, content: editor.content, intent }), onExpired);
      setEditor(result.chapter); setBaseline(result.chapter);
      await refreshAfterSave(intent === "publish" ? "Đã đăng chương." : intent === "unpublish" ? "Đã gỡ chương về nháp." : intent === "update" ? "Đã cập nhật chương công khai." : "Đã lưu bản nháp.");
    } catch (error) { setNotice({ text: errorMessage(error), error: true }); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!editor?.id || !window.confirm(`Xóa chương “${editor.title}”? Nội dung chương sẽ bị xóa và không thể khôi phục.`)) return;
    setBusy(true); setNotice({ text: "", error: false });
    try { await adminRequest("/api/admin/chapters", jsonRequest({ id: editor.id, intent: "delete", confirmed: true }), onExpired); setEditor(null); setBaseline(null); await refreshAfterSave("Đã xóa chương."); }
    catch (error) { setNotice({ text: errorMessage(error), error: true }); }
    finally { setBusy(false); }
  }
  async function loadMore() {
    setBusy(true);
    try { await onMore(); } catch (error) { setNotice({ text: errorMessage(error), error: true }); }
    finally { setBusy(false); }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    void save((submitter?.value || (editor?.status === "published" ? "update" : "draft")) as ChapterIntent);
  }

  return (
    <section id="chuong" className="admin-card scroll-mt-6">
      <div className="flex flex-wrap items-start justify-between gap-4"><div className="admin-section-title"><span className="admin-step">02</span><div><h2>Chương truyện</h2><p>Viết, lưu nháp và đăng từng chương.</p></div></div><button type="button" className="admin-button secondary" disabled={busy} onClick={create}>+ Thêm chương</button></div>
      {chapters.length ? <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200">
        {chapters.map(chapter => <li key={chapter.id}><button type="button" disabled={busy} aria-current={editor?.id === chapter.id ? "true" : undefined} className={`flex min-h-16 w-full flex-wrap items-center gap-3 px-4 py-3 text-left transition hover:bg-stone-50 disabled:opacity-60 ${editor?.id === chapter.id ? "bg-emerald-50/50" : ""}`} onClick={() => void open(chapter.id)}>
          <span className="w-9 text-sm tabular-nums text-muted">{String(chapter.position).padStart(2, "0")}</span><span className="min-w-0 flex-1 break-words font-medium">{chapter.title}</span><span className={`admin-badge ${chapter.status === "published" ? "published" : ""}`}>{chapter.status === "published" ? "Đã đăng" : "Nháp"}</span><span className="text-sm text-accent">Sửa →</span>
        </button></li>)}
      </ul> : <div className="admin-empty">Chưa có chương nào. Bắt đầu bằng “Thêm chương”.</div>}
      {hasMore && <button type="button" disabled={busy} onClick={() => void loadMore()} className="admin-button secondary mt-4">Tải thêm chương</button>}
      {editor && <form onSubmit={submit} className="admin-form mt-7 border-t border-stone-200 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-semibold">{editor.id ? "Sửa chương" : "Chương mới"}</h3><span className="text-sm text-muted">{dirty ? "Có thay đổi chưa lưu" : editor.id ? "Đã lưu" : "Chưa lưu"}</span></div>
        <fieldset disabled={busy} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-[120px_1fr]"><div><label htmlFor="chapter-position">Thứ tự</label><input id="chapter-position" type="number" min={1} max={2147483647} required value={editor.position || ""} onChange={event => setEditor({ ...editor, position: Number(event.target.value) })} /></div><div><label htmlFor="chapter-title">Tiêu đề chương</label><input id="chapter-title" required maxLength={200} value={editor.title} onChange={event => setEditor({ ...editor, title: event.target.value })} /></div></div>
          <div><label htmlFor="chapter-content">Nội dung chương</label><textarea id="chapter-content" required maxLength={200000} rows={17} className="font-serif text-lg leading-relaxed" value={editor.content} onChange={event => setEditor({ ...editor, content: event.target.value })} /><p className="mt-2 text-xs text-muted">Mỗi lần Enter tạo một đoạn, tự thụt đầu dòng khi đọc. Không cần chèn dấu cách đầu đoạn.<br />Tối đa 200.000 ký tự · lưu bằng nút bên dưới</p></div>
        </fieldset>
        {editor.status === "published" && <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">Thay đổi sẽ hiển thị ngay cho độc giả khi chọn “Lưu cập nhật”.</p>}
        <div className="flex flex-wrap items-center gap-3">
          {editor.status === "draft" ? <><button type="submit" name="intent" value="draft" disabled={busy} className="admin-button secondary">{busy ? "Đang xử lý…" : "Lưu nháp"}</button><button type="submit" name="intent" value="publish" disabled={busy} className="admin-button primary">Đăng chương</button></> : <><button type="submit" name="intent" value="update" disabled={busy} className="admin-button primary">{busy ? "Đang xử lý…" : "Lưu cập nhật"}</button><button type="submit" name="intent" value="unpublish" disabled={busy} className="admin-button secondary">Gỡ về nháp</button></>}
          {editor.id && <button type="button" disabled={busy} onClick={() => void remove()} className="admin-button danger sm:ml-auto">Xóa chương</button>}
        </div>
      </form>}
      {notice.text && <p role={notice.error ? "alert" : "status"} className={`admin-message mt-4 ${notice.error ? "error" : "success"}`}>{notice.text}</p>}
    </section>
  );
}
