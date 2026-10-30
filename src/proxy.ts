import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { authConfig, authCookieOptions } from "@/lib/reader-account/config";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const options = authCookieOptions();
  if (!request.cookies.getAll().some(cookie => cookie.name.startsWith(options.name))) return response;
  const { url, key } = authConfig();
  const auth = createServerClient(url, key, {
    cookieOptions: options,
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(12000), cache: "no-store" }) },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values, headers) {
        for (const cookie of values) request.cookies.set(cookie.name, cookie.value);
        response = NextResponse.next({ request });
        for (const cookie of values) response.cookies.set(cookie.name, cookie.value, cookie.options);
        for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
      },
    },
  });
  try { await auth.auth.getUser(); } catch { /* The route verifies identity and reports temporary failures. */ }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = { matcher: ["/api/reader/:path*", "/api/reviews", "/auth/:path*"] };
