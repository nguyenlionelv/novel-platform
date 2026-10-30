import { NextResponse } from "next/server";
import { readerAuth } from "@/lib/reader-account/auth";
import { safeNext } from "@/lib/reader-account/validation";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code && code.length < 2048) {
    try {
      const auth = await readerAuth();
      const { error } = await auth.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(safeNext(url.searchParams.get("next")), url.origin), { headers: { "Cache-Control": "private, no-store" } });
    } catch { /* Report a generic error, without reflecting OAuth parameters. */ }
  }
  return NextResponse.redirect(new URL("/dang-nhap?error=callback", url.origin), { headers: { "Cache-Control": "private, no-store" } });
}
