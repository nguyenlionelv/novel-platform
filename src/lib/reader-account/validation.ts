import { HttpError } from "../admin/validation";

export function safeNext(value: unknown): string {
  if (typeof value !== "string" || value.length > 300 || !/^\/(?:$|tai-khoan(?:[?#]|$)|chuong\/[0-9a-f-]{36}(?:[?#]|$))/.test(value) || /[\\\r\n]/.test(value)) return "/tai-khoan";
  const url = new URL(value, "https://local.invalid");
  return url.origin === "https://local.invalid" ? `${url.pathname}${url.search}${url.hash}` : "/tai-khoan";
}

export function displayName(value: unknown) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > 50) throw new HttpError(400, "Tên hiển thị cần từ 1 đến 50 ký tự.");
  return value.trim();
}

export function credentials(data: Record<string, unknown>) {
  if (typeof data.email !== "string" || data.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) throw new HttpError(400, "Email không hợp lệ.");
  if (typeof data.password !== "string" || data.password.length < 8 || data.password.length > 128) throw new HttpError(400, "Mật khẩu cần từ 8 đến 128 ký tự.");
  return { email: data.email.trim(), password: data.password };
}

export function readingPosition(data: Record<string, unknown>) {
  if (typeof data.paragraph !== "number" || !Number.isInteger(data.paragraph) || data.paragraph < 0 || data.paragraph > 200000 || typeof data.offset !== "number" || !Number.isFinite(data.offset) || data.offset < 0 || data.offset > 1) throw new HttpError(400, "Vị trí đọc không hợp lệ.");
  return { paragraph: data.paragraph, offset: data.offset };
}
