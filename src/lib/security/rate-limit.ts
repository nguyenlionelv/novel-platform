import "server-only";
import { createHmac } from "node:crypto";
import { getDb, getSchema } from "../db/client";
import { secretEnv } from "../env";

export async function consumeRateLimit(scope: "admin-login" | "review", identifier: string): Promise<boolean> {
  const sql = getDb();
  const limit = scope === "admin-login" ? 5 : 1;
  const windowSeconds = scope === "admin-login" ? 900 : 60;
  const key = createHmac("sha256", secretEnv("RATE_LIMIT_SECRET")).update(`${scope}:${identifier}`).digest("hex");
  const [row] = await sql<{ attempts: number }[]>`
    insert into ${sql(getSchema())}.rate_limits as current_limit (key, attempts, reset_at)
    values (${key}, 1, now() + make_interval(secs => ${windowSeconds}))
    on conflict (key) do update set
      attempts = case when current_limit.reset_at <= now() then 1 else least(current_limit.attempts + 1, ${limit + 1}) end,
      reset_at = case when current_limit.reset_at <= now() then now() + make_interval(secs => ${windowSeconds}) else current_limit.reset_at end
    returning attempts`;
  return row.attempts <= limit;
}
