import "server-only";
import postgres from "postgres";
import { requiredEnv } from "../env";
import supabaseCa from "./supabase-ca.json";

let client: ReturnType<typeof postgres> | undefined;

export function getSchema(): "novel_preview" | "novel_production" {
  const schema = requiredEnv("DATABASE_SCHEMA");
  if (schema !== "novel_preview" && schema !== "novel_production") throw new Error("Invalid database schema");
  return schema;
}

export function getDb() {
  if (!client) {
    client = postgres(requiredEnv("DATABASE_URL"), {
      ssl: { ca: supabaseCa, rejectUnauthorized: true },
      prepare: false,
      max: 2,
      connect_timeout: 10,
      idle_timeout: 20,
      max_lifetime: 60 * 5,
      onnotice: () => {},
    });
  }
  return client;
}

// Supavisor transaction mode cannot safely accept pipelined queries. Reserve a
// connection per operation, await each statement, and always release the lease.
export async function withDb<T>(work: (sql: postgres.ReservedSql) => Promise<T>): Promise<T> {
  const sql = await getDb().reserve();
  try { return await work(sql); }
  finally { sql.release(); }
}
