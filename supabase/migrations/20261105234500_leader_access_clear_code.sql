-- Le code en clair reste dans cette table pour les organisateurs.
-- Le public, anon et authenticated n'y ont pas accès.
-- L'ouverture du site compare secret_hash. Elle ne lit pas access_code.

alter table public.leader_access_challenges
  add column if not exists access_code text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'leader_access_code_clear_chk'
      and conrelid = 'public.leader_access_challenges'::regclass
  ) then
    alter table public.leader_access_challenges
      add constraint leader_access_code_clear_chk
      check (access_code is null or access_code ~ '^[A-Z]{2}[0-9]{6}$');
  end if;
end
$$;

create index if not exists leader_access_hash_idx
  on public.leader_access_challenges (secret_hash)
  where used_at is null;
