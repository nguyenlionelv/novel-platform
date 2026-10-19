"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-xl px-6 py-20">
      <h1 className="font-serif text-3xl">Chưa thể tải truyện.</h1>
      <p className="mt-4 text-muted">Vui lòng thử lại sau ít phút.</p>
      <button onClick={reset} className="mt-6 min-h-11 rounded-lg bg-accent px-5 py-3 text-white">Thử lại</button>
    </main>
  );
}
