-- Première tranche : équipes du concours.
-- admin_profiles est créée vide, parce qu'un changement de statut d'équipe
-- doit pouvoir désigner un organisateur. Aucun compte n'est inséré.
-- Le formulaire public reste fermé tant que la notice A-13 manque
-- et hors de la fenêtre du 9 au 21 novembre 2026.

create table public.admin_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(btrim(full_name)) between 1 and 120),
  created_at timestamptz not null default now()
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  city text not null check (char_length(btrim(city)) between 1 and 80),
  country text not null check (char_length(btrim(country)) between 1 and 80),
  status text not null default 'submitted' check (
    status in ('submitted', 'suspended', 'rejected')
  ),
  status_reason text check (
    status_reason is null or char_length(status_reason) <= 2000
  ),
  submitted_at timestamptz not null default now(),
  status_changed_at timestamptz,
  status_changed_by uuid references public.admin_profiles (user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    status = 'submitted'
    or (
      status_reason is not null
      and char_length(btrim(status_reason)) > 0
      and status_changed_at is not null
      and status_changed_by is not null
    )
  )
);

create unique index teams_submitted_name_key
  on public.teams (lower(btrim(name)))
  where status = 'submitted';

create index teams_status_idx on public.teams (status);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete restrict,
  given_name text not null check (char_length(btrim(given_name)) between 1 and 80),
  family_name text not null check (char_length(btrim(family_name)) between 1 and 80),
  email text not null check (
    email = lower(email)
    and char_length(email) <= 254
    and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  member_role text not null check (member_role in ('leader', 'deputy', 'member')),
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (left_at is null or left_at >= joined_at)
);

create unique index team_members_active_email_key
  on public.team_members (email)
  where left_at is null;

create unique index team_one_active_leader
  on public.team_members (team_id)
  where member_role = 'leader' and left_at is null;

create unique index team_one_active_deputy
  on public.team_members (team_id)
  where member_role = 'deputy' and left_at is null;

create index team_members_team_id_idx on public.team_members (team_id);

create view public.public_teams
with (security_invoker = false) as
select
  t.id,
  t.name,
  (
    select count(*)::integer
    from public.team_members m
    where m.team_id = t.id
      and m.left_at is null
  ) as member_count
from public.teams t
where t.status = 'submitted';

create function public.register_submitted_team(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_team_id uuid;
  member jsonb;
  leader_count integer;
  deputy_count integer;
  member_count integer;
  team_name text;
  team_city text;
  team_country text;
  member_given_name text;
  member_family_name text;
  member_email text;
  member_role text;
begin
  if jsonb_typeof(payload) <> 'object' or jsonb_typeof(payload->'members') <> 'array' then
    raise exception 'invalid team payload';
  end if;

  team_name := btrim(coalesce(payload->>'name', ''));
  team_city := btrim(coalesce(payload->>'city', ''));
  team_country := btrim(coalesce(payload->>'country', ''));
  member_count := jsonb_array_length(payload->'members');

  if char_length(team_name) < 1 or char_length(team_name) > 120
     or char_length(team_city) < 1 or char_length(team_city) > 80
     or char_length(team_country) < 1 or char_length(team_country) > 80
     or member_count < 3 or member_count > 5 then
    raise exception 'invalid team fields';
  end if;

  select count(*) into leader_count
  from jsonb_array_elements(payload->'members') as item
  where item->>'role' = 'leader';

  select count(*) into deputy_count
  from jsonb_array_elements(payload->'members') as item
  where item->>'role' = 'deputy';

  if leader_count <> 1 or deputy_count > 1 then
    raise exception 'invalid roles';
  end if;

  insert into public.teams (name, city, country, status)
  values (team_name, team_city, team_country, 'submitted')
  returning id into new_team_id;

  for member in
    select value from jsonb_array_elements(payload->'members')
  loop
    member_given_name := btrim(coalesce(member->>'givenName', ''));
    member_family_name := btrim(coalesce(member->>'familyName', ''));
    member_email := lower(btrim(coalesce(member->>'email', '')));
    member_role := member->>'role';

    if member_role not in ('leader', 'deputy', 'member')
       or char_length(member_given_name) < 1 or char_length(member_given_name) > 80
       or char_length(member_family_name) < 1 or char_length(member_family_name) > 80
       or char_length(member_email) > 254
       or member_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
      raise exception 'invalid member';
    end if;

    insert into public.team_members (
      team_id,
      given_name,
      family_name,
      email,
      member_role
    )
    values (
      new_team_id,
      member_given_name,
      member_family_name,
      member_email,
      member_role
    );
  end loop;

  return new_team_id;
end;
$$;

alter table public.admin_profiles enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;

revoke all on table public.admin_profiles from public, anon, authenticated;
revoke all on table public.teams from public, anon, authenticated;
revoke all on table public.team_members from public, anon, authenticated;
revoke all on table public.public_teams from public, anon, authenticated;
grant select on table public.public_teams to anon, authenticated;

revoke all on function public.register_submitted_team(jsonb) from public, anon, authenticated;
grant execute on function public.register_submitted_team(jsonb) to service_role;
