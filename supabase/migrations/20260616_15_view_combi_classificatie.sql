-- Read-only overlay: combi → NL-SfB-classificatie (uit de harvest-laag).
-- Front-end leest deze view (anon); harvest.* zelf blijft afgeschermd (view draait met owner-rechten).
-- Toegepast op pmovaz-prod 2026-06-16 (mirror van apply_migration 20260616_15).
create or replace view public.v_combi_nlsfb as
select distinct l.core_ref as combi_code, s.code as nlsfb_code, s.naam as nlsfb_naam
from harvest.links l
join harvest.staging s on s.id = l.staging_id and s.classification = 'nlsfb'
where l.core_type = 'combi';

grant select on public.v_combi_nlsfb to anon, authenticated;
