-- Espace du responsable : profils Forum, article, défi d'accès.
-- Les tables d'inscription doivent déjà exister.

create table if not exists public.team_member_forum_profiles (
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

create unique index if not exists forum_username_key
  on public.team_member_forum_profiles (lower(forum_username))
  where forum_username is not null;

create unique index if not exists forum_profile_url_key
  on public.team_member_forum_profiles (forum_profile_url)
  where forum_profile_url is not null;

create table if not exists public.team_articles (
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

create unique index if not exists team_one_current_article
  on public.team_articles (team_id)
  where is_current;

-- used_at marque un code remplacé. Un code encore ouvert se réutilise jusqu'à expires_at.
-- code_prefix : deux lettres du nom de l'équipe. Le code complet n'est pas stocké.
create table if not exists public.leader_access_challenges (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  leader_member_id uuid not null references public.team_members (id) on delete restrict,
  email text not null,
  code_prefix text not null check (code_prefix ~ '^[A-Z]{2}$'),
  access_code text check (access_code is null or access_code ~ '^[A-Z]{2}[0-9]{6}$'),
  secret_hash text not null check (char_length(secret_hash) between 32 and 128),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists leader_access_open_idx
  on public.leader_access_challenges (email, expires_at)
  where used_at is null;

create or replace view public.public_team_dossiers
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

create or replace function public.leader_save_forum_profiles(
  p_team_id uuid,
  p_leader_member_id uuid,
  p_profiles jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  profile jsonb;
  profile_member_id uuid;
  username text;
  profile_url text;
  profile_status text;
begin
  if not exists (
    select 1
    from public.team_members m
    join public.teams t on t.id = m.team_id
    where m.id = p_leader_member_id
      and m.team_id = p_team_id
      and m.member_role = 'leader'
      and m.left_at is null
      and t.status = 'submitted'
  ) then
    raise exception 'not the team leader';
  end if;

  if jsonb_typeof(p_profiles) <> 'array' then
    raise exception 'invalid profiles';
  end if;

  for profile in
    select value from jsonb_array_elements(p_profiles)
  loop
    profile_member_id := (profile->>'memberId')::uuid;
    username := nullif(btrim(coalesce(profile->>'forumUsername', '')), '');
    profile_url := nullif(btrim(coalesce(profile->>'forumProfileUrl', '')), '');

    if not exists (
      select 1
      from public.team_members
      where id = profile_member_id
        and team_id = p_team_id
        and left_at is null
    ) then
      raise exception 'invalid member';
    end if;

    if username is null and profile_url is null then
      profile_status := 'not_provided';
    elsif username is not null and profile_url is not null then
      profile_status := 'pending_review';
    else
      raise exception 'incomplete forum profile';
    end if;

    insert into public.team_member_forum_profiles (
      member_id,
      forum_username,
      forum_profile_url,
      status,
      updated_at
    )
    values (
      profile_member_id,
      username,
      profile_url,
      profile_status,
      now()
    )
    on conflict (member_id) do update set
      forum_username = excluded.forum_username,
      forum_profile_url = excluded.forum_profile_url,
      status = case
        when excluded.status = 'not_provided' then 'not_provided'
        when public.team_member_forum_profiles.forum_username is not distinct from excluded.forum_username
         and public.team_member_forum_profiles.forum_profile_url is not distinct from excluded.forum_profile_url
         and public.team_member_forum_profiles.status in ('pending_review', 'verified', 'mismatch')
        then public.team_member_forum_profiles.status
        else 'pending_review'
      end,
      updated_at = now();
  end loop;
end;
$$;

create or replace function public.leader_submit_article(
  p_team_id uuid,
  p_leader_member_id uuid,
  p_title text,
  p_url text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  article_id uuid;
  title_text text;
  url_text text;
begin
  if not exists (
    select 1
    from public.team_members m
    join public.teams t on t.id = m.team_id
    where m.id = p_leader_member_id
      and m.team_id = p_team_id
      and m.member_role = 'leader'
      and m.left_at is null
      and t.status = 'submitted'
  ) then
    raise exception 'not the team leader';
  end if;

  title_text := btrim(coalesce(p_title, ''));
  url_text := btrim(coalesce(p_url, ''));

  if char_length(title_text) < 1 or char_length(title_text) > 200
     or char_length(url_text) < 1 or char_length(url_text) > 500 then
    raise exception 'invalid article';
  end if;

  update public.team_articles
  set is_current = false,
      updated_at = now()
  where team_id = p_team_id
    and is_current = true;

  insert into public.team_articles (
    team_id,
    title,
    url,
    status,
    is_current,
    submitted_by_member_id
  )
  values (
    p_team_id,
    title_text,
    url_text,
    'submitted',
    true,
    p_leader_member_id
  )
  returning id into article_id;

  return article_id;
end;
$$;

alter table public.team_member_forum_profiles enable row level security;
alter table public.team_articles enable row level security;
alter table public.leader_access_challenges enable row level security;

revoke all on table public.team_member_forum_profiles from public, anon, authenticated;
revoke all on table public.team_articles from public, anon, authenticated;
revoke all on table public.leader_access_challenges from public, anon, authenticated;
revoke all on table public.public_team_dossiers from public, anon, authenticated;
grant select on table public.public_team_dossiers to anon, authenticated;

revoke all on function public.leader_save_forum_profiles(uuid, uuid, jsonb) from public, anon, authenticated;
revoke all on function public.leader_submit_article(uuid, uuid, text, text) from public, anon, authenticated;
grant execute on function public.leader_save_forum_profiles(uuid, uuid, jsonb) to service_role;
grant execute on function public.leader_submit_article(uuid, uuid, text, text) to service_role;
