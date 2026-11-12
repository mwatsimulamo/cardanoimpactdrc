-- Classeur original des résultats complets. Le site ne lit pas son contenu.

alter table public.competition_results
  add column if not exists workbook_name text not null default '',
  add column if not exists workbook_type text not null default '',
  add column if not exists workbook_data text not null default '';
