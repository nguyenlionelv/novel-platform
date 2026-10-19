import type { Metadata } from "next";
import "./globals.css";
import { dejaVu } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Đọc truyện",
  description: "Một góc đọc truyện yên tĩnh, dễ đọc trên điện thoại.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi" className={dejaVu.variable}><body className="min-h-screen font-sans antialiased">{children}</body></html>;
}
