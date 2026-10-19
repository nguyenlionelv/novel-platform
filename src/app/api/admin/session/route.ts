import { createAdminSession, destroyAdminSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { requiredEnv } from "@/lib/env";
import { consumeRateLimit, clearLoginRateLimit } from "@/lib/security/rate-limit";
import { assertOrigin, failure, json, readJson } from "@/lib/admin/http";
import { HttpError, record } from "@/lib/admin/validation";
import { requestIdentifier } from "@/lib/security/request-identifier";

export async function POST(request: Request) {
  try {
    assertOrigin(request);
    const identifier = requestIdentifier(request);
    const data = record(await readJson(request, 4096));
    if (!await consumeRateLimit("admin-login", identifier)) return json({ error: "Đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 15 phút." }, 429);
    if (typeof data.password !== "string" || !await verifyPassword(data.password, requiredEnv("ADMIN_PASSWORD_HASH"))) throw new HttpError(401, "Mật khẩu không đúng.");
    await clearLoginRateLimit(identifier);
    await createAdminSession();
    return json({ ok: true });
  } catch (error) { return failure(error); }
}

export async function DELETE(request: Request) {
  try { assertOrigin(request); await destroyAdminSession(); return json({ ok: true }); }
  catch (error) { return failure(error); }
}
