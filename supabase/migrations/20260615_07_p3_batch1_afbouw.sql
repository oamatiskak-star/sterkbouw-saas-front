-- P3 Batch 1 — Renovatie/Afbouw. Gecureerde combi's (geen dumps), C3-prefix, eigen componenten,
-- correcte eenheid, realistische NL-richtprijzen (excl. btw), gekoppeld aan bestaande bouwdelen.
-- Reeds toegepast op pmovaz-prod. Idempotent (on conflict do nothing).
insert into public.combis (code, naam, eenheid, category_code, subcategory_code, source, status, actief) values
  ('C3-2707','Afvoeren sanitair','st','27','07','curated','active',true),
  ('C3-2708','Inbouwreservoir','st','27','08','curated','active',true),
  ('C3-2710','Sanitair montage (per toestel)','st','27','10','curated','active',true),
  ('C3-2711','Kitwerk sanitair','m¹','27','11','curated','active',true),
  ('C3-2712','Waterdichting (smeerfolie)','m²','27','12','curated','active',true),
  ('C3-2715','Sanitair accessoires (set)','st','27','15','curated','active',true),
  ('C3-2701A','Toilet renovatie compleet','st','27','01','curated','active',true),
  ('C3-2004','Toilet tegelwerk','m²','20','04','curated','active',true),
  ('C3-2006','Buitentegels (keramisch terras)','m²','20','06','curated','active',true),
  ('C3-2009','Voegwerk tegels','m²','20','09','curated','active',true),
  ('C3-2010','Kimband (afdichting)','m¹','20','10','curated','active',true),
  ('C3-2011','Afschotvloer douche','m²','20','11','curated','active',true),
  ('C3-2013','Tegelplinten','m¹','20','13','curated','active',true),
  ('C3-2001A','Wandtegels grootformaat (luxe)','m²','20','01','curated','active',true),
  ('C3-2002A','Vloertegels 60x60 (luxe)','m²','20','02','curated','active',true),
  ('C3-2104','Sierpleister','m²','21','04','curated','active',true),
  ('C3-2106','Pleisterwerk','m²','21','06','curated','active',true),
  ('C3-2114','Sausklaar stucen','m²','21','14','curated','active',true),
  ('C3-2202','Buiten schilderwerk','m²','22','02','curated','active',true),
  ('C3-2205','Deuren schilderen','st','22','05','curated','active',true),
  ('C3-2208','Lakwerk (hoogglans)','m²','22','08','curated','active',true),
  ('C3-1904','Houten vloer (delen)','m²','19','04','curated','active',true),
  ('C3-1906','Droogbouwvloer','m²','19','06','curated','active',true),
  ('C3-1907','Egaline','m²','19','07','curated','active',true),
  ('C3-1908','Vloerverwarming infrezen','m²','19','08','curated','active',true),
  ('C3-1910','Ondervloer (geluidsisolerend)','m²','19','10','curated','active',true),
  ('C3-1912','Tegelvloer voorbereiding','m²','19','12','curated','active',true),
  ('C3-1704','Cellenbeton binnenwand','m²','17','04','curated','active',true),
  ('C3-1709','Geluidswerende wand','m²','17','09','curated','active',true),
  ('C3-1711','Scheidingswand (systeem)','m²','17','11','curated','active',true),
  ('C3-0202','Stripwerk (casco binnen)','m²','02','02','curated','active',true),
  ('C3-0213','Beton zagen','m¹','02','13','curated','active',true),
  ('C3-0215','Asbestsanering (gecertificeerd)','m²','02','15','curated','active',true)
on conflict do nothing;

insert into public.combi_components (combi_id, type, omschrijving, eenheid, hoeveelheid_per_eenheid, materiaalprijs, arbeidsprijs, materieelprijs, volgorde)
select c.id, v.type::calc_row_type, v.oms, c.eenheid, 1, v.mat, v.arb, v.mtl, v.vg
from public.combis c join (values
  ('C3-2707','materiaal','Sifon + afvoer',45,0,0,0),('C3-2707','arbeid','Monteren',0,65,0,1),
  ('C3-2708','materiaal','Inbouwreservoir',220,0,0,0),('C3-2708','arbeid','Inbouwen',0,180,0,1),
  ('C3-2710','materiaal','Bevestiging',20,0,0,0),('C3-2710','arbeid','Monteren toestel',0,120,0,1),
  ('C3-2711','materiaal','Sanitairkit',3,0,0,0),('C3-2711','arbeid','Kitten',0,9,0,1),
  ('C3-2712','materiaal','Smeerfolie + band',12,0,0,0),('C3-2712','arbeid','Aanbrengen',0,14,0,1),
  ('C3-2715','materiaal','Accessoireset',120,0,0,0),('C3-2715','arbeid','Monteren',0,60,0,1),
  ('C3-2701A','materiaal','Hangtoilet + reservoir + tegelwerk',650,0,0,0),('C3-2701A','arbeid','Compleet plaatsen',0,450,0,1),
  ('C3-2004','materiaal','Tegel + lijm + voeg',40,0,0,0),('C3-2004','arbeid','Tegelzetten',0,55,0,1),
  ('C3-2006','materiaal','Keramische tegel + split',55,0,0,0),('C3-2006','arbeid','Leggen',0,45,0,1),
  ('C3-2009','materiaal','Voegmortel',8,0,0,0),('C3-2009','arbeid','Voegen',0,18,0,1),
  ('C3-2010','materiaal','Kimband',6,0,0,0),('C3-2010','arbeid','Aanbrengen',0,8,0,1),
  ('C3-2011','materiaal','Afschotmortel',14,0,0,0),('C3-2011','arbeid','Aanbrengen',0,22,0,1),
  ('C3-2013','materiaal','Tegelplint',8,0,0,0),('C3-2013','arbeid','Zetten',0,12,0,1),
  ('C3-2001A','materiaal','Grootformaat wandtegel + lijm',65,0,0,0),('C3-2001A','arbeid','Tegelzetten',0,60,0,1),
  ('C3-2002A','materiaal','Vloertegel 60x60 + lijm',60,0,0,0),('C3-2002A','arbeid','Tegelzetten',0,55,0,1),
  ('C3-2104','materiaal','Sierpleister',9,0,0,0),('C3-2104','arbeid','Aanbrengen',0,20,0,1),
  ('C3-2106','materiaal','Pleistermortel',7,0,0,0),('C3-2106','arbeid','Pleisteren',0,19,0,1),
  ('C3-2114','materiaal','Afwerkpleister',6,0,0,0),('C3-2114','arbeid','Sausklaar stucen',0,18,0,1),
  ('C3-2202','materiaal','Buitenverf + grond',6,0,0,0),('C3-2202','arbeid','Buiten schilderen',0,24,0,1),
  ('C3-2205','materiaal','Lak + grond',12,0,0,0),('C3-2205','arbeid','Deur schilderen',0,45,0,1),
  ('C3-2208','materiaal','Hoogglanslak',8,0,0,0),('C3-2208','arbeid','Lakwerk',0,28,0,1),
  ('C3-1904','materiaal','Houten vloerdelen',55,0,0,0),('C3-1904','arbeid','Leggen',0,35,0,1),
  ('C3-1906','materiaal','Droogbouwplaten',28,0,0,0),('C3-1906','arbeid','Aanbrengen',0,18,0,1),
  ('C3-1907','materiaal','Egalisatiemortel',8,0,0,0),('C3-1907','arbeid','Egaliseren',0,9,0,1),
  ('C3-1908','materiaal','Vloerverwarmingsbuis',18,0,0,0),('C3-1908','arbeid','Infrezen + leggen',0,16,0,1),
  ('C3-1910','materiaal','Ondervloer',12,0,0,0),('C3-1910','arbeid','Aanbrengen',0,7,0,1),
  ('C3-1912','materiaal','Voorstrijk + reparatie',10,0,0,0),('C3-1912','arbeid','Voorbereiden',0,12,0,1),
  ('C3-1704','materiaal','Cellenbeton + lijm',32,0,0,0),('C3-1704','arbeid','Stellen',0,33,0,1),
  ('C3-1709','materiaal','Geluidswerende beplating',45,0,0,0),('C3-1709','arbeid','Monteren',0,38,0,1),
  ('C3-1711','materiaal','Systeemwand',38,0,0,0),('C3-1711','arbeid','Stellen',0,30,0,1),
  ('C3-0202','arbeid','Strippen casco',0,18,0,0),('C3-0202','materieel','Afvoer',0,0,7,1),
  ('C3-0213','arbeid','Beton zagen',0,38,0,0),('C3-0213','materieel','Zaagmachine + afvoer',0,0,22,1),
  ('C3-0215','arbeid','Asbest verwijderen (gecert.)',0,45,0,0),('C3-0215','materieel','Containment + afvoer',0,0,35,1)
) v(code,type,oms,mat,arb,mtl,vg) on c.code=v.code and c.source='curated'
on conflict do nothing;

insert into public.bouwdeel_combis (bouwdeel_id, combi_id, volgorde)
select b.id, k.id, 3 from public.combis k
join public.bouwdelen b on b.category_code=k.category_code and b.subcategory_code=k.subcategory_code
where k.code like 'C3-%'
  and not exists (select 1 from public.bouwdeel_combis bc where bc.bouwdeel_id=b.id and bc.combi_id=k.id);
