-- Journal des actions équipes (écran admin Historique).
-- Absent des migrations précédentes alors que le schéma et readAdminHistory() le prévoient.
-- Accès réservé à la clé service role (même modèle que teams / leader_access).

create table if not exists public.team_activity_logs (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  actor_kind text not null check (actor_kind in ('leader', 'admin', 'system')),
  actor_admin_id uuid references public.admin_profiles (user_id),
  actor_member_id uuid references public.team_members (id),
  action text not null check (char_length(btrim(action)) between 1 and 80),
  summary text not null check (char_length(summary) <= 500),
  created_at timestamptz not null default now(),
  check (
    (actor_kind = 'admin' and actor_admin_id is not null)
    or (actor_kind = 'leader' and actor_member_id is not null)
    or (actor_kind = 'system' and actor_admin_id is null and actor_member_id is null)
  )
);

create index if not exists team_activity_logs_team_idx
  on public.team_activity_logs (team_id, created_at desc);

alter table public.team_activity_logs enable row level security;

revoke all on table public.team_activity_logs from public, anon, authenticated;
