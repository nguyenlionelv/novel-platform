import { json, readJson, assertOrigin } from "@/lib/admin/http";
import { HttpError, record, uuid } from "@/lib/admin/validation";
import { readerUser } from "@/lib/reader-account/auth";
import { displayName, readingPosition } from "@/lib/reader-account/validation";
import { createBookmark, ensureReaderProfile, getReaderState, readNotifications, removeBookmark, saveProgress, updateReaderName } from "@/lib/db/reader-account";

export const dynamic = "force-dynamic";
function failure(error: unknown) { return error instanceof HttpError ? json({ error: error.message }, error.status) : json({ error: "Chưa lưu được dữ liệu tài khoản. Vui lòng thử lại." }, 503); }

export async function GET() {
  try {
    const user = await readerUser(false);
    return json(user ? await getReaderState(user) : { profile: null, progress: [], bookmark: null, notifications: [], unread: 0, reviews: [] });
  } catch (error) { return failure(error); }
}

export async function POST(request: Request) {
  try {
    assertOrigin(request);
    const user = (await readerUser())!;
    const data = record(await readJson(request, 4096));
    await ensureReaderProfile(user);
    switch (data.action) {
      case "progress": {
        if (typeof data.progress !== "number" || !Number.isFinite(data.progress) || data.progress < 0 || data.progress > 1) throw new HttpError(400, "Tiến độ không hợp lệ.");
        await saveProgress(user.id, uuid(data.chapterId), data.progress); break;
      }
      case "bookmark": { const pos = readingPosition(data); const bookmarkId = await createBookmark(user.id, uuid(data.chapterId), pos.paragraph, pos.offset); return json({ ok: true, bookmarkId }); }
      case "remove-bookmark": await removeBookmark(user.id, uuid(data.id)); break;
      case "read-notifications": {
        if (typeof data.before !== "string" || data.before.length > 40 || !/^\d{4}-\d\d-\d\d[T ]/.test(data.before) || !Number.isFinite(Date.parse(data.before))) throw new HttpError(400, "Thời điểm không hợp lệ.");
        await readNotifications(user.id, data.before); break;
      }
      case "profile": await updateReaderName(user.id, displayName(data.displayName)); break;
      default: throw new HttpError(400, "Thao tác không hợp lệ.");
    }
    return json({ ok: true });
  } catch (error) { return failure(error); }
}
