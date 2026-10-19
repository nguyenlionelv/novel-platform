import "server-only";
import type { ChapterInput, ChapterIntent, NovelInput } from "./types";

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function uuid(value: unknown): string {
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) throw new HttpError(400, "Mã dữ liệu không hợp lệ.");
  return value;
}

export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new HttpError(400, "Dữ liệu không hợp lệ.");
  return value as Record<string, unknown>;
}

function text(value: unknown, label: string, max: number, required = true, trim = true): string {
  if (typeof value !== "string") throw new HttpError(400, `${label} không hợp lệ.`);
  const result = trim ? value.trim() : value;
  if ((required && !result.trim()) || result.length > max) throw new HttpError(400, `${label}${required ? " không được để trống và" : ""} tối đa ${max.toLocaleString("vi-VN")} ký tự.`);
  return result;
}

export function novelInput(data: Record<string, unknown>): NovelInput {
  if (data.status !== "ongoing" && data.status !== "completed") throw new HttpError(400, "Trạng thái truyện không hợp lệ.");
  return { title: text(data.title, "Tên truyện", 200), author: text(data.author, "Tác giả", 100), description: text(data.description, "Giới thiệu", 5000, false), status: data.status };
}

export function chapterInput(data: Record<string, unknown>): ChapterInput {
  const position = data.position;
  if (typeof position !== "number" || !Number.isInteger(position) || position < 1 || position > 2147483647) throw new HttpError(400, "Thứ tự chương phải là số nguyên dương hợp lệ.");
  const intents: ChapterIntent[] = ["draft", "publish", "update", "unpublish"];
  if (!intents.includes(data.intent as ChapterIntent)) throw new HttpError(400, "Thao tác chương không hợp lệ.");
  return { id: data.id === undefined ? undefined : uuid(data.id), position, title: text(data.title, "Tiêu đề", 200), content: text(data.content, "Nội dung", 200000, true, false), intent: data.intent as ChapterIntent };
}

export function pageOffset(value: string | null): number {
  if (value === null) return 0;
  if (!/^\d{1,7}$/.test(value)) throw new HttpError(400, "Trang dữ liệu không hợp lệ.");
  return Number(value);
}

export function imageExtension(bytes: Uint8Array, mime: string): "png" | "jpg" | "webp" {
  if (mime === "image/png" && bytes.length >= 8 && [137,80,78,71,13,10,26,10].every((byte, index) => bytes[index] === byte)) return "png";
  if (mime === "image/jpeg" && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "jpg";
  if (mime === "image/webp" && bytes.length >= 12 && new TextDecoder().decode(bytes.slice(0,4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8,12)) === "WEBP") return "webp";
  throw new HttpError(400, "Ảnh bìa phải là tệp JPEG, PNG hoặc WebP hợp lệ.");
}
