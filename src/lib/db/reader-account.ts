import "server-only";
import type { User } from "@supabase/supabase-js";
import { withDb, getSchema } from "./client";
import type { Bookmark, OwnReview, Progress, ReaderNotification, ReaderProfile, ReaderState } from "../reader-account/types";
import { HttpError } from "../admin/validation";
import { splitChapterParagraphs } from "../reader/paragraphs";

export async function ensureReaderProfile(user: User): Promise<ReaderProfile> {
  const candidate = user.user_metadata?.display_name ?? user.user_metadata?.full_name;
  const name = typeof candidate === "string" && candidate.trim() ? candidate.trim().slice(0, 50) : "Độc giả";
  const [profile] = await withDb(async sql => sql<ReaderProfile[]>`
    insert into ${sql(getSchema())}.reader_profiles (user_id, display_name) values (${user.id}::uuid, ${name})
    on conflict (user_id) do update set user_id = excluded.user_id returning user_id, display_name`);
  return profile;
}

export async function getReaderState(user: User): Promise<ReaderState> {
  const profile = await ensureReaderProfile(user);
  return withDb(async sql => {
    const s = getSchema();
    const progress = await sql<Progress[]>`select p.chapter_id, c.position, c.title, p.progress, p.updated_at::text from ${sql(s)}.reading_progress p join ${sql(s)}.chapters c on c.id=p.chapter_id where p.user_id=${user.id}::uuid and c.status='published' order by p.updated_at desc`;
    const [bookmark] = await sql<Bookmark[]>`select b.id, b.chapter_id, b.paragraph, b."offset", coalesce(c.position,0) as position, coalesce(c.title,'Chương tạm gỡ') as title, (c.id is not null) as available from ${sql(s)}.bookmarks b left join ${sql(s)}.chapters c on c.id=b.chapter_id and c.status='published' where b.user_id=${user.id}::uuid`;
    const notifications = await sql<ReaderNotification[]>`select n.chapter_id,c.position,c.title,n.created_at::text, (n.created_at > p.notifications_read_at) as unread from ${sql(s)}.chapter_notifications n join ${sql(s)}.chapters c on c.id=n.chapter_id join ${sql(s)}.reader_profiles p on p.user_id=${user.id}::uuid where c.status='published' and n.created_at >= p.created_at order by n.created_at desc,n.chapter_id limit 30`;
    const [count] = await sql<{ unread: number }[]>`select count(*)::int as unread from ${sql(s)}.chapter_notifications n join ${sql(s)}.chapters c on c.id=n.chapter_id join ${sql(s)}.reader_profiles p on p.user_id=${user.id}::uuid where c.status='published' and n.created_at>=p.created_at and n.created_at>p.notifications_read_at`;
    const reviews = await sql<OwnReview[]>`select id,rating,comment,created_at::text,is_hidden from ${sql(s)}.reviews where user_id=${user.id}::uuid order by created_at desc,id desc limit 100`;
    return { profile, progress, bookmark: bookmark ?? null, notifications, unread: count.unread, reviews };
  });
}

export async function saveProgress(userId: string, chapterId: string, progress: number) {
  const rows = await withDb(async sql => {
    const s = getSchema();
    return sql`insert into ${sql(s)}.reading_progress as p (user_id, chapter_id, progress)
      select ${userId}::uuid,c.id,${progress} from ${sql(s)}.chapters c where c.id=${chapterId}::uuid and c.status='published'
      and not exists (select 1 from ${sql(s)}.bookmarks b where b.user_id=${userId}::uuid and b.chapter_id=c.id)
      on conflict (user_id,chapter_id) do update set progress=greatest(p.progress,excluded.progress),updated_at=now() returning chapter_id`;
  });
  if (!rows.length) throw new HttpError(409, "Hãy bỏ dấu đọc tiếp trước, hoặc chương không còn được đăng.");
}

export async function createBookmark(userId: string, chapterId: string, paragraph: number, offset: number) {
  return withDb(async sql => {
    const s = getSchema();
    const [chapter] = await sql<{ content: string }[]>`select content from ${sql(s)}.chapters where id=${chapterId}::uuid and status='published'`;
    if (!chapter) throw new HttpError(404, "Chương không còn được đăng.");
    if (paragraph >= splitChapterParagraphs(chapter.content).length) throw new HttpError(400, "Vị trí đọc không còn hợp lệ. Hãy tải lại chương.");
    const [row] = await sql`insert into ${sql(s)}.bookmarks (user_id,chapter_id,paragraph,"offset") select ${userId}::uuid,c.id,${paragraph},${offset} from ${sql(s)}.chapters c where c.id=${chapterId}::uuid and c.status='published' on conflict (user_id) do nothing returning id`;
    if (!row) throw new HttpError(409, "Bạn đang có một dấu đọc tiếp. Hãy bỏ dấu cũ trước khi đặt dấu mới.");
    return row.id as string;
  });
}

export async function removeBookmark(userId: string, id: string) {
  const rows = await withDb(async sql => sql`delete from ${sql(getSchema())}.bookmarks where user_id=${userId}::uuid and id=${id}::uuid returning id`);
  if (!rows.length) throw new HttpError(409, "Dấu đã thay đổi ở cửa sổ khác. Hãy tải lại trang.");
}

export async function readNotifications(userId: string, before: string) {
  await withDb(async sql => sql`update ${sql(getSchema())}.reader_profiles set notifications_read_at=greatest(notifications_read_at,least(${before}::text::timestamptz,now())) where user_id=${userId}::uuid`);
}

export async function updateReaderName(userId: string, name: string) {
  await withDb(async sql => sql`update ${sql(getSchema())}.reader_profiles set display_name=${name} where user_id=${userId}::uuid`);
}
