-- Tables de l'administration. À exécuter une fois dans l'éditeur SQL de Supabase.
-- Les équipes participantes restent dans les tables déjà en place.
-- Les textes sont en français. Les photographies sont les originaux déposés, sans transformation.
-- Aucune ligne d'exemple, hormis les six phases du calendrier, toutes à venir.

create table if not exists public.program_phases (
  phase_key text primary key check (
    phase_key in ('launch', 'training', 'teams', 'competition', 'jury', 'workshop')
  ),
  status text not null default 'upcoming' check (
    status in ('upcoming', 'current', 'done', 'postponed')
  ),
  updated_at timestamptz not null default now()
);

insert into public.program_phases (phase_key)
values ('launch'), ('training'), ('teams'), ('competition'), ('jury'), ('workshop')
on conflict (phase_key) do nothing;

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title_fr text not null default '',
  body_fr text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint announcements_slug_key unique (slug),
  constraint announcements_published_complete check (
    status <> 'published'
    or (
      published_at is not null
      and char_length(btrim(title_fr)) > 0
      and char_length(btrim(body_fr)) > 0
    )
  )
);

create table if not exists public.documented_activities (
  id uuid primary key default gen_random_uuid(),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  category text not null check (
    category in (
      'online_training',
      'team_research',
      'competition_submission',
      'jury_evaluation',
      'closing_workshop'
    )
  ),
  title_fr text not null default '',
  description_fr text not null default '',
  occurred_on date,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  has_image boolean not null default false,
  image_type text not null default '' check (
    image_type in ('', 'image/jpeg', 'image/png', 'image/webp')
  ),
  image_data text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint documented_activities_slug_key unique (slug),
  constraint documented_activities_published_complete check (
    status <> 'published'
    or (
      published_at is not null
      and occurred_on is not null
      and char_length(btrim(title_fr)) > 0
      and char_length(btrim(description_fr)) > 0
    )
  )
);

create table if not exists public.program_organizers (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  role text not null default '',
  x_url text not null default '',
  linkedin_url text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  has_image boolean not null default false,
  image_type text not null default '' check (
    image_type in ('', 'image/jpeg', 'image/png', 'image/webp')
  ),
  image_data text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint program_organizers_published_complete check (
    status <> 'published'
    or (
      char_length(btrim(name)) > 0
      and char_length(btrim(role)) > 0
    )
  )
);

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  description text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  has_image boolean not null default false,
  image_type text not null default '' check (
    image_type in ('', 'image/jpeg', 'image/png', 'image/webp')
  ),
  image_data text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gallery_items_published_complete check (
    status <> 'published'
    or (
      published_at is not null
      and char_length(btrim(description)) > 0
      and char_length(image_data) > 0
    )
  )
);

create table if not exists public.competition_results (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'draft' check (status in ('draft', 'published')),
  statement_fr text not null default '',
  place_1_team_id uuid references public.teams (id) on delete restrict,
  place_2_team_id uuid references public.teams (id) on delete restrict,
  place_3_team_id uuid references public.teams (id) on delete restrict,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint competition_results_published_complete check (
    status <> 'published'
    or (
      published_at is not null
      and char_length(btrim(statement_fr)) > 0
      and place_1_team_id is not null
      and place_2_team_id is not null
      and place_3_team_id is not null
      and place_1_team_id <> place_2_team_id
      and place_1_team_id <> place_3_team_id
      and place_2_team_id <> place_3_team_id
    )
  )
);

create unique index if not exists competition_results_singleton
  on public.competition_results ((true));

alter table public.program_phases enable row level security;
alter table public.announcements enable row level security;
alter table public.documented_activities enable row level security;
alter table public.program_organizers enable row level security;
alter table public.gallery_items enable row level security;
alter table public.competition_results enable row level security;

revoke all on table public.program_phases from public, anon, authenticated;
revoke all on table public.announcements from public, anon, authenticated;
revoke all on table public.documented_activities from public, anon, authenticated;
revoke all on table public.program_organizers from public, anon, authenticated;
revoke all on table public.gallery_items from public, anon, authenticated;
revoke all on table public.competition_results from public, anon, authenticated;
