import "server-only";
import { withDb, getSchema } from "./client";
import type { PublicReview, ReviewCursor, ReviewInput, ReviewPage } from "../reviews/types";

export async function getPublicReviews(before?: ReviewCursor): Promise<ReviewPage> {
  return withDb(async sql => {
    const schema = getSchema();
    // Keep microseconds, including when binding the cursor: a text parameter avoids
    // Postgres.js converting timestamptz inputs through millisecond-only JS Date.
    const rows = await sql<PublicReview[]>`
      select id, display_name, rating, comment, to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') as created_at from ${sql(schema)}.reviews r
      where novel_id = 1 and is_hidden = false
      and ${before ? sql`(created_at, id) < (${before.createdAt}::text::timestamptz, ${before.id}::uuid)` : sql`true`}
      order by r.created_at desc, id desc limit 11`;
    const [summary] = await sql<{ count: number; average: number | null }[]>`select count(*)::int as count, avg(rating)::double precision as average from ${sql(schema)}.reviews where novel_id = 1 and is_hidden = false`;
    return { reviews: rows.slice(0, 10), hasMore: rows.length > 10, summary };
  });
}

export async function createReview(input: ReviewInput) {
  await withDb(async sql => sql`insert into ${sql(getSchema())}.reviews (novel_id, display_name, rating, comment) values (1, ${input.displayName}, ${input.rating}, ${input.comment})`);
}
