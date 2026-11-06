# Schéma de données

Proposition PostgreSQL pour Supabase, alignée sur `docs/FUNCTIONAL_REQUIREMENTS.md`. Rien n'est migré. Les clients Next.js sont préparés (A-16). Les identifiants sont en anglais (D-06). Les statuts suivent l'hypothèse A-05. L'accès administrateur retenu est le compte unique de D-39, lu sur le serveur. La table `admin_profiles` reste dans le schéma pour une attribution ultérieure. Elle n'ouvre pas la session.

Le volume visé est une cohorte locale (A-19) : index simples et filtres `ilike`, sans moteur de recherche.

## Principes

- Clé primaire `uuid`, valeur `gen_random_uuid()`.
- Instants `timestamptz` en UTC (A-10).
- Textes limités par des contraintes `check`.
- Statuts en `text` contraint, plutôt qu'en type enum PostgreSQL, afin de pouvoir les renommer avant la mise en production si A-05 change.
- Courriel stocké déjà normalisé : espaces retirés, minuscules.
- RLS activé sur chaque table. Le rôle `service_role` reste côté serveur et contourne le RLS. Le navigateur ne reçoit pas ce rôle (D-08, A-16).
- Après création, retirer les droits larges souvent ouverts par défaut à `anon` et `authenticated`, puis rendre uniquement les droits couverts par les politiques.
- Pas de suppression physique d'une équipe soumise. Suspension et rejet sont des statuts. Un membre retiré garde une ligne avec `left_at`.
- Les données personnelles des membres ne sont jamais dans une vue publique.
- Les notes de jury de la première édition ne sont pas dans cette base (D-38). Le résultat officiel publié l'est.

## Ordre de création

1. `admin_profiles`
2. `program_phases`
3. `teams`
4. `team_members`
5. `team_member_forum_profiles`
6. `team_articles`
7. `article_verification_history`
8. `leader_access_challenges`
9. `team_activity_logs`
10. `competition_results`
11. `team_rankings`
12. `announcements`
13. `activities`
14. `attendance_records`
15. `documented_activities`
16. `speakers`
17. `activity_speakers`
18. `activity_media`
19. `activity_resources`

`contact_messages` suit seulement si A-08 est retenue. Les tables 15 à 19 sont proposées par D-31. Elles ne sont pas créées dans cette phase. Elles ne remplacent pas `activities`.

Les tables `participants`, `registrations`, `registration_interests`, `research_teams`, `research_team_members`, `forum_public_links` et `jury_records` ne font plus partie du schéma. L'inscription individuelle au concours et la notation dans le site sont retirées (D-37, D-38).

## Relations

```text
admin_profiles.user_id ── auth.users.id
program_phases.status_changed_by ── admin_profiles.user_id

teams 1──* team_members
team_members 1──0..1 team_member_forum_profiles
teams 1──* team_articles          (une ligne is_current = true)
team_articles 1──* article_verification_history
teams 1──* leader_access_challenges
teams 1──* team_activity_logs
team_members 0..* attendance_records
activities 1──* attendance_records
competition_results 1──* team_rankings
team_rankings *──1 teams
```

La complétude d'une équipe n'est pas une colonne. Elle se calcule : 3 à 5 membres actifs, un `leader`, au plus un `deputy`, et chaque membre actif a un profil forum `verified`. L'état d'article se lit sur la ligne `is_current`.

## Tables retenues

```sql
-- Proposition non appliquée. À valider avant toute migration.

create table public.admin_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(btrim(full_name)) between 1 and 120),
  created_at timestamptz not null default now()
);

create table public.program_phases (
  phase_key text primary key check (
    phase_key in (
      'launch',
      'training',
      'teams',
      'competition',
      'jury',
      'workshop'
    )
  ),
  status text not null default 'upcoming' check (
    status in ('upcoming', 'current', 'done', 'postponed')
  ),
  actual_start date,
  actual_end date,
  supplement_fr text not null default '' check (char_length(supplement_fr) <= 2000),
  supplement_en text not null default '' check (char_length(supplement_en) <= 2000),
  report_fr text not null default '' check (char_length(report_fr) <= 2000),
  report_en text not null default '' check (char_length(report_en) <= 2000),
  status_changed_at timestamptz,
  status_changed_by uuid references public.admin_profiles (user_id),
  updated_at timestamptz not null default now(),
  check (actual_end is null or actual_start is null or actual_end >= actual_start),
  check (
    status = 'upcoming'
    or (
      status_changed_at is not null
      and status_changed_by is not null
    )
  )
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
  checked_at timestamptz,
  checked_by uuid references public.admin_profiles (user_id),
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
  ),
  check (
    (
      status in ('not_provided', 'pending_review')
      and checked_at is null
      and checked_by is null
    )
    or (
      status in ('verified', 'mismatch')
      and checked_at is not null
      and checked_by is not null
    )
  )
);

create unique index forum_username_key
  on public.team_member_forum_profiles (lower(forum_username))
  where forum_username is not null;

create unique index forum_profile_url_key
  on public.team_member_forum_profiles (forum_profile_url)
  where forum_profile_url is not null;

create function public.reset_forum_status_on_change()
returns trigger
language plpgsql
as $$
begin
  if new.forum_username is distinct from old.forum_username
     or new.forum_profile_url is distinct from old.forum_profile_url then
    if new.forum_username is null and new.forum_profile_url is null then
      new.status := 'not_provided';
    else
      new.status := 'pending_review';
    end if;
    new.checked_at := null;
    new.checked_by := null;
  end if;
  return new;
end;
$$;

create trigger forum_profiles_reset_status
  before update on public.team_member_forum_profiles
  for each row
  execute function public.reset_forum_status_on_change();

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

create table public.article_verification_history (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.team_articles (id) on delete cascade,
  from_status text check (
    from_status is null
    or from_status in ('submitted', 'verified', 'correction_requested')
  ),
  to_status text not null check (
    to_status in ('submitted', 'verified', 'correction_requested')
  ),
  note text check (note is null or char_length(note) <= 2000),
  changed_by uuid references public.admin_profiles (user_id),
  changed_at timestamptz not null default now()
);

create index article_verification_history_article_idx
  on public.article_verification_history (article_id, changed_at);

create table public.leader_access_challenges (
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

create index leader_access_open_idx
  on public.leader_access_challenges (email, expires_at)
  where used_at is null;

create table public.team_activity_logs (
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

create index team_activity_logs_team_idx
  on public.team_activity_logs (team_id, created_at desc);

create table public.competition_results (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'draft' check (status in ('draft', 'published')),
  statement_fr text not null default '',
  statement_en text not null default '',
  published_at timestamptz,
  published_by uuid references public.admin_profiles (user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint competition_results_published_complete check (
    status <> 'published'
    or (
      published_at is not null
      and published_by is not null
      and char_length(btrim(statement_fr)) > 0
      and char_length(btrim(statement_en)) > 0
    )
  )
);

create table public.team_rankings (
  result_id uuid not null references public.competition_results (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete restrict,
  place integer not null check (place between 1 and 3),
  primary key (result_id, team_id),
  constraint team_rankings_place_key unique (result_id, place)
);

create view public.public_teams as
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

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title_fr text not null default '',
  title_en text not null default '',
  body_fr text not null default '',
  body_en text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_by uuid references public.admin_profiles (user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint announcements_slug_key unique (slug),
  constraint announcements_published_complete check (
    status <> 'published'
    or (
      published_at is not null
      and char_length(btrim(title_fr)) > 0
      and char_length(btrim(title_en)) > 0
      and char_length(btrim(body_fr)) > 0
      and char_length(btrim(body_en)) > 0
    )
  )
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (
    kind in (
      'online_training',
      'research_competition',
      'workshop',
      'publication',
      'other'
    )
  ),
  title_fr text not null check (char_length(btrim(title_fr)) between 1 and 160),
  title_en text not null check (char_length(btrim(title_en)) between 1 and 160),
  summary_fr text check (summary_fr is null or char_length(summary_fr) <= 2000),
  summary_en text check (summary_en is null or char_length(summary_en) <= 2000),
  location_fr text check (location_fr is null or char_length(location_fr) <= 200),
  location_en text check (location_en is null or char_length(location_en) <= 200),
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'planned' check (
    status in ('planned', 'confirmed', 'completed', 'cancelled')
  ),
  records_attendance boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at >= starts_at)
);

create table public.attendance_records (
  activity_id uuid not null references public.activities (id) on delete cascade,
  member_id uuid not null references public.team_members (id) on delete restrict,
  status text not null check (status in ('expected', 'present', 'absent', 'excused')),
  recorded_by uuid references public.admin_profiles (user_id),
  recorded_at timestamptz not null default now(),
  primary key (activity_id, member_id)
);
```

Index complémentaires :

```sql
create index announcements_publication_idx
  on public.announcements (published_at desc)
  where status = 'published';
create index activities_kind_idx on public.activities (kind);
create index teams_status_idx on public.teams (status);
```

## Activités documentées, intervenants et médias

Proposition D-31, non appliquée. Aucune migration, aucun seau de stockage et aucune ligne d'exemple. Ces tables sont distinctes de `activities` et de `attendance_records`. Aucune clé étrangère ne les relie aux membres d'équipe, aux présences ou à Google Sheets.

Les tables d'administration sont dans `supabase/migrations/20261106021000_admin_editorial.sql` : `program_phases`, `announcements`, `documented_activities`, `program_organizers`, `gallery_items` et `competition_results`. Les photographies originales d'activités et de galerie sont les colonnes `image_data`. Le serveur les délivre à `/media/activity/{id}` et `/media/gallery/{id}`, sans préfixe `/fr` ou `/en`, seulement si la fiche est `published`, ou pour la session administrateur. Les photographies de l'équipe du programme sont des fichiers dans `public/equipe`, indiqués dans `src/lib/organizer-team.ts`. Le site public ne lit pas `program_organizers`. Le fichier déposé est l'original. Aucune transformation par intelligence artificielle n'est prévue.

```sql
-- Proposition D-31, non appliquée.

create table public.documented_activities (
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
  title_en text not null default '',
  summary_fr text not null default '',
  summary_en text not null default '',
  description_fr text not null default '',
  description_en text not null default '',
  highlights_fr text not null default '',
  highlights_en text not null default '',
  format text check (format is null or format in ('online', 'in_person')),
  location_fr text not null default '',
  location_en text not null default '',
  occurred_on date,
  occurred_until date,
  status text not null default 'draft' check (
    status in ('draft', 'published', 'unpublished')
  ),
  published_at timestamptz,
  unpublished_at timestamptz,
  created_by uuid references public.admin_profiles (user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint documented_activities_slug_key unique (slug),
  check (
    occurred_until is null
    or occurred_on is null
    or occurred_until >= occurred_on
  ),
  constraint documented_activities_published_complete check (
    status <> 'published'
    or (
      published_at is not null
      and occurred_on is not null
      and char_length(btrim(title_fr)) > 0
      and char_length(btrim(title_en)) > 0
    )
  )
);

create table public.speakers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(btrim(full_name)) between 1 and 160),
  title_fr text not null default '',
  title_en text not null default '',
  biography_fr text not null default '',
  biography_en text not null default '',
  biography_consent boolean not null default false,
  organization text not null default '',
  profile_url text check (
    profile_url is null
    or (
      char_length(profile_url) <= 500
      and profile_url ~ '^https://[^[:space:]]+$'
    )
  ),
  preferred_locale text check (
    preferred_locale is null or preferred_locale in ('fr', 'en')
  ),
  portrait_storage_path text check (
    portrait_storage_path is null
    or char_length(portrait_storage_path) between 1 and 500
  ),
  portrait_alt_fr text not null default '',
  portrait_alt_en text not null default '',
  portrait_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (portrait_storage_path is null or portrait_consent),
  check (
    (
      char_length(btrim(biography_fr)) = 0
      and char_length(btrim(biography_en)) = 0
    )
    or biography_consent
  )
);

create table public.activity_speakers (
  activity_id uuid not null references public.documented_activities (id) on delete cascade,
  speaker_id uuid not null references public.speakers (id) on delete restrict,
  role_fr text not null default '',
  role_en text not null default '',
  sort_order integer not null default 0 check (sort_order >= 0),
  name_publication_consent boolean not null default false,
  primary key (activity_id, speaker_id)
);

create table public.activity_media (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.documented_activities (id) on delete cascade,
  storage_path text not null check (char_length(storage_path) between 1 and 500),
  original_file_name text not null check (
    char_length(btrim(original_file_name)) between 1 and 200
  ),
  caption_fr text not null default '',
  caption_en text not null default '',
  alt_fr text not null default '',
  alt_en text not null default '',
  sort_order integer not null default 0 check (sort_order >= 0),
  status text not null default 'draft' check (
    status in ('draft', 'published', 'unpublished')
  ),
  identifiable_people boolean not null default false,
  publication_permitted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    status <> 'published'
    or publication_permitted
    or not identifiable_people
  )
);

create table public.activity_resources (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.documented_activities (id) on delete cascade,
  kind text not null check (
    kind in ('presentation', 'recording', 'forum_article', 'external')
  ),
  title_fr text not null default '',
  title_en text not null default '',
  url text not null check (
    char_length(url) <= 500
    and url ~ '^https://[^[:space:]]+$'
  ),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  check (
    char_length(btrim(title_fr)) > 0
    and char_length(btrim(title_en)) > 0
  ),
  check (
    kind <> 'forum_article'
    or url ~ '^https://forum\.cardano\.org/[^[:space:]]+$'
  )
);

create index documented_activities_publication_idx
  on public.documented_activities (category, occurred_on)
  where status = 'published';

create index activity_speakers_speaker_id_idx
  on public.activity_speakers (speaker_id);

create index activity_media_activity_idx
  on public.activity_media (activity_id, sort_order);

create index activity_resources_activity_idx
  on public.activity_resources (activity_id, sort_order);
```

`occurred_on` est une date civile, pas un `timestamptz`. Elle ne reçoit pas minuit pour représenter une journée ou une période (A-09). L'application refuse `published` lorsque `occurred_on` est postérieure à la date du jour à Goma (`Africa/Lubumbashi`, A-10). Pour `jury_evaluation`, la réponse publique omet les intervenants, même si une association existe. Cette limite prolonge D-30 : les noms des jurés et les notes ne sont pas publiés.

Le courriel, le profil X et l'URL WhatsApp de D-32 restent dans le contenu versionné. L'URL WhatsApp n'a pas de table. Les fiches d'équipe de D-33 restent aussi dans le contenu versionné, dans `src/lib/organizer-team.ts`, tant qu'aucune liste n'est fournie. Tant que Supabase n'est pas branché, `src/lib/participating-teams.ts` reste vide : aucune équipe n'est inventée. Après migration, la page lit `public_teams`. La lettre et le journal d'envoi suivent D-41, dans `supabase/migrations/20261106221000_email_communications.sql`.

`updated_at` est tenu par l'application lors de chaque mise à jour. Un déclencheur pourra remplacer ce choix au moment de la migration si les écritures ne passent plus toutes par le serveur.

## Dictionnaire

| Table | Rôle |
| --- | --- |
| `admin_profiles` | Organisateur autorisé. Une ligne par compte `auth.users`. Pas de second rôle (A-06). |
| `program_phases` | État des six phases D-30. Clés `launch`, `training`, `teams`, `competition`, `jury`, `workshop`. Statuts `upcoming`, `current`, `done`, `postponed`. Les dates prévues restent dans le contenu versionné. `actual_start` et `actual_end` sont des dates civiles facultatives. Aucun déclencheur ne change le statut à partir de la date. |
| `teams` | Équipe du concours. Statuts `submitted`, `suspended`, `rejected` (D-37). Ville et pays obligatoires. Pas de thématique (A-14). |
| `team_members` | Membre. Rôle `leader`, `deputy` ou `member`. Un seul leader actif, au plus un adjoint actif. Courriel unique tant que `left_at` est nul (A-04). |
| `team_member_forum_profiles` | Profil forum d'un membre. Les deux champs ensemble ou vides. Statuts `not_provided`, `pending_review`, `verified`, `mismatch`. |
| `team_articles` | Soumission d'article. Une ligne courante par équipe. Statuts `submitted`, `verified`, `correction_requested`. L'absence de ligne vaut « non soumis ». |
| `article_verification_history` | Historique des contrôles d'article, y compris un remplacement pendant la période. |
| `leader_access_challenges` | Code d'accès du team leader (D-24). `secret_hash` sert à l'ouverture. `access_code` conserve le code pour les organisateurs. La table n'est pas lisible par le public. Réutilisable tant que `used_at` est nul et que `expires_at` n'est pas passé. |
| `team_activity_logs` | Journal des modifications et des transferts de responsabilité. Pas de mot de passe, pas de secret. |
| `public_teams` | Vue : identifiant, nom, nombre de membres des équipes `submitted`. Seule lecture publique des équipes. |
| `competition_results` | Texte bilingue du résultat officiel, saisi après consolidation hors site (D-38). |
| `team_rankings` | Places publiques 1, 2 et 3, après D-26. |
| `announcements` | Communication bilingue. Le texte est brut (D-07). |
| `activities` | Séance opérationnelle des présences. `starts_at` nul tant que l'heure n'est pas fixée (A-09). |
| `attendance_records` | Présence d'un membre d'équipe à une séance. Jamais lue par une page publique. |
| `documented_activities` | Fiche éditoriale d'une activité tenue (D-31). Statuts `draft`, `published`, `unpublished`. Proposition, non créée. |
| `speakers` | Intervenant réutilisable. Biographie et portrait publiables seulement avec leur autorisation. Proposition, non créée. |
| `activity_speakers` | Association plusieurs-à-plusieurs. Le nom n'est public que si `name_publication_consent` est vrai. Proposition, non créée. |
| `activity_media` | Photographies d'une activité documentée. L'original est conservé. Proposition, non créée. |
| `activity_resources` | Liens de supports, d'enregistrements, d'articles de forum ou d'autres ressources vérifiées. Proposition, non créée. |
| `newsletter_subscribers` | Abonné de la lettre (D-41). Courriel unique en minuscules, nom facultatif, langue, consentement, dates d'inscription et de désinscription. Seule l'empreinte du jeton est conservée. |
| `email_campaigns` | Envoi : enregistrement, confirmation de lettre, campagne ou publication. Le code d'accès n'y est pas copié. |
| `email_deliveries` | Destinataire, groupe, clé d'idempotence, état `pending`, `sent` ou `failed`, erreur courte et identifiant fournisseur. |

Les dates prévues de D-30 restent dans le contenu versionné du calendrier (D-11). Elles ne sont pas des colonnes de `program_phases`. À la migration, six lignes seront insérées, une par clé, toutes en `upcoming`, sans date réelle. Tant que cette migration n'est pas demandée, aucune ligne n'existe et le site laisse les six phases à venir. Aucune ligne n'est insérée pour fabriquer des séances. Créer une activité pour le 23 novembre, le 24 novembre ou le 18 décembre 2026 ne doit pas inventer minuit pour remplir `starts_at`. Une période de plusieurs jours, du 9 au 21 novembre, du 25 au 29 novembre, du 30 novembre au 13 décembre ou du 14 au 17 décembre, n'est pas non plus un horodatage unique. Le type `publication` ne sert pas à publier automatiquement les résultats.

Champs explicitement absents tant que l'hypothèse correspondante n'est pas acceptée :

| Champ envisagé | Hypothèse | Décision actuelle |
| --- | --- | --- |
| Téléphone, organisation, profil d'activité | A-03 | Non créés |
| Intérêts d'activités | D-23 | Non repris. Les sessions et l'atelier sont sur Luma |
| `primary_theme` | A-14 | Non créé |
| Fichier d'article | D-19 | Non créé. L'article est `team_articles.url` |
| Note de jury, grille, pondération | D-38 | Non créées. Google Sheets reste hors base |
| Table d'import Sheets | D-38 | Non créée tant que la synchronisation n'est pas demandée |
| Mot de passe Cardano Forum | D-14 | Non créé, ni en colonne ni en journal |
| Compte forum partagé d'équipe | D-15 | Non créé |
| Compte `auth.users` par membre | D-03 | Non créé. Seul le responsable reçoit un défi d'accès |

## Table conditionnelle A-08

Non créée. L'hypothèse d'un formulaire public n'est pas approuvée. Si elle l'est plus tard, D-28 impose la table ci-dessous et un écran d'administration pour lire, marquer comme lu et conserver les messages. Aucune politique ne les rend publics.

```sql
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  sender_name text not null check (char_length(btrim(sender_name)) between 1 and 120),
  email text not null check (
    email = lower(email)
    and char_length(email) <= 254
    and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  locale text not null check (locale in ('fr', 'en')),
  message text not null check (char_length(btrim(message)) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);
```

Cette table n'a pas d'export dans ADM-07. Ne pas la migrer tant que A-08 n'est pas approuvée. Si elle l'est, l'écran exigé par D-28 est construit en même temps. Une consultation directe dans Supabase ne remplace pas cet écran.

## Accès

Proposition A-16.

| Acteur | Chemin |
| --- | --- |
| Visiteur | Server Action pour l'enregistrement d'une équipe (fermée tant que A-13 manque). Lecture de `public_teams`, de `program_phases`, des annonces publiées, des places 1 à 3 d'un résultat `published`, du texte de ce résultat, et des activités documentées `published`. Aucune lecture des membres, courriels, profils forum, journaux, défis d'accès, présences ou brouillons. |
| Responsable | Aucun accès SQL direct. Après un défi validé, le serveur (rôle `service_role`) lit et écrit uniquement son équipe. |
| Administrateur | Session Supabase. Les politiques RLS vérifient qu'une ligne `admin_profiles` existe pour `auth.uid()`. |
| `anon` | Aucune politique d'écriture. Lecture limitée à `public_teams` et aux contenus déjà publics. |

Politique de lecture publique, si le client serveur utilise la clé anonyme pour les annonces :

```sql
alter table public.announcements enable row level security;

create policy announcements_public_read
  on public.announcements
  for select
  to anon, authenticated
  using (
    status = 'published'
    and published_at is not null
    and published_at <= now()
  );
```

Lecture par un administrateur de sa propre ligne, sans fonction `security definer`, afin d'éviter une récursion de politiques :

```sql
alter table public.admin_profiles enable row level security;

create policy admin_profiles_self_read
  on public.admin_profiles
  for select
  to authenticated
  using (user_id = auth.uid());
```

Pour chaque autre table de gestion, la politique d'administration prend cette forme :

```sql
alter table public.teams enable row level security;

create policy teams_admin_all
  on public.teams
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.admin_profiles
      where user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.admin_profiles
      where user_id = auth.uid()
    )
  );
```

La même politique `for all` s'applique à `program_phases`, `team_members`, `team_member_forum_profiles`, `team_articles`, `article_verification_history`, `leader_access_challenges`, `team_activity_logs`, `competition_results`, `team_rankings`, `announcements`, `activities`, `attendance_records`, `documented_activities`, `speakers`, `activity_speakers`, `activity_media`, `activity_resources` et, si elle existe, `contact_messages`.

`program_phases` a en plus une lecture publique de toutes ses lignes. Elle ne contient aucune donnée personnelle.

```sql
alter table public.program_phases enable row level security;

create policy program_phases_public_read
  on public.program_phases
  for select
  to anon, authenticated
  using (true);
```

Lecture publique supplémentaire : `public_teams` ; `program_phases` ; `competition_results` lorsque `status = 'published'` ; `team_rankings` pour un résultat publié et une place entre 1 et 3 ; `documented_activities` lorsque `status = 'published'` ; médias, ressources et intervenants selon D-31. Aucune politique publique ne montre un membre, un courriel, un profil forum, un défi d'accès, un journal, une présence ou une note. `newsletter_subscribers`, `email_campaigns` et `email_deliveries` ont le RLS activé, sans politique de lecture, et les droits `public`, `anon` et `authenticated` leur sont retirés. Seule la clé de service les écrit.

`announcements` a donc deux politiques de lecture : la lecture publique des lignes publiées, et la lecture complète par un administrateur. Les brouillons ne satisfont pas la première.

Droits à resserrer dans la migration réelle :

```sql
revoke all on table public.teams from anon, authenticated;
grant select, insert, update, delete on table public.teams to authenticated;
grant select on public.public_teams to anon, authenticated;
```

Répéter le principe pour chaque table de gestion. `anon` ne reçoit un `select` que sur `public_teams`, `program_phases`, les annonces publiées, les résultats publiés, les places 1 à 3, et les lignes publiques de D-31. Les écritures publiques et l'espace du responsable passent par `service_role` après validation serveur. Les originaux du seau `activity-originals` ne sont pas lisibles par `anon`.

La sous-requête vers `admin_profiles` fonctionne parce que l'administrateur peut lire sa propre ligne. Ne pas remplacer ce modèle par une fonction `security definer` qui relit la même table sous une politique qui l'appelle.

## Ce qui reste hors de la base

- Textes de l'accueil, du programme, du calendrier, du concours et de la FAQ (D-11).
- Notice A-13, jusqu'à ce que son texte existe. Elle pourra vivre dans le contenu versionné ; une table ne se justifie pas pour un seul document.
- Statistiques de communication, partenaires et témoignages (D-05).
- Notes chiffrées et feuilles Google Sheets (D-38). Elles ne sont pas copiées dans PostgreSQL pour la première édition.
- Fichiers des articles de recherche (D-19). Seuls les liens forum sont enregistrés.
- Lauréats et places préremplis (D-22).
- Code d'accès publié sur une page publique (D-24). `access_code` reste dans `leader_access_challenges`, lisible par les organisateurs seulement.
- Mots de passe Cardano Forum et toute réponse obtenue par une API du forum (D-14).
- Comptes `auth.users` pour les membres (D-03). Le compte forum reste celui que la personne crée sur https://forum.cardano.org/.
- Secrets et sessions, déjà tenus par Supabase Auth.
- URL d'invitation WhatsApp tant qu'elle n'est pas fournie (A-20). Elle ne devient pas une table.
- Lettre d'information et formulaire public de contact (A-08).
- Activités, intervenants, photographies et ressources inventés. Aucune ligne de démonstration n'accompagne D-31.

Règles d'application, en plus des index :

- 3 à 5 membres avec `left_at` nul.
- le responsable qui envoie le formulaire est le `leader` et fait partie des membres.
- un profil forum `pending_review`, `verified` ou `mismatch` a les deux champs ; `not_provided` n'en a aucun.
- une équipe est prête lorsque tous les membres actifs ont un profil `verified`.
- une équipe inscrite (`submitted`) n'est pas une équipe qui a terminé le concours.
- le remplacement d'article pendant la période met `is_current` à faux sur l'ancienne ligne et crée une nouvelle ligne `submitted`.
- le transfert de `leader` s'écrit dans `team_activity_logs` et ne laisse jamais zéro leader actif.

## Contrôle avant migration

1. Valider D-37 et D-38. A-02, A-08, A-13, A-22 et A-23 restent ouvertes. A-01 et A-06 sont réglées par D-39. Ne pas migrer sans tâche explicite. Ne pas ouvrir d'inscription réelle sans A-13. Le code D-24 est conservé dans `leader_access_challenges` pour les organisateurs. Ne pas le publier. Ne pas publier de places sans D-26. Ne pas relier `documented_activities` à `attendance_records`. Ne pas créer `jury_records`.
2. Un projet Supabase existe et la tâche demande explicitement la migration.
3. Les politiques sont vérifiées avec un jeton anonyme, un jeton administrateur et un jeton authentifié qui n'est pas administrateur.
4. Aucune clé `service_role` n'est présente dans le client ni dans Git.
