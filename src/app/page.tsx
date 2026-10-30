import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { countPublishedChapters, getNovel, getPublishedChapterPage } from "@/lib/db/queries";
import { ChapterList } from "@/components/reader/chapter-list";
import { AccountBar } from "@/components/account/account-bar";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const novel = await getNovel();
  return { title: novel?.title || "Truyện đang được chuẩn bị", description: novel?.description.slice(0, 160) || "Một góc đọc truyện yên tĩnh, dễ đọc trên điện thoại." };
}

export default async function HomePage() {
  const [novel, chapterPage, count] = await Promise.all([getNovel(), getPublishedChapterPage(), countPublishedChapters()]);
  const first = chapterPage.chapters[0];

  return <main id="noi-dung" className="public-home mx-auto max-w-[1040px] px-4 pb-12 pt-8 sm:px-6 sm:pt-12">
    <header className="public-masthead"><span className="public-mark" aria-hidden="true">✦</span><p>GÓC ĐỌC TRUYỆN</p><span className="ml-auto text-xs tracking-normal text-muted">Một cuốn truyện, từng trang một.</span></header>
    <AccountBar />
    <section className="novel-intro" aria-labelledby="novel-title">
      <div className="novel-cover">
        {novel?.cover_url ? <Image unoptimized src={novel.cover_url} width={220} height={330} alt={`Bìa truyện ${novel.title}`} className="aspect-[2/3] w-full rounded-lg object-cover" /> : <div className="empty-cover"><span aria-hidden="true">✦</span><span>Bìa truyện<br />đang được chuẩn bị</span></div>}
      </div>
      <div className="min-w-0">
        <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-accent">TIỂU THUYẾT</p>
        <h1 id="novel-title" className="break-words font-serif text-4xl leading-tight sm:text-5xl">{novel?.title || "Truyện đang được chuẩn bị."}</h1>
        <div className="my-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">{novel?.author && <p>Tác giả: <span className="font-medium text-ink">{novel.author}</span></p>}<span className="public-status">{novel?.status === "completed" ? "Hoàn thành" : "Đang viết"}</span><span>{count} chương</span></div>
        <p className="whitespace-pre-wrap break-words leading-8 text-muted">{novel?.description || (first ? "Chọn một chương bên dưới để bắt đầu đọc." : "Nội dung sẽ xuất hiện khi truyện và các chương được đăng.")}</p>
        <div className="mt-7 flex flex-wrap gap-3">{first ? <Link prefetch={false} href={`/chuong/${first.id}`} className="public-button primary">Đọc từ đầu <span aria-hidden="true">→</span></Link> : <button disabled className="public-button primary">Đọc từ đầu</button>}<a href="#muc-luc" className="public-button secondary">Xem mục lục</a></div>
      </div>
    </section>
    <section id="muc-luc" aria-labelledby="toc-heading" className="public-section scroll-mt-6">
      <div className="public-section-heading"><div><p className="public-eyebrow">THEO TỪNG CHƯƠNG</p><h2 id="toc-heading" className="font-serif text-3xl">Mục lục</h2></div><span className="text-sm text-muted">{count} chương đã đăng</span></div>
      <ChapterList initialPage={chapterPage} />
    </section>
    <footer className="public-footer">Chúc bạn có những phút đọc truyện yên tĩnh.</footer>
  </main>;
}
