-- Calendrier officiel D-42 : sept étapes, statuts d'inscription inclus.
-- Conserve les lignes existantes utiles, retire les anciennes clés D-30.

alter table public.program_phases drop constraint if exists program_phases_phase_key_check;
alter table public.program_phases drop constraint if exists program_phases_status_check;

update public.program_phases set phase_key = 'closing' where phase_key = 'workshop';
update public.program_phases set phase_key = 'sessions_signup' where phase_key = 'launch';

delete from public.program_phases
where phase_key not in (
  'sessions_signup',
  'training',
  'workshop_signup',
  'teams',
  'competition',
  'jury',
  'closing'
);

alter table public.program_phases
  add constraint program_phases_phase_key_check check (
    phase_key in (
      'sessions_signup',
      'training',
      'workshop_signup',
      'teams',
      'competition',
      'jury',
      'closing'
    )
  );

alter table public.program_phases
  add constraint program_phases_status_check check (
    status in ('upcoming', 'open', 'current', 'done', 'closed', 'postponed')
  );

insert into public.program_phases (phase_key, status)
values
  ('sessions_signup', 'upcoming'),
  ('training', 'upcoming'),
  ('workshop_signup', 'upcoming'),
  ('teams', 'upcoming'),
  ('competition', 'upcoming'),
  ('jury', 'upcoming'),
  ('closing', 'upcoming')
on conflict (phase_key) do nothing;
