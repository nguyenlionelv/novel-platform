import { json, assertOrigin, readJson } from "@/lib/admin/http";
import { HttpError, record } from "@/lib/admin/validation";
import { readerAuth } from "@/lib/reader-account/auth";
import { authConfig } from "@/lib/reader-account/config";
import { credentials, displayName, safeNext } from "@/lib/reader-account/validation";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { requestIdentifier } from "@/lib/security/request-identifier";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    assertOrigin(request);
    const data = record(await readJson(request, 4096));
    const auth = await readerAuth();
    if (data.action === "logout") {
      const { error } = await auth.auth.signOut({ scope: "local" });
      if (error) throw new HttpError(503, "Chưa đăng xuất được. Vui lòng thử lại.");
      return json({ ok: true });
    }
    if (!["login", "signup", "google"].includes(String(data.action))) throw new HttpError(400, "Thao tác không hợp lệ.");
    const next = safeNext(data.next);
    const origin = new URL(request.headers.get("origin")!).origin;
    const callback = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
    if (!await consumeRateLimit("reader-auth", requestIdentifier(request))) throw new HttpError(429, "Bạn đã thử nhiều lần. Vui lòng đợi 15 phút.");
    if (data.action === "google") {
      const config = authConfig();
      const settings = await fetch(`${config.url}/auth/v1/settings`, { headers: { apikey: config.key }, cache: "no-store", signal: AbortSignal.timeout(10000) });
      if (!settings.ok || !(await settings.json()).external?.google) throw new HttpError(503, "Đăng nhập Google chưa được cấu hình. Hãy thử email và mật khẩu.");
      const { data: oauth, error } = await auth.auth.signInWithOAuth({ provider: "google", options: { redirectTo: callback, skipBrowserRedirect: true } });
      if (error || !oauth.url) throw new HttpError(503, "Đăng nhập Google chưa sẵn sàng. Hãy thử email và mật khẩu.");
      return json({ url: oauth.url });
    }
    const input = credentials(data);
    if (data.action === "signup") {
      const { data: result, error } = await auth.auth.signUp({ ...input, options: { data: { display_name: displayName(data.displayName) }, emailRedirectTo: callback } });
      if (error) throw new HttpError(error.status === 429 ? 429 : 400, error.status === 429 ? "Đã vượt giới hạn email. Vui lòng thử lại sau." : "Chưa đăng ký được. Hãy kiểm tra email, mật khẩu hoặc thử lại sau.");
      return json({ ok: true, confirmation: !result.session, next });
    }
    const { error } = await auth.auth.signInWithPassword(input);
    if (error) throw new HttpError(error.code === "email_not_confirmed" ? 403 : 401, error.code === "email_not_confirmed" ? "Hãy xác nhận email trước khi đăng nhập." : "Email hoặc mật khẩu không đúng.");
    return json({ ok: true, next });
  } catch (error) {
    return error instanceof HttpError ? json({ error: error.message }, error.status) : json({ error: "Chưa kết nối được dịch vụ đăng nhập. Vui lòng thử lại." }, 503);
  }
}
