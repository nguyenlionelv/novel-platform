"use client";

export async function adminRequest<T>(url: string, init?: RequestInit, onExpired?: () => void): Promise<T> {
  let response: Response;
  try { response = await fetch(url, { ...init, credentials: "same-origin", cache: "no-store" }); }
  catch { throw new Error("Không thể kết nối. Nội dung đang nhập vẫn được giữ; hãy thử lại."); }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) onExpired?.();
    throw new Error(data?.error || "Chưa thể hoàn tất thao tác. Vui lòng thử lại.");
  }
  return data as T;
}

export function jsonRequest(data: unknown): RequestInit {
  return { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) };
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Chưa thể hoàn tất thao tác. Vui lòng thử lại.";
}
