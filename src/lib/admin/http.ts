import "server-only";
import { isAdmin } from "../auth/session";
import { isSameOrigin } from "../security/origin";
import { HttpError } from "./validation";

export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}

export function assertOrigin(request: Request) {
  if (!isSameOrigin(request)) throw new HttpError(403, "Yêu cầu không hợp lệ. Hãy tải lại trang quản trị.");
}

export async function authorize(request: Request, write = true) {
  if (write) assertOrigin(request);
  if (!await isAdmin()) throw new HttpError(401, "Phiên quản trị đã hết hạn. Hãy đăng nhập lại; nội dung đang nhập vẫn được giữ.");
}

export async function limitedBody(request: Request, limit: number): Promise<Uint8Array<ArrayBuffer>> {
  const size = request.headers.get("content-length");
  if (size && (!/^\d+$/.test(size) || Number(size) > limit)) throw new HttpError(413, "Dữ liệu gửi lên quá lớn.");
  if (!request.body) throw new HttpError(400, "Thiếu dữ liệu.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limit) { await reader.cancel(); throw new HttpError(413, "Dữ liệu gửi lên quá lớn."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return bytes;
}

export async function readJson(request: Request, limit = 1024 * 1024 * 2): Promise<unknown> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new HttpError(415, "Định dạng dữ liệu không hợp lệ.");
  const bytes = await limitedBody(request, limit);
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new HttpError(400, "Dữ liệu JSON không hợp lệ."); }
}

export function failure(error: unknown) {
  if (error instanceof HttpError) return json({ error: error.message }, error.status);
  if (error && typeof error === "object" && "code" in error && error.code === "23505") return json({ error: "Thứ tự chương này đã tồn tại. Hãy chọn thứ tự khác." }, 409);
  return json({ error: "Chưa thể hoàn tất thao tác. Dữ liệu đang nhập vẫn được giữ; vui lòng thử lại." }, 500);
}
