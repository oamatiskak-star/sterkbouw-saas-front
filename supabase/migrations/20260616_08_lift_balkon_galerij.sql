-- P5.1 — Lift/Balkon/Galerij: appartementen-voorzieningen. Additief, idempotent.
insert into sterkcalc_visual_subcategories (category_code, code, title, sort_order, active, stabu_mapping)
select v.cat, v.code, v.title, v.so, true, '{}'::jsonb
from (values
  ('24','16','Lift',16),
  ('06','16','Balkons',16),
  ('06','17','Galerijen',17)
) as v(cat, code, title, so)
where not exists (select 1 from sterkcalc_visual_subcategories s where s.category_code=v.cat and s.code=v.code);

delete from combi_components where combi_id in (select id from combis where code in ('P5-LIFT','P5-BALK','P5-GAL'));
delete from combis where code in ('P5-LIFT','P5-BALK','P5-GAL');

insert into combis (code, naam, eenheid, category_code, subcategory_code, source, status, actief, stabu_hoofdstuk)
values
  ('P5-LIFT','Personenlift (incl. put + montage)','st','24','16','curated','active',true,'75'),
  ('P5-BALK','Prefab betonbalkon (incl. hijsen)','st','06','16','curated','active',true,'21'),
  ('P5-GAL','Galerijvloer (beton, per m²)','m²','06','17','curated','active',true,'21');

insert into combi_components (combi_id, type, omschrijving, hoeveelheid_per_eenheid, eenheid, materiaalprijs, arbeidsprijs, materieelprijs, volgorde)
select cb.id, c.type::calc_row_type, c.oms, c.hpe, c.eenh, c.mat, c.arb, c.matl, c.vg
from (values
  ('P5-LIFT','materiaal','Personenlift (kooi, machinerie, put)',1,'st',28000,0,0,0),
  ('P5-LIFT','arbeid','Montage + inbedrijfstelling',1,'st',0,4000,0,1),
  ('P5-BALK','materiaal','Prefab betonbalkon',1,'st',1800,0,0,0),
  ('P5-BALK','arbeid','Stellen + verankeren',1,'st',0,350,0,1),
  ('P5-BALK','materieel','Hijswerk',1,'st',0,0,200,2),
  ('P5-GAL','materiaal','Galerij betonvloer + leuning',1,'m²',180,0,0,0),
  ('P5-GAL','arbeid','Stellen/storten + afwerken',1,'m²',0,60,0,1)
) as c(combicode, type, oms, hpe, eenh, mat, arb, matl, vg)
join combis cb on cb.code = c.combicode;
