import { revalidatePath } from "next/cache";
import { authorize, failure, json, readJson } from "@/lib/admin/http";
import { chapterInput, HttpError, pageOffset, record, uuid } from "@/lib/admin/validation";
import { deleteChapter, getAdminChapter, listAdminChapters, saveChapter } from "@/lib/db/admin";

export async function GET(request: Request) {
  try {
    await authorize(request, false);
    const params = new URL(request.url).searchParams;
    const id = params.get("id");
    return json(id ? { chapter: await getAdminChapter(uuid(id)) } : await listAdminChapters(pageOffset(params.get("offset"))));
  } catch (error) { return failure(error); }
}

export async function POST(request: Request) {
  try {
    await authorize(request);
    const data = record(await readJson(request));
    let result: unknown;
    if (data.intent === "delete") {
      if (data.confirmed !== true) throw new HttpError(400, "Cần xác nhận trước khi xóa chương.");
      await deleteChapter(uuid(data.id)); result = { ok: true };
    } else { result = { chapter: await saveChapter(chapterInput(data)) }; }
    revalidatePath("/");
    revalidatePath("/chuong/[id]", "page");
    return json(result);
  } catch (error) { return failure(error); }
}
