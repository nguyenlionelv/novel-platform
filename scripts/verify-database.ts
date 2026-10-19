import nextEnv from "@next/env";
import assert from "node:assert/strict";

nextEnv.loadEnvConfig(process.cwd());
const { getDb, getSchema } = await import("../src/lib/db/client");
const sql = getDb();
try {
  const schema = getSchema();
  const [row] = await sql<{ count: number }[]>`select count(*)::int as count from ${sql(schema)}.novels`;
  if (row.count !== 1) throw new Error("Expected exactly one novel");
  const [privileges] = await sql`select has_schema_privilege(current_user, ${schema === 'novel_preview' ? 'novel_production' : 'novel_preview'}, 'USAGE') as other_schema_access`;
  if (privileges.other_schema_access) throw new Error("App role must not access the other environment schema");
  const rollback = new Error("Expected smoke test rollback");
  try {
    await sql.begin(async (transaction) => {
      const [draft] = await transaction`insert into ${transaction(schema)}.chapters (position, title, content) values (2147483647, 'Smoke test (rolled back)', 'Verification only') returning id`;
      const hidden = await transaction`select id from ${transaction(schema)}.chapters where id = ${draft.id} and status = 'published'`;
      assert.equal(hidden.length, 0);
      await transaction`update ${transaction(schema)}.chapters set status = 'published', published_at = now() where id = ${draft.id}`;
      const visible = await transaction`select id from ${transaction(schema)}.chapters where id = ${draft.id} and status = 'published'`;
      assert.equal(visible.length, 1);
      await transaction`insert into ${transaction(schema)}.reviews (display_name, rating) values ('Smoke test (rolled back)', 5)`;
      await assert.rejects(transaction.savepoint(async (savepoint) => {
        await savepoint`insert into ${savepoint(schema)}.reviews (display_name, rating) values ('Invalid smoke test', 0)`;
      }), (error: unknown) => !!error && typeof error === "object" && "code" in error && error.code === "23514");
      throw rollback;
    });
  } catch (error) { if (error !== rollback) throw error; }
  console.log(`Database verified: ${schema}, one novel, other environment denied; chapter/review read-write and rating constraint passed (smoke data rolled back).`);
} catch (error) {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "verification_failed";
  console.error(`Database verification failed (${code}). Connection values hidden.`);
  process.exitCode = 1;
} finally { await sql.end(); }
