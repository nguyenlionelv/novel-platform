-- Isolated environments in the dedicated Supabase novel-platform project.
-- Application passwords are provisioned separately and never stored in migrations.
do $roles$
begin
  if not exists (select 1 from pg_roles where rolname = 'novel_preview_app') then
    create role novel_preview_app nologin noinherit nosuperuser nocreatedb nocreaterole noreplication;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'novel_production_app') then
    create role novel_production_app nologin noinherit nosuperuser nocreatedb nocreaterole noreplication;
  end if;
end
$roles$;

do $foundation$
declare
  schema_name text;
  app_role text;
  table_name text;
begin
  foreach schema_name in array array['novel_preview', 'novel_production'] loop
    app_role := schema_name || '_app';
    execute format('create schema if not exists %I', schema_name);
    execute format('revoke all on schema %I from public, anon, authenticated', schema_name);

    execute format('create table if not exists %I.novels (
      id smallint primary key default 1 check (id = 1),
      title text not null default '''' check (char_length(title) <= 200),
      author text not null default '''' check (char_length(author) <= 100),
      description text not null default '''' check (char_length(description) <= 5000),
      cover_url text,
      status text not null default ''ongoing'' check (status in (''ongoing'', ''completed'')),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )', schema_name);

    execute format('create table if not exists %I.chapters (
      id uuid primary key default gen_random_uuid(),
      novel_id smallint not null default 1 references %I.novels(id) on delete restrict,
      position integer not null check (position > 0),
      title text not null check (char_length(btrim(title)) between 1 and 200),
      content text not null check (char_length(btrim(content)) between 1 and 200000),
      status text not null default ''draft'' check (status in (''draft'', ''published'')),
      published_at timestamptz,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (novel_id, position),
      check (status <> ''published'' or published_at is not null)
    )', schema_name, schema_name);

    execute format('create table if not exists %I.reviews (
      id uuid primary key default gen_random_uuid(),
      novel_id smallint not null default 1 references %I.novels(id) on delete restrict,
      display_name text not null check (char_length(btrim(display_name)) between 1 and 50),
      rating smallint not null check (rating between 1 and 5),
      comment text not null default '''' check (char_length(comment) <= 1000),
      is_hidden boolean not null default false,
      created_at timestamptz not null default now()
    )', schema_name, schema_name);

    execute format('create table if not exists %I.rate_limits (
      key text primary key check (key ~ ''^[a-f0-9]{64}$''),
      attempts integer not null check (attempts > 0),
      reset_at timestamptz not null
    )', schema_name);

    execute format('create index if not exists chapters_published_order on %I.chapters (novel_id, position) where status = ''published''', schema_name);
    execute format('create index if not exists reviews_visible_recent on %I.reviews (novel_id, created_at desc, id) where is_hidden = false', schema_name);
    execute format('create index if not exists reviews_novel_fk on %I.reviews (novel_id)', schema_name);
    execute format('create index if not exists rate_limits_expiry on %I.rate_limits (reset_at)', schema_name);

    foreach table_name in array array['novels', 'chapters', 'reviews', 'rate_limits'] loop
      execute format('alter table %I.%I enable row level security', schema_name, table_name);
      execute format('revoke all on %I.%I from public, anon, authenticated', schema_name, table_name);
      if not exists (
        select 1 from pg_policies p where p.schemaname = schema_name and p.tablename = table_name and p.policyname = 'app_access'
      ) then
        execute format('create policy app_access on %I.%I for all to %I using (true) with check (true)', schema_name, table_name, app_role);
      end if;
    end loop;

    execute format('grant usage on schema %I to %I', schema_name, app_role);
    execute format('grant select, update on %I.novels to %I', schema_name, app_role);
    execute format('grant select, insert, update, delete on %I.chapters to %I', schema_name, app_role);
    execute format('grant select, insert, update on %I.reviews to %I', schema_name, app_role);
    execute format('grant select, insert, update, delete on %I.rate_limits to %I', schema_name, app_role);
    execute format('insert into %I.novels (id) values (1) on conflict (id) do nothing', schema_name);
  end loop;
end
$foundation$;
