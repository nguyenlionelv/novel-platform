import { withDb, getSchema } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [result] = await withDb(async sql => sql<{ count: number }[]>`select count(*)::int as count from ${sql(getSchema())}.novels`);
    if (result.count !== 1) throw new Error("Novel not initialized");
    return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ status: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
