import { AuthForm } from "@/components/account/auth-form";
import { safeNext } from "@/lib/reader-account/validation";

export const metadata = { title: "Đăng nhập · Đọc truyện", robots: { index: false, follow: false } };
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const params = await searchParams;
  return <main className="px-4 py-5"><AuthForm next={safeNext(params.next)} callbackError={params.error === "callback"} /></main>;
}
