-- P2.2 — Brandcompartiment: brandmeldinstallatie, vluchtroute-aanduiding, woningscheidende vloer.
insert into sterkcalc_visual_subcategories (category_code, code, title, sort_order, active, stabu_mapping)
select '29','16','Woningscheidende vloer',16,true,'{}'::jsonb
where not exists (select 1 from sterkcalc_visual_subcategories s where s.category_code='29' and s.code='16');

delete from combi_components where combi_id in (select id from combis where code like 'P5-B9%');
delete from combis where code like 'P5-B9%';

insert into combis (code, naam, eenheid, category_code, subcategory_code, source, status, actief, stabu_hoofdstuk)
values
  ('P5-B907','Brandmeldinstallatie (per woning/zone)','pst','29','07','curated','active',true,'26'),
  ('P5-B909','Vluchtroute-aanduiding','st','29','09','curated','active',true,'26'),
  ('P5-B916','Woningscheidende vloer (brand + geluid)','m²','29','16','curated','active',true,'26');

insert into combi_components (combi_id, type, omschrijving, hoeveelheid_per_eenheid, eenheid, materiaalprijs, arbeidsprijs, materieelprijs, volgorde)
select cb.id, c.type::calc_row_type, c.oms, c.hpe, c.eenh, c.mat, c.arb, c.matl, c.vg
from (values
  ('P5-B907','materiaal','Brandmeldcentrale + detectie',1,'pst',800,0,0,0),
  ('P5-B907','arbeid','Aanleg + inregelen',1,'pst',0,400,0,1),
  ('P5-B909','materiaal','Vluchtroutebord/pictogram',1,'st',35,0,0,0),
  ('P5-B909','arbeid','Monteren',1,'st',0,20,0,1),
  ('P5-B916','materiaal','Zwevende dekvloer + isolatie (brand/geluid)',1,'m²',45,0,0,0),
  ('P5-B916','arbeid','Aanbrengen',1,'m²',0,25,0,1)
) as c(combicode, type, oms, hpe, eenh, mat, arb, matl, vg)
join combis cb on cb.code = c.combicode;
