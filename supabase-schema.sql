-- ═══════════════════════════════════════════════════════════════
--  ElHub — Supabase SQL Schema
--  Run this in your Supabase project → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ── News articles (cached / seeded articles) ──────────────────
create table if not exists news_articles (
  id          text primary key,
  title       text not null,
  source      text not null,
  url         text,
  image       text,
  views       integer default 0,
  upvotes     integer default 0,
  downvotes   integer default 0,
  created_at  timestamptz default now()
);

-- ── News reactions (emoji counter per article) ────────────────
create table if not exists news_reactions (
  id       uuid primary key default gen_random_uuid(),
  news_id  text not null references news_articles(id) on delete cascade,
  emoji    text not null,
  count    integer default 1,
  unique (news_id, emoji)
);

-- ── News comments ─────────────────────────────────────────────
create table if not exists news_comments (
  id          uuid primary key default gen_random_uuid(),
  news_id     text not null,
  user_name   text not null default 'Anónimo',
  text        text not null,
  emoji       text not null default '💬',
  created_at  timestamptz default now()
);

-- ── Spots ─────────────────────────────────────────────────────
create table if not exists spots (
  id          serial primary key,
  name        text not null,
  category    text not null,
  rating      numeric(3,1) default 0,
  reviews     integer default 0,
  price       text default '$$',
  open        boolean default true,
  vibe        text default '🔥',
  created_at  timestamptz default now()
);

-- ── Spot comments ─────────────────────────────────────────────
create table if not exists spot_comments (
  id          uuid primary key default gen_random_uuid(),
  spot_id     integer not null references spots(id) on delete cascade,
  user_name   text not null default 'Anónimo',
  text        text not null,
  emoji       text not null default '👍',
  created_at  timestamptz default now()
);

-- ── Community topics ──────────────────────────────────────────
create table if not exists community_topics (
  id          serial primary key,
  text        text not null,
  created_at  timestamptz default now()
);

-- ── Topic comments ────────────────────────────────────────────
create table if not exists topic_comments (
  id          uuid primary key default gen_random_uuid(),
  topic_id    integer not null references community_topics(id) on delete cascade,
  user_name   text not null default 'Anónimo',
  text        text not null,
  emoji       text not null default '💬',
  created_at  timestamptz default now()
);

-- ── Trending votes (upvote / downvote per article) ────────────
create table if not exists trending_votes (
  id          uuid primary key default gen_random_uuid(),
  article_id  text not null,
  direction   text not null check (direction in ('up', 'down')),
  created_at  timestamptz default now()
);

-- ── Trending reactions (emoji per article) ────────────────────
create table if not exists trending_reactions (
  id          uuid primary key default gen_random_uuid(),
  article_id  text not null,
  emoji       text not null,
  count       integer default 1,
  unique (article_id, emoji)
);

-- ── User profiles (gamification) ──────────────────────────────
create table if not exists user_profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  user_name     text not null default 'Boricua',
  avatar_emoji  text not null default '🇵🇷',
  points        integer default 0,
  streak        integer default 0,
  badges        text[] default '{}',
  check_ins     integer default 0,
  created_at    timestamptz default now()
);

-- ── Row-Level Security ────────────────────────────────────────
-- Enable RLS on all tables
alter table news_articles       enable row level security;
alter table news_reactions       enable row level security;
alter table news_comments        enable row level security;
alter table spots                enable row level security;
alter table spot_comments        enable row level security;
alter table community_topics     enable row level security;
alter table topic_comments       enable row level security;
alter table trending_votes       enable row level security;
alter table trending_reactions   enable row level security;
alter table user_profiles        enable row level security;

-- Public read on content tables
create policy "public read news_articles"     on news_articles     for select using (true);
create policy "public read news_reactions"    on news_reactions     for select using (true);
create policy "public read news_comments"     on news_comments      for select using (true);
create policy "public read spots"             on spots              for select using (true);
create policy "public read spot_comments"     on spot_comments      for select using (true);
create policy "public read community_topics"  on community_topics   for select using (true);
create policy "public read topic_comments"    on topic_comments     for select using (true);
create policy "public read trending_votes"    on trending_votes     for select using (true);
create policy "public read trending_reactions" on trending_reactions for select using (true);
create policy "public read user_profiles"     on user_profiles      for select using (true);

-- Anon / authenticated insert
create policy "anon insert news_reactions"    on news_reactions     for insert with check (true);
create policy "anon insert news_comments"     on news_comments      for insert with check (true);
create policy "anon insert spots"             on spots              for insert with check (true);
create policy "anon insert spot_comments"     on spot_comments      for insert with check (true);
create policy "anon insert community_topics"  on community_topics   for insert with check (true);
create policy "anon insert topic_comments"    on topic_comments     for insert with check (true);
create policy "anon insert trending_votes"    on trending_votes     for insert with check (true);
create policy "anon insert trending_reactions" on trending_reactions for insert with check (true);

-- Authenticated user can upsert own profile
create policy "user upsert own profile"       on user_profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
