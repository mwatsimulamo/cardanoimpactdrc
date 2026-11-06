-- Dossiers publics d'équipes : membres, identifiants Forum, article.
-- Aucun courriel dans la vue. Les tables restent fermées à anon.

create table public.team_member_forum_profiles (
  member_id uuid primary key references public.team_members (id) on delete cascade,
  forum_username text check (
    forum_username is null
    or (
      char_length(forum_username) between 1 and 60
      and forum_username !~ '[[:space:]@/]'
    )
  ),
  forum_profile_url text check (
    forum_profile_url is null
    or (
      char_length(forum_profile_url) <= 500
      and forum_profile_url ~ '^https://forum\.cardano\.org/[^[:space:]]+$'
    )
  ),
  status text not null default 'not_provided' check (
    status in ('not_provided', 'pending_review', 'verified', 'mismatch')
  ),
  updated_at timestamptz not null default now(),
  check (
    (
      forum_username is null
      and forum_profile_url is null
      and status = 'not_provided'
    )
    or (
      forum_username is not null
      and forum_profile_url is not null
      and status in ('pending_review', 'verified', 'mismatch')
    )
  )
);

create unique index forum_username_key
  on public.team_member_forum_profiles (lower(forum_username))
  where forum_username is not null;

create unique index forum_profile_url_key
  on public.team_member_forum_profiles (forum_profile_url)
  where forum_profile_url is not null;

create table public.team_articles (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete restrict,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  url text not null check (
    char_length(url) <= 500
    and url ~ '^https://forum\.cardano\.org/[^[:space:]]+$'
  ),
  status text not null default 'submitted' check (
    status in ('submitted', 'verified', 'correction_requested')
  ),
  is_current boolean not null default true,
  submitted_at timestamptz not null default now(),
  submitted_by_member_id uuid not null references public.team_members (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index team_one_current_article
  on public.team_articles (team_id)
  where is_current;

create view public.public_team_dossiers
with (security_invoker = false) as
select
  t.id,
  t.name,
  t.submitted_at,
  (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'givenName', m.given_name,
          'familyName', m.family_name,
          'role', m.member_role,
          'forumUsername', f.forum_username,
          'forumProfileUrl', f.forum_profile_url
        )
        order by
          case m.member_role
            when 'leader' then 0
            when 'deputy' then 1
            else 2
          end,
          m.joined_at
      ),
      '[]'::jsonb
    )
    from public.team_members m
    left join public.team_member_forum_profiles f on f.member_id = m.id
    where m.team_id = t.id
      and m.left_at is null
  ) as members,
  a.title as article_title,
  a.url as article_url
from public.teams t
left join public.team_articles a
  on a.team_id = t.id
 and a.is_current = true
where t.status = 'submitted';

alter table public.team_member_forum_profiles enable row level security;
alter table public.team_articles enable row level security;

revoke all on table public.team_member_forum_profiles from public, anon, authenticated;
revoke all on table public.team_articles from public, anon, authenticated;
revoke all on table public.public_team_dossiers from public, anon, authenticated;
grant select on table public.public_team_dossiers to anon, authenticated;
