-- P1.1 — ABK/Staartkosten uitbreiding: extra staartkosten-posten in hoofdstuk 00. Additief, idempotent.
insert into sterkcalc_visual_subcategories (category_code, code, title, sort_order, active, stabu_mapping)
select '00', v.code, v.title, v.so, true, '{}'::jsonb
from (values
  ('30','Opslag',30),
  ('31','Bouwhekken',31),
  ('32','Uitvoerder & toezicht',32),
  ('33','Algemene bouwplaatsuren',33),
  ('34','Bouwstroom',34),
  ('35','Bouwwater',35)
) as v(code, title, so)
where not exists (select 1 from sterkcalc_visual_subcategories s where s.category_code='00' and s.code=v.code);

delete from combi_components where combi_id in (select id from combis where code like 'P5-A03%');
delete from combis where code like 'P5-A03%';

insert into combis (code, naam, eenheid, category_code, subcategory_code, source, status, actief, stabu_hoofdstuk)
values
  ('P5-A030','Opslag / loods (huur)','mnd','00','30','curated','active',true,'01'),
  ('P5-A031','Bouwhekken (plaatsen + huur)','m¹','00','31','curated','active',true,'01'),
  ('P5-A032','Uitvoerder / toezicht','week','00','32','curated','active',true,'01'),
  ('P5-A033','Algemene bouwplaatsuren','week','00','33','curated','active',true,'01'),
  ('P5-A034','Bouwstroom (aansluiting + verbruik)','mnd','00','34','curated','active',true,'01'),
  ('P5-A035','Bouwwater (aansluiting + verbruik)','mnd','00','35','curated','active',true,'01');

insert into combi_components (combi_id, type, omschrijving, hoeveelheid_per_eenheid, eenheid, materiaalprijs, arbeidsprijs, materieelprijs, volgorde)
select cb.id, c.type::calc_row_type, c.oms, c.hpe, c.eenh, c.mat, c.arb, c.matl, c.vg
from (values
  ('P5-A030','materieel','Opslagcontainer/loods huur',1,'mnd',0,0,350,0),
  ('P5-A031','materieel','Bouwhekken huur',1,'m¹',0,0,8,0),
  ('P5-A031','arbeid','Plaatsen en verwijderen bouwhekken',1,'m¹',0,4,0,1),
  ('P5-A032','arbeid','Uitvoerder/toezicht',1,'week',0,1600,0,0),
  ('P5-A033','arbeid','Algemene bouwplaatsuren (intern transport, opruimen)',1,'week',0,600,0,0),
  ('P5-A034','materieel','Bouwstroom aansluiting + verbruik',1,'mnd',0,0,180,0),
  ('P5-A035','materieel','Bouwwater aansluiting + verbruik',1,'mnd',0,0,90,0)
) as c(combicode, type, oms, hpe, eenh, mat, arb, matl, vg)
join combis cb on cb.code = c.combicode;
