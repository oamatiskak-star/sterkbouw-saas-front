-- Combi-bibliotheek seed: 6 categorieën + 8 echte assemblies. Componentprijzen
-- komen uit public.stabu_posten (officiële catalogus) — geen mockdata. Idempotent.
insert into public.combi_categories (naam, volgorde)
select v.naam, v.vol from (values
  ('Ruwbouw',1),('Dak',2),('Gevel & Kozijnen',3),('Afbouw',4),('Installaties',5),('Buiten',6)
) as v(naam,vol)
where not exists (select 1 from public.combi_categories c where c.naam = v.naam);

insert into public.combis (code, naam, omschrijving, eenheid, category_id)
select v.code, v.naam, v.oms, v.eh, (select id from public.combi_categories where naam = v.cat limit 1)
from (values
  ('CB-SPOUW','Spouwmuur compleet','Metselwerk buitenblad + spouwisolatie + voegwerk','m²','Gevel & Kozijnen'),
  ('CB-KOZHR','Buitenkozijn incl. HR++ beglazing','Kozijn met ramen + HR++ beglazing','m²','Gevel & Kozijnen'),
  ('CB-BGVLOER','Begane grondvloer beton + isolatie','Betonvloer op zand + vloerisolatie','m²','Ruwbouw'),
  ('CB-DAKPAN','Hellend dak pannen compleet','Dakbeschot + dakisolatie + keramische pannen','m²','Dak'),
  ('CB-STUC','Stucwerk wand + plafond','Stucwerk wanden + plafond','m²','Afbouw'),
  ('CB-BADKAMER','Badkamer compleet','Sanitair + wand-/vloertegels + leidingwerk + riolering','st','Installaties'),
  ('CB-CV','CV-installatie woning','HR-ketel + radiatoren','st','Installaties'),
  ('CB-TERREIN','Terreinverharding compleet','Straatwerk klinkers + kantopsluiting','m²','Buiten')
) as v(code,naam,oms,eh,cat)
where not exists (select 1 from public.combis c where c.code = v.code);

insert into public.combi_components
  (combi_id, type, stabu_code, omschrijving, hoeveelheid_per_eenheid, eenheid, materiaalprijs, arbeidsprijs, materieelprijs, volgorde)
select cb.id, x.type::calc_row_type, x.stabu_code, sp.omschrijving, x.qty, sp.eenheid, sp.materiaalprijs, sp.arbeidsprijs, 0, x.volgorde
from (values
  ('CB-SPOUW','materiaal','22.10',1.0,0),('CB-SPOUW','materiaal','37.10',1.0,1),('CB-SPOUW','arbeid','36.10',1.0,2),
  ('CB-KOZHR','materiaal','30.10',1.0,0),('CB-KOZHR','materiaal','34.10',1.0,1),
  ('CB-BGVLOER','materiaal','21.30',1.0,0),('CB-BGVLOER','materiaal','37.30',1.0,1),
  ('CB-DAKPAN','materiaal','24.10',1.0,0),('CB-DAKPAN','materiaal','37.20',1.0,1),('CB-DAKPAN','materiaal','33.10',1.0,2),
  ('CB-STUC','materiaal','40.10',1.0,0),('CB-STUC','materiaal','40.20',1.0,1),
  ('CB-BADKAMER','materiaal','53.10',1.0,0),('CB-BADKAMER','materiaal','41.10',22.0,1),('CB-BADKAMER','materiaal','41.20',8.0,2),('CB-BADKAMER','materiaal','52.10',12.0,3),('CB-BADKAMER','materiaal','51.10',4.0,4),
  ('CB-CV','materieel','60.10',1.0,0),('CB-CV','materiaal','60.30',5.0,1),
  ('CB-TERREIN','materiaal','15.10',1.0,0),('CB-TERREIN','materiaal','15.30',0.25,1)
) as x(combi_code,type,stabu_code,qty,volgorde)
join public.combis cb on cb.code = x.combi_code
join public.stabu_posten sp on sp.code = x.stabu_code
where not exists (select 1 from public.combi_components cc where cc.combi_id = cb.id);
