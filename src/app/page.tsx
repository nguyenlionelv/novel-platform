import { getNovel } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const novel = await getNovel();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="mb-4 text-sm tracking-widest text-accent">GÓC ĐỌC TRUYỆN</p>
      <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
        {novel?.title || "Truyện đang được chuẩn bị."}
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
        {novel?.description || "Nội dung sẽ xuất hiện khi truyện và các chương được đăng."}
      </p>
      {novel?.author && <p className="mt-4 text-muted">Tác giả: {novel.author}</p>}
    </main>
  );
}
