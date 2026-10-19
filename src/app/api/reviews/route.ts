import { revalidatePath } from "next/cache";
import { json, readJson } from "@/lib/admin/http";
import { HttpError, record } from "@/lib/admin/validation";
import { getPublicReviews, createReview } from "@/lib/db/reviews";
import { reviewCursor, reviewInput } from "@/lib/reviews/validation";
import { isSameOrigin } from "@/lib/security/origin";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { requestIdentifier } from "@/lib/security/request-identifier";

export const dynamic = "force-dynamic";
function failure(error: unknown) {
  return error instanceof HttpError ? json({ error: error.message }, error.status) : json({ error: "Chưa thể hoàn tất. Vui lòng thử lại sau." }, 503);
}

export async function GET(request: Request) {
  try { return json(await getPublicReviews(reviewCursor(new URL(request.url).searchParams.get("before")))); }
  catch (error) { return failure(error); }
}

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) throw new HttpError(403, "Yêu cầu không hợp lệ. Hãy tải lại trang.");
    const input = reviewInput(record(await readJson(request, 16384)));
    if (!await consumeRateLimit("review", requestIdentifier(request))) return json({ error: "Bạn vừa gửi đánh giá. Vui lòng đợi một phút trước khi gửi tiếp." }, 429);
    await createReview(input);
    revalidatePath("/");
    revalidatePath("/chuong/[id]", "page");
    return json({ ok: true }, 201);
  } catch (error) { return failure(error); }
}
