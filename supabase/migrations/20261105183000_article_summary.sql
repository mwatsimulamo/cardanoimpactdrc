-- Description courte de l'article, 300 caractères au plus.

alter table public.team_articles
  add column if not exists summary text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'team_articles_summary_len'
  ) then
    alter table public.team_articles
      add constraint team_articles_summary_len
      check (summary is null or char_length(summary) <= 300);
  end if;
end
$$;

drop view if exists public.public_team_dossiers;

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
  a.summary as article_summary,
  a.url as article_url
from public.teams t
left join public.team_articles a
  on a.team_id = t.id
 and a.is_current = true
where t.status = 'submitted';

revoke all on table public.public_team_dossiers from public, anon, authenticated;
grant select on table public.public_team_dossiers to anon, authenticated;
