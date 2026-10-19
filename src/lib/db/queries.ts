import "server-only";
import { getDb, getSchema } from "./client";

export interface Novel {
  id: number;
  title: string;
  author: string;
  description: string;
  cover_url: string | null;
  status: "ongoing" | "completed";
}

export async function getNovel(): Promise<Novel | null> {
  const sql = getDb();
  const rows = await sql<Novel[]>`select id, title, author, description, cover_url, status from ${sql(getSchema())}.novels where id = 1`;
  return rows[0] ?? null;
}

export async function getPublishedChapter(id: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
  const sql = getDb();
  const rows = await sql`select id, novel_id, position, title, content, published_at from ${sql(getSchema())}.chapters where id = ${id}::uuid and status = 'published'`;
  return rows[0] ?? null;
}
