import { AccountPage } from "@/components/account/account-page";
import Link from "next/link";
export const metadata = { title: "Tài khoản · Đọc truyện", robots: { index: false, follow: false } };
export default function Page() { return <main className="mx-auto max-w-[900px] px-4 py-8"><Link prefetch={false} href="/" className="mb-4 inline-flex min-h-11 items-center text-sm text-muted">← Về trang truyện</Link><AccountPage /></main>; }
