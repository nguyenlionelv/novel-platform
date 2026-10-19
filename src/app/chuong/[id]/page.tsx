import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNovel, getPublishedChapter } from "@/lib/db/queries";
import { Reader } from "@/components/reader/reader";
import localFont from "next/font/local";

const dejaVu = localFont({ src: "../../../assets/fonts/DejaVuSerif.ttf", variable: "--font-dejavu-serif", weight: "400", style: "normal", display: "swap", adjustFontFallback: false });

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const [novel, chapter] = await Promise.all([getNovel(), getPublishedChapter(id)]);
  if (!chapter) return { title: "Không tìm thấy chương", description: "Chương chưa được đăng hoặc không còn tồn tại.", robots: { index: false, follow: false } };
  return { title: `Chương ${chapter.position}: ${chapter.title} — ${novel?.title || "Đọc truyện"}`, description: `Đọc chương ${chapter.position}: ${chapter.title}${novel?.title ? ` của truyện ${novel.title}` : ""}.`.slice(0, 160) };
}

export default async function ChapterPage({ params }: Props) {
  const { id } = await params;
  const [novel, chapter] = await Promise.all([getNovel(), getPublishedChapter(id)]);
  if (!chapter) notFound();
  return <Reader fontClassName={dejaVu.variable} novelTitle={novel?.title || "Đọc truyện"} chapter={chapter} />;
}
