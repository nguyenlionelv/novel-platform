import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { HttpError } from "../admin/validation";
import { authConfig, authCookieOptions } from "./config";

export async function readerAuth() {
  const store = await cookies();
  const { url, key } = authConfig();
  return createServerClient(url, key, {
    cookieOptions: authCookieOptions(),
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(12000), cache: "no-store" }) },
    cookies: { getAll: () => store.getAll(), setAll: values => { for (const { name, value, options } of values) store.set(name, value, options); } },
  });
}

export async function readerUser(required = true) {
  const auth = await readerAuth();
  // getUser verifies the token with Supabase and checks deleted/revoked users.
  const { data, error } = await auth.auth.getUser();
  if (!data.user && error && error.name !== "AuthSessionMissingError" && error.status !== 401 && error.status !== 403) throw new HttpError(503, "Chưa xác minh được tài khoản. Vui lòng thử lại.");
  if (!data.user && required) throw new HttpError(401, "Hãy đăng nhập để sử dụng tính năng này.");
  return data.user;
}
