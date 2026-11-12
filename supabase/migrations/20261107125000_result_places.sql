-- Places suivantes, saisies par les organisateurs. 1, 2 et 3 restent les colonnes déjà en place.

alter table public.competition_results
  add column if not exists team_places jsonb not null default '[]'::jsonb;
