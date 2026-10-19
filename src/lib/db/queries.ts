import "server-only";
import { cache } from "react";
import { withDb, getSchema } from "./client";
import type { ChapterPage, PublishedChapter, PublishedChapterSummary } from "../reader/types";

export interface Novel {
  id: number;
  title: string;
  author: string;
  description: string;
  cover_url: string | null;
  status: "ongoing" | "completed";
}

export const getNovel = cache(async (): Promise<Novel | null> => {
  return withDb(async sql => {
    const rows = await sql<Novel[]>`select id, title, author, description, cover_url, status from ${sql(getSchema())}.novels where id = 1`;
    return rows[0] ?? null;
  });
});

export const getPublishedChapter = cache(async (id: string): Promise<PublishedChapter | null> => {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
  return withDb(async sql => {
    const schema = getSchema();
    const rows = await sql<PublishedChapter[]>`
      select c.id, c.position, c.title, c.content,
        (select p.id from ${sql(schema)}.chapters p where p.novel_id = c.novel_id and p.status = 'published' and p.position < c.position order by p.position desc limit 1) as previous_id,
        (select n.id from ${sql(schema)}.chapters n where n.novel_id = c.novel_id and n.status = 'published' and n.position > c.position order by n.position limit 1) as next_id
      from ${sql(schema)}.chapters c where c.id = ${id}::uuid and c.novel_id = 1 and c.status = 'published'`;
    return rows[0] ?? null;
  });
});

export async function getPublishedChapterPage(after = 0): Promise<ChapterPage> {
  return withDb(async sql => {
    const rows = await sql<PublishedChapterSummary[]>`select id, position, title from ${sql(getSchema())}.chapters where novel_id = 1 and status = 'published' and position > ${after} order by position limit 31`;
    return { chapters: rows.slice(0, 30), hasMore: rows.length > 30 };
  });
}

export async function countPublishedChapters(): Promise<number> {
  return withDb(async sql => {
    const [row] = await sql<{ count: number }[]>`select count(*)::int as count from ${sql(getSchema())}.chapters where novel_id = 1 and status = 'published'`;
    return row.count;
  });
}
