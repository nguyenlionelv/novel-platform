"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Novel } from "@/lib/db/queries";
import { adminRequest, errorMessage } from "./client";

export function NovelForm({ novel, onSaved, onDirty, onExpired }: { novel: Novel; onSaved: (novel: Novel) => void; onDirty: (dirty: boolean) => void; onExpired: () => void }) {
  const [baseline, setBaseline] = useState(novel);
  const [fields, setFields] = useState(novel);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState({ text: "", error: false });
  const dirty = !!file || fields.title !== baseline.title || fields.author !== baseline.author || fields.description !== baseline.description || fields.status !== baseline.status;
  useEffect(() => onDirty(dirty), [dirty, onDirty]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  function chooseCover(next: File | null) {
    if (next && (next.size > 2 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(next.type))) {
      setNotice({ text: "Chọn ảnh JPEG, PNG hoặc WebP, tối đa 2 MB.", error: true });
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    setFile(next); setPreviewUrl(next ? URL.createObjectURL(next) : null); setNotice({ text: "", error: false });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNotice({ text: "", error: false });
    try {
      if (file && (file.size > 2 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type))) throw new Error("Chọn ảnh JPEG, PNG hoặc WebP, tối đa 2 MB.");
      const data = new FormData();
      for (const key of ["title", "author", "description", "status"] as const) data.set(key, fields[key]);
      if (file) data.set("cover", file);
      const result = await adminRequest<{ novel: Novel }>("/api/admin/novel", { method: "POST", body: data }, onExpired);
      setFields(result.novel); setBaseline(result.novel); setFile(null); setPreviewUrl(null);
      if (fileInput.current) fileInput.current.value = "";
      onSaved(result.novel); setNotice({ text: "Đã lưu thông tin truyện.", error: false });
    } catch (error) { setNotice({ text: errorMessage(error), error: true }); }
    finally { setBusy(false); }
  }

  return (
    <section id="thong-tin" className="admin-card scroll-mt-6">
      <div className="admin-section-title"><span className="admin-step">01</span><div><h2>Thông tin truyện</h2><p>Giới thiệu cuốn truyện của bạn với độc giả.</p></div></div>
      <form onSubmit={save} className="admin-form">
        <fieldset disabled={busy} className="grid gap-6 md:grid-cols-[160px_1fr]">
          <div>
            {previewUrl || fields.cover_url ? <Image unoptimized src={previewUrl || fields.cover_url!} width={160} height={240} alt={previewUrl ? "Xem trước ảnh bìa" : "Ảnh bìa hiện tại"} className="aspect-[2/3] w-36 rounded-lg object-cover shadow-sm md:w-40" /> : <div className="flex aspect-[2/3] w-36 items-center justify-center rounded-lg border border-dashed border-stone-300 bg-stone-50 px-4 text-center text-sm text-muted md:w-40">Chưa có ảnh bìa</div>}
            <label htmlFor="cover" className="mt-4 block">Ảnh bìa</label>
            <input ref={fileInput} id="cover" type="file" tabIndex={-1} accept="image/png,image/jpeg,image/webp" onChange={event => chooseCover(event.target.files?.[0] ?? null)} className="sr-only" />
            <button type="button" className="admin-button secondary mt-1 w-full" onClick={() => fileInput.current?.click()}>Tải ảnh bìa lên</button>
            <p className="mt-2 text-xs leading-relaxed text-muted">JPEG, PNG, WebP · tối đa 2 MB<br />Gợi ý tỉ lệ 2:3</p>
            {file && <><p className="mt-2 break-words text-xs text-accent">Đã chọn: {file.name}. Bấm “Lưu thông tin” để tải lên.</p><button type="button" className="mt-2 min-h-11 text-xs text-muted underline" onClick={() => { chooseCover(null); if (fileInput.current) fileInput.current.value = ""; }}>Huỷ ảnh đã chọn</button></>}
          </div>
          <div className="grid content-start gap-4">
            <div><label htmlFor="novel-title">Tên truyện</label><input id="novel-title" required maxLength={200} value={fields.title} onChange={event => setFields({ ...fields, title: event.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label htmlFor="novel-author">Tác giả</label><input id="novel-author" required maxLength={100} value={fields.author} onChange={event => setFields({ ...fields, author: event.target.value })} /></div>
              <div><label htmlFor="novel-status">Trạng thái sáng tác</label><select id="novel-status" value={fields.status} onChange={event => setFields({ ...fields, status: event.target.value as Novel["status"] })}><option value="ongoing">Đang viết</option><option value="completed">Hoàn thành</option></select></div>
            </div>
            <div><label htmlFor="novel-description">Giới thiệu</label><textarea id="novel-description" rows={5} maxLength={5000} value={fields.description} onChange={event => setFields({ ...fields, description: event.target.value })} /></div>
          </div>
        </fieldset>
        <div className="admin-form-footer"><p className="text-sm text-muted">{dirty ? "Có thay đổi chưa lưu" : "Thông tin đã được lưu"}</p><button className="admin-button primary" disabled={busy} type="submit">{busy ? "Đang lưu…" : "Lưu thông tin"}</button></div>
        {notice.text && <p role={notice.error ? "alert" : "status"} className={`admin-message ${notice.error ? "error" : "success"}`}>{notice.text}</p>}
      </form>
    </section>
  );
}
