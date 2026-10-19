import Link from "next/link";

export default function NotFound() {
  return <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16 text-center"><p className="public-eyebrow mb-4">GÓC ĐỌC TRUYỆN · 404</p><h1 className="font-serif text-3xl">Không tìm thấy trang</h1><p className="my-5 leading-7 text-muted">Chương chưa được đăng hoặc trang bạn tìm không còn tồn tại.</p><Link href="/#muc-luc" prefetch={false} className="public-button primary self-center">← Về mục lục</Link></main>;
}
