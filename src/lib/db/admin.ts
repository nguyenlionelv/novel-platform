import "server-only";
import { withDb, getSchema } from "./client";
import { getNovel } from "./queries";
import { HttpError } from "../admin/validation";
import type { AdminChapter, AdminOverview, AdminReview, ChapterInput, ChapterSummary, NovelInput } from "../admin/types";

export const ADMIN_PAGE_SIZE = 30;
type ChapterRow = Omit<AdminChapter, "updated_at"> & { updated_at: Date };
type ReviewRow = Omit<AdminReview, "created_at"> & { created_at: Date };
const serializeChapter = (row: ChapterRow): AdminChapter => ({ ...row, updated_at: row.updated_at.toISOString() });

export async function listAdminChapters(offset = 0) {
  const rows = await withDb(async sql => sql<(Omit<ChapterSummary, "updated_at"> & { updated_at: Date })[]>`select id, position, title, status, updated_at from ${sql(getSchema())}.chapters where novel_id = 1 order by position, id limit ${ADMIN_PAGE_SIZE + 1} offset ${offset}`);
  return { chapters: rows.slice(0, ADMIN_PAGE_SIZE).map(row => ({ ...row, updated_at: row.updated_at.toISOString() })), hasMore: rows.length > ADMIN_PAGE_SIZE };
}

export async function listAdminReviews(offset = 0) {
  const rows = await withDb(async sql => sql<ReviewRow[]>`select id, display_name, rating, comment, is_hidden, created_at from ${sql(getSchema())}.reviews where novel_id = 1 order by created_at desc, id limit ${ADMIN_PAGE_SIZE + 1} offset ${offset}`);
  return { reviews: rows.slice(0, ADMIN_PAGE_SIZE).map(row => ({ ...row, created_at: row.created_at.toISOString() })), hasMore: rows.length > ADMIN_PAGE_SIZE };
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const [novel, chapterPage, reviewPage, [position]] = await Promise.all([
    getNovel(), listAdminChapters(), listAdminReviews(),
    withDb(async sql => sql<{ next: number }[]>`select least(coalesce(max(position), 0)::bigint + 1, 2147483647)::int as next from ${sql(getSchema())}.chapters where novel_id = 1`),
  ]);
  if (!novel) throw new HttpError(503, "Dữ liệu truyện chưa được khởi tạo.");
  return { novel, chapters: chapterPage.chapters, chaptersHasMore: chapterPage.hasMore, reviews: reviewPage.reviews, reviewsHasMore: reviewPage.hasMore, nextPosition: position.next };
}

export async function getAdminChapter(id: string): Promise<AdminChapter> {
  const [row] = await withDb(async sql => sql<ChapterRow[]>`select id, position, title, content, status, updated_at from ${sql(getSchema())}.chapters where id = ${id}::uuid and novel_id = 1`);
  if (!row) throw new HttpError(404, "Không tìm thấy chương.");
  return serializeChapter(row);
}

export async function updateNovel(input: NovelInput, coverUrl?: string) {
  const rows = await withDb(async sql => sql`update ${sql(getSchema())}.novels set title = ${input.title}, author = ${input.author}, description = ${input.description}, status = ${input.status}, cover_url = case when ${coverUrl !== undefined} then ${coverUrl ?? null} else cover_url end, updated_at = now() where id = 1 returning id`);
  if (!rows.length) throw new HttpError(404, "Không tìm thấy truyện.");
  return (await getNovel())!;
}

export async function saveChapter(input: ChapterInput): Promise<AdminChapter> {
  const schema = getSchema();
  return withDb(async sql => {
    if (input.id) {
      const expected = input.intent === "draft" || input.intent === "publish" ? "draft" : "published";
      // One conditional UPDATE checks and changes status atomically.
      const [row] = await sql<ChapterRow[]>`update ${sql(schema)}.chapters set position = ${input.position}, title = ${input.title}, content = ${input.content}, status = ${input.intent === "publish" || input.intent === "update" ? "published" : "draft"}, published_at = case when ${input.intent === "publish"} then now() when ${input.intent === "draft" || input.intent === "unpublish"} then null else published_at end, updated_at = now() where id = ${input.id}::uuid and novel_id = 1 and status = ${expected} returning id, position, title, content, status, updated_at`;
      if (!row) {
        const [existing] = await sql`select id from ${sql(schema)}.chapters where id = ${input.id}::uuid and novel_id = 1`;
        if (!existing) throw new HttpError(404, "Không tìm thấy chương.");
        throw new HttpError(409, "Trạng thái chương đã thay đổi. Hãy giữ bản sao nội dung rồi mở lại chương.");
      }
      return serializeChapter(row);
    }
    if (input.intent !== "draft" && input.intent !== "publish") throw new HttpError(400, "Hãy lưu chương mới bằng Lưu nháp hoặc Đăng chương.");
    const [row] = await sql<ChapterRow[]>`insert into ${sql(schema)}.chapters (novel_id, position, title, content, status, published_at) values (1, ${input.position}, ${input.title}, ${input.content}, ${input.intent === "publish" ? "published" : "draft"}, case when ${input.intent === "publish"} then now() else null end) returning id, position, title, content, status, updated_at`;
    return serializeChapter(row);
  });
}

export async function deleteChapter(id: string) {
  const rows = await withDb(async sql => sql`delete from ${sql(getSchema())}.chapters where id = ${id}::uuid and novel_id = 1 returning id`);
  if (!rows.length) throw new HttpError(404, "Không tìm thấy chương.");
}

export async function hideReview(id: string) {
  const rows = await withDb(async sql => sql`update ${sql(getSchema())}.reviews set is_hidden = true where id = ${id}::uuid and novel_id = 1 returning id`);
  if (!rows.length) throw new HttpError(404, "Không tìm thấy đánh giá.");
}
