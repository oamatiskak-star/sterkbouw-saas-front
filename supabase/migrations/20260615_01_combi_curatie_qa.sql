-- QA-remediatie (Canonical QA Sprint): base-combi dumps verbergen + scenario-curatie.
-- Audit-bevinding: de 480 base-combi's (source=stabu_mapping) waren 32 hoofdstuk-dumps
-- × 15 duplicaten met identieke componentensets en foute eenheid (bv. €42.500 "per m²").
-- Geen nieuwe engine; puur datacuratie. Realistische NL-richtprijzen (excl. btw), hoeveelheid_per_eenheid=1.
-- Reeds toegepast op pmovaz-prod.

-- 1) Verberg de 480 hoofdstuk-dumps.
update public.combis set actief=false, status='draft' where source='stabu_mapping';

-- 2) Promoot de 8 correcte handmatige combi's naar hun subcategorie (worden zichtbaar in de keten).
update public.combis set source='curated', status='active', actief=true, category_code=v.cc, subcategory_code=v.sc
from (values
  ('Badkamer compleet','27','02'),
  ('Stucwerk wand + plafond','21','01'),
  ('Begane grondvloer beton + isolatie','04','04'),
  ('Spouwmuur compleet','08','01'),
  ('Hellend dak pannen compleet','12','04'),
  ('Buitenkozijn incl. HR++ beglazing','14','01'),
  ('CV-installatie woning','28','01'),
  ('Terreinverharding compleet','30','01')
) as v(naam, cc, sc)
where public.combis.naam = v.naam;

-- 3) Nieuwe curated combi's (correcte eenheid + scenario-dekking badkamer/nieuwbouw/renovatie/appartement).
insert into public.combis (code, naam, eenheid, category_code, subcategory_code, source, status, actief) values
  ('CUR-0201','Complete sloop (casco strippen)','m²','02','01','curated','active',true),
  ('CUR-0203','Binnenwanden slopen','m²','02','03','curated','active',true),
  ('CUR-0206','Tegelwerk verwijderen','m²','02','06','curated','active',true),
  ('CUR-0214','Puin afvoeren (container)','m³','02','14','curated','active',true),
  ('CUR-0207','Badkamer slopen','m²','02','07','curated','active',true),
  ('CUR-0401','Strokenfundering (beton + wapening)','m¹','04','01','curated','active',true),
  ('CUR-0901','Buitenmetselwerk (baksteen)','m²','09','01','curated','active',true),
  ('CUR-1101','Kapconstructie (houten gordingen)','m²','11','01','curated','active',true),
  ('CUR-1202','Plat dak EPDM + isolatie','m²','12','02','curated','active',true),
  ('CUR-1404','Binnendeur (kozijn + deur + beslag)','st','14','04','curated','active',true),
  ('CUR-1702','Metalstud scheidingswand (dubbel beplaat)','m²','17','02','curated','active',true),
  ('CUR-1901','Zandcement dekvloer','m²','19','01','curated','active',true),
  ('CUR-2001','Wandtegels (incl. lijm + voeg)','m²','20','01','curated','active',true),
  ('CUR-2002','Vloertegels (incl. lijm + voeg)','m²','20','02','curated','active',true),
  ('CUR-2102','Plafondstucwerk','m²','21','02','curated','active',true),
  ('CUR-2206','Wanden sausklaar + sauzen','m²','22','06','curated','active',true),
  ('CUR-2503','Wandcontactdoos (incl. bedrading)','st','25','03','curated','active',true),
  ('CUR-2505','Lichtpunt (incl. bedrading)','st','25','05','curated','active',true),
  ('CUR-2601','Mechanische ventilatie (box + kanalen)','st','26','01','curated','active',true),
  ('CUR-2602','WTW-installatie (incl. kanalen)','st','26','02','curated','active',true),
  ('CUR-2701','Toilet (hangend, inbouwreservoir)','st','27','01','curated','active',true),
  ('CUR-2703','Douche compleet (set + glaswand)','st','27','03','curated','active',true),
  ('CUR-2704','Wastafel met kraan','st','27','04','curated','active',true),
  ('CUR-2802','Warmtepomp lucht-water (incl. plaatsing)','st','28','02','curated','active',true),
  ('CUR-2803','Radiator (incl. montage)','st','28','03','curated','active',true),
  ('CUR-2804','Vloerverwarming (nat systeem)','m²','28','04','curated','active',true),
  ('CUR-3202','Rioolleiding PVC','m¹','32','02','curated','active',true);

-- 4) Componenten per curated combi (hoeveelheid_per_eenheid=1).
insert into public.combi_components (combi_id, type, omschrijving, eenheid, hoeveelheid_per_eenheid, materiaalprijs, arbeidsprijs, materieelprijs, volgorde)
select c.id, v.type::calc_row_type, v.oms, c.eenheid, 1, v.mat, v.arb, v.mtl, v.vg
from public.combis c
join (values
  ('CUR-0201','arbeid','Sloopwerk casco',0,28,0,0),
  ('CUR-0201','materieel','Afvoer puin',0,0,12,1),
  ('CUR-0203','arbeid','Slopen binnenwand',0,14,0,0),
  ('CUR-0203','materieel','Afvoer',0,0,6,1),
  ('CUR-0206','arbeid','Tegels verwijderen',0,16,0,0),
  ('CUR-0206','materieel','Afvoer',0,0,4,1),
  ('CUR-0214','materieel','Container + afvoer',0,0,45,0),
  ('CUR-0207','arbeid','Badkamer strippen',0,35,0,0),
  ('CUR-0207','materieel','Afvoer',0,0,12,1),
  ('CUR-0401','materiaal','Beton + wapening',120,0,0,0),
  ('CUR-0401','arbeid','Storten + vlechten',0,90,0,1),
  ('CUR-0901','materiaal','Baksteen + mortel',55,0,0,0),
  ('CUR-0901','arbeid','Metselen',0,75,0,1),
  ('CUR-1101','materiaal','Constructiehout',60,0,0,0),
  ('CUR-1101','arbeid','Timmerwerk kap',0,55,0,1),
  ('CUR-1202','materiaal','EPDM + isolatie',45,0,0,0),
  ('CUR-1202','arbeid','Aanbrengen dakbedekking',0,35,0,1),
  ('CUR-1404','materiaal','Deur + kozijn + beslag',280,0,0,0),
  ('CUR-1404','arbeid','Montage',0,120,0,1),
  ('CUR-1702','materiaal','Metalstud + gipsplaat',28,0,0,0),
  ('CUR-1702','arbeid','Stellen + beplaten',0,27,0,1),
  ('CUR-1901','materiaal','Zand-cement',12,0,0,0),
  ('CUR-1901','arbeid','Aanbrengen dekvloer',0,13,0,1),
  ('CUR-2001','materiaal','Wandtegel + lijm + voeg',41,0,0,0),
  ('CUR-2001','arbeid','Tegelzetten wand',0,50,0,1),
  ('CUR-2002','materiaal','Vloertegel + lijm + voeg',45,0,0,0),
  ('CUR-2002','arbeid','Tegelzetten vloer',0,50,0,1),
  ('CUR-2102','materiaal','Stucmortel',6,0,0,0),
  ('CUR-2102','arbeid','Plafond stucen',0,22,0,1),
  ('CUR-2206','materiaal','Sausklaar + muurverf',3,0,0,0),
  ('CUR-2206','arbeid','Sauzen',0,9,0,1),
  ('CUR-2503','materiaal','Wcd + bedrading',20,0,0,0),
  ('CUR-2503','arbeid','Aanleg',0,40,0,1),
  ('CUR-2505','materiaal','Lichtpunt + bedrading',25,0,0,0),
  ('CUR-2505','arbeid','Aanleg',0,45,0,1),
  ('CUR-2601','materiaal','Ventilatiebox + kanalen',650,0,0,0),
  ('CUR-2601','arbeid','Installatie',0,700,0,1),
  ('CUR-2602','materiaal','WTW-unit + kanalen',2200,0,0,0),
  ('CUR-2602','arbeid','Installatie',0,1100,0,1),
  ('CUR-2701','materiaal','Hangtoilet + reservoir',450,0,0,0),
  ('CUR-2701','arbeid','Montage',0,350,0,1),
  ('CUR-2703','materiaal','Doucheset + glaswand',1200,0,0,0),
  ('CUR-2703','arbeid','Montage',0,600,0,1),
  ('CUR-2704','materiaal','Wastafel + kraan',350,0,0,0),
  ('CUR-2704','arbeid','Montage',0,250,0,1),
  ('CUR-2802','materiaal','Warmtepomp lucht-water',6500,0,0,0),
  ('CUR-2802','arbeid','Plaatsing + aansluiten',0,1500,0,1),
  ('CUR-2803','materiaal','Radiator',180,0,0,0),
  ('CUR-2803','arbeid','Montage',0,90,0,1),
  ('CUR-2804','materiaal','Vloerverwarmingsbuis + verdeler',25,0,0,0),
  ('CUR-2804','arbeid','Aanleg',0,20,0,1),
  ('CUR-3202','materiaal','PVC buis + fittingen',14,0,0,0),
  ('CUR-3202','arbeid','Aanleg',0,26,0,1)
) as v(code, type, oms, mat, arb, mtl, vg)
on c.code = v.code and c.source='curated';

-- 5) Koppel curated/gepromote combi's aan hun bouwdeel (join op category+subcategory; idempotent).
insert into public.bouwdeel_combis (bouwdeel_id, combi_id, volgorde)
select b.id, k.id, 1
from public.combis k
join public.bouwdelen b on b.category_code=k.category_code and b.subcategory_code=k.subcategory_code
where k.source='curated' and k.actief=true
  and not exists (select 1 from public.bouwdeel_combis bc where bc.bouwdeel_id=b.id and bc.combi_id=k.id);
