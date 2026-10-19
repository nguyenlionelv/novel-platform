import { randomUUID } from "node:crypto";
import { put, del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { authorize, failure, json, limitedBody } from "@/lib/admin/http";
import { HttpError, imageExtension, novelInput } from "@/lib/admin/validation";
import { updateNovel } from "@/lib/db/admin";
import { getSchema } from "@/lib/db/client";

export async function POST(request: Request) {
  let uploadedUrl: string | undefined;
  let saved = false;
  try {
    await authorize(request);
    const contentType = request.headers.get("content-type");
    if (!contentType?.startsWith("multipart/form-data")) throw new HttpError(415, "Định dạng biểu mẫu không hợp lệ.");
    const body = await limitedBody(request, 2 * 1024 * 1024 + 64 * 1024);
    let form: FormData;
    try { form = await new Response(body, { headers: { "Content-Type": contentType } }).formData(); }
    catch { throw new HttpError(400, "Biểu mẫu không hợp lệ."); }
    const input = novelInput(Object.fromEntries(["title", "author", "description", "status"].map(key => [key, form.get(key)])));
    const file = form.get("cover");
    if (file !== null && !(file instanceof File)) throw new HttpError(400, "Tệp ảnh không hợp lệ.");
    if (file instanceof File && file.size > 0) {
      if (file.size > 2 * 1024 * 1024) throw new HttpError(413, "Ảnh bìa tối đa 2 MB.");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const extension = imageExtension(bytes, file.type);
      const uploaded = await put(`covers/${getSchema()}/${randomUUID()}.${extension}`, Buffer.from(bytes), { access: "public", contentType: file.type, addRandomSuffix: false });
      uploadedUrl = uploaded.url;
    }
    const novel = await updateNovel(input, uploadedUrl);
    saved = true;
    revalidatePath("/");
    return json({ novel });
  } catch (error) {
    if (uploadedUrl && !saved) { try { await del(uploadedUrl); } catch { /* Keep the original request error; never log credentials. */ } }
    return failure(error);
  }
}
