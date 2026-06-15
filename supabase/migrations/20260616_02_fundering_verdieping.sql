-- P1.2 — FunderingModel verdieping: bronbemaling, grondverbetering, werkvloer, verdichting,
-- betontransport/pomp en betonsoort-meerprijs. Additief, idempotent.
insert into sterkcalc_visual_subcategories (category_code, code, title, sort_order, active, stabu_mapping)
select v.cat, v.code, v.title, v.so, true, '{}'::jsonb
from (values
  ('03','16','Bronbemaling',16),
  ('04','16','Werkvloer',16),
  ('04','17','Betontransport & pomp',17),
  ('04','18','Betonsoort-meerprijs',18)
) as v(cat, code, title, so)
where not exists (select 1 from sterkcalc_visual_subcategories s where s.category_code=v.cat and s.code=v.code);

delete from combi_components where combi_id in (select id from combis where code like 'P5-F3%' or code like 'P5-F4%');
delete from combis where code like 'P5-F3%' or code like 'P5-F4%';

insert into combis (code, naam, eenheid, category_code, subcategory_code, source, status, actief, stabu_hoofdstuk)
values
  ('P5-F307','Grondverbetering (cunet + zandaanvulling)','m³','03','07','curated','active',true,'16'),
  ('P5-F311','Verdichten (trillen/walsen)','m²','03','11','curated','active',true,'16'),
  ('P5-F316','Bronbemaling (incl. monitoring)','week','03','16','curated','active',true,'16'),
  ('P5-F416','Werkvloer (schraal beton)','m²','04','16','curated','active',true,'17'),
  ('P5-F417','Betonpomp + transport','m³','04','17','curated','active',true,'17'),
  ('P5-F418','Betonsoort-meerprijs','m³','04','18','curated','active',true,'17');

insert into combi_components (combi_id, type, omschrijving, hoeveelheid_per_eenheid, eenheid, materiaalprijs, arbeidsprijs, materieelprijs, volgorde)
select cb.id, c.type::calc_row_type, c.oms, c.hpe, c.eenh, c.mat, c.arb, c.matl, c.vg
from (values
  ('P5-F307','materiaal','Zand/menggranulaat',1,'m³',22,0,0,0),
  ('P5-F307','materieel','Aanbrengen/profileren',1,'m³',0,0,8,1),
  ('P5-F311','arbeid','Verdichten',1,'m²',0,2,0,0),
  ('P5-F311','materieel','Trilplaat/wals',1,'m²',0,0,1.5,1),
  ('P5-F316','materieel','Bemalingsinstallatie (huur + pompen)',1,'week',0,0,450,0),
  ('P5-F316','arbeid','Plaatsen, monitoren, verwijderen',1,'week',0,150,0,1),
  ('P5-F416','materiaal','Schraal beton werkvloer',1,'m²',9,0,0,0),
  ('P5-F416','arbeid','Storten/afwerken werkvloer',1,'m²',0,7,0,1),
  ('P5-F417','materieel','Betonpomp + transport',1,'m³',0,0,35,0),
  ('P5-F418','materiaal','Meerprijs hogere betonsterkte (per stap)',1,'m³',12,0,0,0)
) as c(combicode, type, oms, hpe, eenh, mat, arb, matl, vg)
join combis cb on cb.code = c.combicode;
