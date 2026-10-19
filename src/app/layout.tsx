import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Đọc truyện",
  description: "Một góc đọc truyện yên tĩnh, dễ đọc trên điện thoại.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body className="min-h-screen font-sans antialiased">{children}</body></html>;
}
