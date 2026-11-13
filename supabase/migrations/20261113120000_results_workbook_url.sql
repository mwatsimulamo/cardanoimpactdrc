-- Lien Google Sheet optionnel pour les résultats totaux (D-38).
-- Alternative au fichier .xls/.xlsx : le site n'importe ni les lignes ni les notes.

alter table public.competition_results
  add column if not exists workbook_url text not null default '';
