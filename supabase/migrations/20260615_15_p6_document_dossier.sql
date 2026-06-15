-- P6-D: projectdossier — document_sources uitbreiden met dossier-velden. Additief.
alter table public.document_sources add column if not exists calculatie_id uuid;
alter table public.document_sources add column if not exists mime_type text;
alter table public.document_sources add column if not exists file_size bigint;
alter table public.document_sources add column if not exists page_count integer;
alter table public.document_sources add column if not exists analyse_status text default 'niet_geanalyseerd';

create index if not exists idx_document_sources_calculatie on public.document_sources(calculatie_id);
