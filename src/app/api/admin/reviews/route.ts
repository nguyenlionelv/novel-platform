import { revalidatePath } from "next/cache";
import { authorize, failure, json, readJson } from "@/lib/admin/http";
import { pageOffset, record, uuid } from "@/lib/admin/validation";
import { hideReview, listAdminReviews } from "@/lib/db/admin";

export async function GET(request: Request) {
  try { await authorize(request, false); return json(await listAdminReviews(pageOffset(new URL(request.url).searchParams.get("offset")))); }
  catch (error) { return failure(error); }
}

export async function POST(request: Request) {
  try { await authorize(request); const data = record(await readJson(request, 4096)); await hideReview(uuid(data.id)); revalidatePath("/"); return json({ ok: true }); }
  catch (error) { return failure(error); }
}
