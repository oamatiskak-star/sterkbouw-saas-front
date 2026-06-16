-- P1.3 — StaalconstructieModel: extra staalposten. Additief, idempotent.
insert into sterkcalc_visual_subcategories (category_code, code, title, sort_order, active, stabu_mapping)
select '07', v.code, v.title, v.so, true, '{}'::jsonb
from (values
  ('16','Windverbanden',16),
  ('17','Brandwerende behandeling',17),
  ('18','Raveling',18)
) as v(code, title, so)
where not exists (select 1 from sterkcalc_visual_subcategories s where s.category_code='07' and s.code=v.code);

delete from combi_components where combi_id in (select id from combis where code like 'P5-S7%');
delete from combis where code like 'P5-S7%';

insert into combis (code, naam, eenheid, category_code, subcategory_code, source, status, actief, stabu_hoofdstuk)
values
  ('P5-S704','Stalen portaal','st','07','04','curated','active',true,'26'),
  ('P5-S713','Montage staalconstructie','ton','07','13','curated','active',true,'26'),
  ('P5-S715','Hijswerk staalconstructie (kraan)','dag','07','15','curated','active',true,'26'),
  ('P5-S716','Windverband','st','07','16','curated','active',true,'26'),
  ('P5-S717','Brandwerende coating staal','m²','07','17','curated','active',true,'26'),
  ('P5-S718','Raveling (sparing/uitwisseling)','st','07','18','curated','active',true,'26');

insert into combi_components (combi_id, type, omschrijving, hoeveelheid_per_eenheid, eenheid, materiaalprijs, arbeidsprijs, materieelprijs, volgorde)
select cb.id, c.type::calc_row_type, c.oms, c.hpe, c.eenh, c.mat, c.arb, c.matl, c.vg
from (values
  ('P5-S704','materiaal','Staalportaal (geprefabriceerd)',1,'st',1800,0,0,0),
  ('P5-S704','arbeid','Stellen en verbinden',1,'st',0,400,0,1),
  ('P5-S713','arbeid','Monteren staalconstructie',1,'ton',0,180,0,0),
  ('P5-S713','materieel','Materieel montage',1,'ton',0,0,220,1),
  ('P5-S715','materieel','Mobiele kraan',1,'dag',0,0,720,0),
  ('P5-S715','arbeid','Machinist/aanpikken',1,'dag',0,130,0,1),
  ('P5-S716','materiaal','Windverband (staaf + verbindingen)',1,'st',180,0,0,0),
  ('P5-S716','arbeid','Monteren windverband',1,'st',0,90,0,1),
  ('P5-S717','materiaal','Intumescerende brandwerende coating',1,'m²',28,0,0,0),
  ('P5-S717','arbeid','Aanbrengen coating',1,'m²',0,14,0,1),
  ('P5-S718','materiaal','Raveling (stalen omtimmering sparing)',1,'st',240,0,0,0),
  ('P5-S718','arbeid','Aanbrengen raveling',1,'st',0,120,0,1)
) as c(combicode, type, oms, hpe, eenh, mat, arb, matl, vg)
join combis cb on cb.code = c.combicode;
