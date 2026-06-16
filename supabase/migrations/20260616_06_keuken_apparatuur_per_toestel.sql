-- P3.2 — Keuken: apparatuur per toestel + kookeiland. Additief, idempotent.
insert into sterkcalc_visual_subcategories (category_code, code, title, sort_order, active, stabu_mapping)
select 'K0','06','Kookeiland',6,true,'{}'::jsonb
where not exists (select 1 from sterkcalc_visual_subcategories s where s.category_code='K0' and s.code='06');

delete from combi_components where combi_id in (select id from combis where code like 'P5-K02%' or code='P5-K006');
delete from combis where code like 'P5-K02%' or code='P5-K006';

insert into combis (code, naam, eenheid, category_code, subcategory_code, source, status, actief, stabu_hoofdstuk)
values
  ('P5-K021','Inbouwoven','st','K0','02','curated','active',true,'72'),
  ('P5-K022','Inductiekookplaat','st','K0','02','curated','active',true,'72'),
  ('P5-K023','Afzuigkap (incl. kanaal)','st','K0','02','curated','active',true,'72'),
  ('P5-K024','Inbouwkoelkast','st','K0','02','curated','active',true,'72'),
  ('P5-K025','Vaatwasser','st','K0','02','curated','active',true,'72'),
  ('P5-K026','Magnetron/combi-oven','st','K0','02','curated','active',true,'72'),
  ('P5-K027','Quooker (kokendwaterkraan)','st','K0','05','curated','active',true,'72'),
  ('P5-K006','Kookeiland (cabinet + werkblad + afzuiging)','st','K0','06','curated','active',true,'72');

insert into combi_components (combi_id, type, omschrijving, hoeveelheid_per_eenheid, eenheid, materiaalprijs, arbeidsprijs, materieelprijs, volgorde)
select cb.id, c.type::calc_row_type, c.oms, c.hpe, c.eenh, c.mat, c.arb, c.matl, c.vg
from (values
  ('P5-K021','materiaal','Inbouwoven',1,'st',650,0,0,0),
  ('P5-K021','arbeid','Inbouw + aansluiten',1,'st',0,60,0,1),
  ('P5-K022','materiaal','Inductiekookplaat',1,'st',550,0,0,0),
  ('P5-K022','arbeid','Inbouw + aansluiten',1,'st',0,60,0,1),
  ('P5-K023','materiaal','Afzuigkap + kanaal',1,'st',450,0,0,0),
  ('P5-K023','arbeid','Montage + kanaal',1,'st',0,80,0,1),
  ('P5-K024','materiaal','Inbouwkoelkast',1,'st',700,0,0,0),
  ('P5-K024','arbeid','Inbouw',1,'st',0,50,0,1),
  ('P5-K025','materiaal','Vaatwasser',1,'st',550,0,0,0),
  ('P5-K025','arbeid','Inbouw + aansluiten',1,'st',0,70,0,1),
  ('P5-K026','materiaal','Magnetron/combi-oven',1,'st',300,0,0,0),
  ('P5-K026','arbeid','Inbouw',1,'st',0,40,0,1),
  ('P5-K027','materiaal','Quooker + reservoir',1,'st',1300,0,0,0),
  ('P5-K027','arbeid','Montage + aansluiten',1,'st',0,120,0,1),
  ('P5-K006','materiaal','Kookeiland (cabinet + composiet werkblad + plafondafzuiging)',1,'st',4500,0,0,0),
  ('P5-K006','arbeid','Plaatsen + aansluiten',1,'st',0,600,0,1)
) as c(combicode, type, oms, hpe, eenh, mat, arb, matl, vg)
join combis cb on cb.code = c.combicode;
