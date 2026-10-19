import { getPublishedChapterPage } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const after = new URL(request.url).searchParams.get("after") ?? "0";
  const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
  if (!/^\d{1,10}$/.test(after) || Number(after) > 2147483647) return Response.json({ error: "Mốc chương không hợp lệ." }, { status: 400, headers });
  try { return Response.json(await getPublishedChapterPage(Number(after)), { headers }); }
  catch { return Response.json({ error: "Chưa tải được mục lục. Vui lòng thử lại." }, { status: 503, headers }); }
}
