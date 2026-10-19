import { authorize, failure, json } from "@/lib/admin/http";
import { getAdminOverview } from "@/lib/db/admin";

export async function GET(request: Request) {
  try { await authorize(request, false); return json(await getAdminOverview()); }
  catch (error) { return failure(error); }
}
