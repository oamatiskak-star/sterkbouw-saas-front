-- P4 Werktafel UX: subhoofdstuk-niveau toevoegen (hoofdstuk → subhoofdstuk → regels/combi's).
-- Additief: parent_id (zelf-referentie; null=hoofdstuk, gevuld=subhoofdstuk) + sub_code + is_structuur.
-- Reeds toegepast op pmovaz-prod.
alter table public.werktafel_chapters add column if not exists parent_id uuid references public.werktafel_chapters(id) on delete cascade;
alter table public.werktafel_chapters add column if not exists sub_code text;
alter table public.werktafel_chapters add column if not exists is_structuur boolean not null default false;
create index if not exists idx_werktafel_chapters_parent on public.werktafel_chapters(calculatie_id, parent_id);
