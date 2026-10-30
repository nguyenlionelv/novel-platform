-- CLI-created file aligned to the version recorded by cloud apply_migration.
-- Additive only: no novel/chapter/review content is replaced.
do $accounts$
declare s text; r text; t text;
begin
  foreach s in array array['novel_preview','novel_production'] loop
    r := s || '_app';
    execute format('create table %I.reader_profiles (
      user_id uuid primary key references auth.users(id) on delete cascade,
      display_name text not null check(char_length(btrim(display_name)) between 1 and 50),
      created_at timestamptz not null default clock_timestamp(),
      notifications_read_at timestamptz not null default clock_timestamp()
    )',s);
    execute format('alter table %I.reviews add column user_id uuid references auth.users(id) on delete set null',s);
    execute format('create index reviews_user_recent on %I.reviews(user_id,created_at desc,id desc) where user_id is not null',s);
    execute format('create table %I.reading_progress (
      user_id uuid not null references %I.reader_profiles(user_id) on delete cascade,
      chapter_id uuid not null references %I.chapters(id) on delete cascade,
      progress double precision not null check(progress >= 0 and progress <= 1),
      updated_at timestamptz not null default now(), primary key(user_id,chapter_id)
    )',s,s,s);
    execute format('create index reading_progress_chapter_fk on %I.reading_progress(chapter_id)',s);
    execute format('create table %I.bookmarks (
      user_id uuid primary key references %I.reader_profiles(user_id) on delete cascade,
      id uuid not null unique default gen_random_uuid(),
      chapter_id uuid not null references %I.chapters(id) on delete cascade,
      paragraph integer not null check(paragraph between 0 and 200000),
      "offset" double precision not null check("offset" >= 0 and "offset" <= 1),
      created_at timestamptz not null default now()
    )',s,s,s);
    execute format('create index bookmarks_chapter_fk on %I.bookmarks(chapter_id)',s);
    execute format('create table %I.chapter_notifications (
      chapter_id uuid primary key references %I.chapters(id) on delete cascade,
      created_at timestamptz not null default clock_timestamp()
    )',s,s);
    execute format('create index chapter_notifications_recent on %I.chapter_notifications(created_at desc,chapter_id)',s);
    -- Seed publication markers silently. New profiles only see future events;
    -- republishing an existing chapter must not create a new notification.
    execute format('insert into %I.chapter_notifications(chapter_id,created_at) select id,coalesce(published_at,created_at) from %I.chapters where status=''published''',s,s);
    foreach t in array array['reader_profiles','reading_progress','bookmarks','chapter_notifications'] loop
      execute format('alter table %I.%I enable row level security',s,t);
      execute format('revoke all on %I.%I from public,anon,authenticated',s,t);
      execute format('create policy app_access on %I.%I for all to %I using(true) with check(true)',s,t,r);
    end loop;
    execute format('grant select,insert,update on %I.reader_profiles to %I',s,r);
    execute format('grant select,insert,update,delete on %I.reading_progress to %I',s,r);
    execute format('grant select,insert,delete on %I.bookmarks to %I',s,r);
    execute format('grant select,insert on %I.chapter_notifications to %I',s,r);
    -- Invoker trigger: only the existing server application role can publish.
    execute format('create function %I.notify_first_publication() returns trigger language plpgsql security invoker set search_path='''' as $fn$
      begin
        if new.status=''published'' then
          insert into %I.chapter_notifications(chapter_id) values(new.id) on conflict(chapter_id) do nothing;
        end if;
        return new;
      end $fn$',s,s);
    execute format('revoke all on function %I.notify_first_publication() from public,anon,authenticated',s);
    execute format('grant execute on function %I.notify_first_publication() to %I',s,r);
    execute format('create trigger chapter_first_publication after insert or update of status on %I.chapters for each row execute function %I.notify_first_publication()',s,s);
  end loop;
end $accounts$;
