-- Code d'accès du team leader.
-- Deux lettres du nom de l'équipe, en majuscules, puis six chiffres.
-- code_prefix conserve ces deux lettres. secret_hash est le hachage du code complet.
-- used_at marque un code remplacé. Un code ouvert se réutilise jusqu'à expires_at.

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

alter table public.leader_access_challenges
  add column if not exists code_prefix text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'leader_access_code_prefix_chk'
      and conrelid = 'public.leader_access_challenges'::regclass
  ) then
    alter table public.leader_access_challenges
      add constraint leader_access_code_prefix_chk
      check (code_prefix is null or code_prefix ~ '^[A-Z]{2}$');
  end if;
end
$$;

create index if not exists leader_access_open_idx
  on public.leader_access_challenges (email, expires_at)
  where used_at is null;

alter table public.leader_access_challenges enable row level security;

revoke all on table public.leader_access_challenges from public, anon, authenticated;
