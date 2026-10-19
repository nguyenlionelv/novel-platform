import "server-only";
import { HttpError, uuid } from "../admin/validation";
import type { ReviewCursor, ReviewInput } from "./types";

export function reviewInput(data: Record<string, unknown>): ReviewInput {
  if (data.website !== undefined && data.website !== "") throw new HttpError(400, "Yêu cầu không hợp lệ.");
  if (typeof data.displayName !== "string" || !data.displayName.trim() || data.displayName.trim().length > 50) throw new HttpError(400, "Tên của bạn cần từ 1 đến 50 ký tự.");
  if (typeof data.rating !== "number" || !Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) throw new HttpError(400, "Hãy chọn số sao từ 1 đến 5.");
  const comment = data.comment ?? "";
  if (typeof comment !== "string" || comment.length > 1000) throw new HttpError(400, "Nhận xét tối đa 1.000 ký tự.");
  return { displayName: data.displayName.trim(), rating: data.rating, comment: comment.trim() };
}

export function reviewCursor(value: string | null): ReviewCursor | undefined {
  if (value === null) return undefined;
  const invalid = () => new HttpError(400, "Mốc đánh giá không hợp lệ.");
  if (value.length > 80) throw invalid();
  const [createdAt, id, extra] = value.split("|");
  if (extra !== undefined || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3,6}Z$/.test(createdAt) || !Number.isFinite(Date.parse(createdAt)) || new Date(createdAt).toISOString() !== `${createdAt.slice(0, 23)}Z`) throw invalid();
  return { createdAt, id: uuid(id) };
}
