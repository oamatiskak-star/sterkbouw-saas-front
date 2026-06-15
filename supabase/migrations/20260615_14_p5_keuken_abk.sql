-- P5-E + P5-F: Keuken als eigen hoofdstuk (K0) + Hoofdstuk 00 ABK/staartkosten met combi-dekking.
-- Additief, idempotent. Geen mock: curated combis met reële NL-componenten.

-- ============ P5-E: KEUKEN CATEGORIE K0 ============
insert into sterkcalc_visual_categories (code, title, subtitle, sort_order, active, stabu_mapping)
select 'K0', 'Keuken', 'Keukenblok, apparatuur, werkblad, sanitair', 271, true, '{}'::jsonb
where not exists (select 1 from sterkcalc_visual_categories where code='K0');

insert into sterkcalc_visual_subcategories (category_code, code, title, sort_order, active, stabu_mapping)
select v.category_code, v.code, v.title, v.so, true, '{}'::jsonb
from (values
  ('K0','01','Keukenblok',1),
  ('K0','02','Apparatuur',2),
  ('K0','03','Werkblad',3),
  ('K0','04','Spoelbak',4),
  ('K0','05','Kranen',5)
) as v(category_code, code, title, so)
where not exists (
  select 1 from sterkcalc_visual_subcategories s
  where s.category_code=v.category_code and s.code=v.code
);

update combis set category_code='K0', subcategory_code='01', updated_at=now()
where code in ('CUR-2051','CUR-2052','CUR-2053');

-- ============ P5-F: HOOFDSTUK 00 ABK/STAARTKOSTEN SUBCATEGORIEËN ============
insert into sterkcalc_visual_subcategories (category_code, code, title, sort_order, active, stabu_mapping)
select '00', v.code, v.title, v.so, true, '{}'::jsonb
from (values
  ('20','Bouwplaatsinrichting',20),
  ('21','Ketenpark',21),
  ('22','Steigers',22),
  ('23','Afvalverwerking',23),
  ('24','Kraan & hijswerk',24),
  ('25','Veiligheidsvoorzieningen',25),
  ('26','KAM (kwaliteit, arbo, milieu)',26),
  ('27','Oplevering',27),
  ('28','Schoonmaak',28),
  ('29','Tijdelijke voorzieningen',29)
) as v(code, title, so)
where not exists (
  select 1 from sterkcalc_visual_subcategories s
  where s.category_code='00' and s.code=v.code
);

-- ============ COMBIS (idempotent) ============
delete from combi_components where combi_id in (select id from combis where code like 'P5-%');
delete from combis where code like 'P5-%';

insert into combis (code, naam, eenheid, category_code, subcategory_code, source, status, actief, stabu_hoofdstuk)
values
  ('P5-K002','Inbouwapparatuur set (oven, kookplaat, afzuigkap, koelkast, vaatwasser)','st','K0','02','curated','active',true,'72'),
  ('P5-K003','Keukenwerkblad composiet incl. montage','m','K0','03','curated','active',true,'72'),
  ('P5-K004','Spoelbak RVS incl. montage','st','K0','04','curated','active',true,'72'),
  ('P5-K005','Keukenkraan incl. montage','st','K0','05','curated','active',true,'72'),
  ('P5-A020','Bouwplaatsinrichting','pst','00','20','curated','active',true,'01'),
  ('P5-A021','Ketenpark (schaft/kantoor/sanitair) huur','mnd','00','21','curated','active',true,'01'),
  ('P5-A022','Gevelsteiger (plaatsen, huur, demonteren)','m²','00','22','curated','active',true,'01'),
  ('P5-A023','Afvalcontainer incl. afvoer en verwerking','st','00','23','curated','active',true,'01'),
  ('P5-A024','Mobiele kraan incl. machinist','dag','00','24','curated','active',true,'01'),
  ('P5-A025','Veiligheidsvoorzieningen & PBM','pst','00','25','curated','active',true,'01'),
  ('P5-A026','KAM (kwaliteit, arbo, milieu)','pst','00','26','curated','active',true,'01'),
  ('P5-A027','Oplevering & opleverdossier','pst','00','27','curated','active',true,'01'),
  ('P5-A028','Bouwschoonmaak','m²','00','28','curated','active',true,'01'),
  ('P5-A029','Tijdelijke nutsvoorzieningen (water/elektra)','pst','00','29','curated','active',true,'01');

insert into combi_components (combi_id, type, omschrijving, hoeveelheid_per_eenheid, eenheid, materiaalprijs, arbeidsprijs, materieelprijs, volgorde)
select cb.id, c.type::calc_row_type, c.oms, c.hpe, c.eenh, c.mat, c.arb, c.matl, c.vg
from (values
  ('P5-K002','materiaal','Inbouwapparatuur (set)',1,'st',3500,0,0,0),
  ('P5-K002','arbeid','Inbouw + aansluiten apparatuur',1,'st',0,350,0,1),
  ('P5-K003','materiaal','Composiet werkblad op maat',1,'m',320,0,0,0),
  ('P5-K003','arbeid','Inmeten, zagen en monteren',1,'m',0,60,0,1),
  ('P5-K004','materiaal','RVS spoelbak + sifon',1,'st',180,0,0,0),
  ('P5-K004','arbeid','Inbouw en aansluiten',1,'st',0,90,0,1),
  ('P5-K005','materiaal','Keukenmengkraan',1,'st',220,0,0,0),
  ('P5-K005','arbeid','Montage en aansluiten',1,'st',0,70,0,1),
  ('P5-A020','materiaal','Inrichtingsmateriaal (hekwerk, borden, verharding)',1,'pst',800,0,0,0),
  ('P5-A020','arbeid','Inrichten en opruimen bouwplaats',1,'pst',0,1200,0,1),
  ('P5-A020','materieel','Aan-/afvoer materieel',1,'pst',0,0,600,2),
  ('P5-A021','materieel','Huur keten + nutsaansluiting',1,'mnd',0,0,650,0),
  ('P5-A022','materieel','Steigerhuur',1,'m²',0,0,12,0),
  ('P5-A022','arbeid','Plaatsen en demonteren steiger',1,'m²',0,6,0,1),
  ('P5-A023','materieel','Containerhuur + stortkosten',1,'st',0,0,280,0),
  ('P5-A024','materieel','Mobiele kraan dagdeel',1,'dag',0,0,720,0),
  ('P5-A024','arbeid','Machinist',1,'dag',0,130,0,1),
  ('P5-A025','materiaal','PBM, valbeveiliging, signalering',1,'pst',450,0,0,0),
  ('P5-A025','arbeid','Opbouw veiligheidsvoorzieningen',1,'pst',0,200,0,1),
  ('P5-A026','arbeid','KAM-coördinatie en keuringen',1,'pst',0,1500,0,0),
  ('P5-A027','arbeid','Oplevering, restpunten en dossier',1,'pst',0,900,0,0),
  ('P5-A028','arbeid','Bouwschoonmaak',1,'m²',0,4.5,0,0),
  ('P5-A028','materiaal','Schoonmaakmiddelen',1,'m²',0.5,0,0,1),
  ('P5-A029','materiaal','Tijdelijke bekabeling/leidingen',1,'pst',600,0,0,0),
  ('P5-A029','materieel','Aggregaat/waterpunt huur',1,'pst',0,0,300,1)
) as c(combicode, type, oms, hpe, eenh, mat, arb, matl, vg)
join combis cb on cb.code = c.combicode;
