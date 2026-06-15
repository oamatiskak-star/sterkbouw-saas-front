-- P3 Batch 3 — Installaties. Gecureerd, C3-prefix, eigen componenten, correcte eenheid, NL-richtprijzen.
-- Reeds toegepast op pmovaz-prod. Idempotent.
insert into public.combis (code, naam, eenheid, category_code, subcategory_code, source, status, actief) values
  ('C3-2506','Kabelgoten','m¹','25','06','curated','active',true),
  ('C3-2507','Leidingen elektra','m¹','25','07','curated','active',true),
  ('C3-2508','Aarding','st','25','08','curated','active',true),
  ('C3-2510','Domotica (basis)','st','25','10','curated','active',true),
  ('C3-2512','Laadpaal voorbereiding','st','25','12','curated','active',true),
  ('C3-2513','Noodverlichting','st','25','13','curated','active',true),
  ('C3-2514','Brandmelder','st','25','14','curated','active',true),
  ('C3-2515','Keuring elektra','st','25','15','curated','active',true),
  ('C3-2406','Doorvoeren','st','24','06','curated','active',true),
  ('C3-2407','Mantelbuizen','m¹','24','07','curated','active',true),
  ('C3-2408','Technische ruimte inrichten','st','24','08','curated','active',true),
  ('C3-2412','Isolatie leidingen','m¹','24','12','curated','active',true),
  ('C3-2413','Appendages','st','24','13','curated','active',true),
  ('C3-2414','Inregelen installatie','st','24','14','curated','active',true),
  ('C3-3203','Kolken','st','32','03','curated','active',true),
  ('C3-3205','Inspectieputten','st','32','05','curated','active',true),
  ('C3-3211','Vuilwaterafvoer','m¹','32','11','curated','active',true),
  ('C3-3213','Ontstoppingspunten','st','32','13','curated','active',true),
  ('C3-2605','Dakdoorvoer ventilatie','st','26','05','curated','active',true),
  ('C3-2610','Ventilatiebox','st','26','10','curated','active',true),
  ('C3-2611','CO2-sturing','st','26','11','curated','active',true),
  ('C3-2612','Geluiddempers','st','26','12','curated','active',true),
  ('C3-2805','Verdelers','st','28','05','curated','active',true),
  ('C3-2807','Leidingen verwarming','m¹','28','07','curated','active',true),
  ('C3-2808','Buffervat','st','28','08','curated','active',true),
  ('C3-2811','Isolatie cv-leidingen','m¹','28','11','curated','active',true),
  ('C3-2813','Hybride systeem','st','28','13','curated','active',true),
  ('C3-2814','Warmteafgifte (convector)','st','28','14','curated','active',true),
  ('C3-2714','Leidingen sanitair','m¹','27','14','curated','active',true)
on conflict do nothing;

insert into public.combi_components (combi_id, type, omschrijving, eenheid, hoeveelheid_per_eenheid, materiaalprijs, arbeidsprijs, materieelprijs, volgorde)
select c.id, v.type::calc_row_type, v.oms, c.eenheid, 1, v.mat, v.arb, 0, v.vg
from public.combis c join (values
  ('C3-2506','materiaal','Kabelgoot',12,0,0),('C3-2506','arbeid','Monteren',0,14,1),
  ('C3-2507','materiaal','Kabel + buis',4,0,0),('C3-2507','arbeid','Aanleg',0,10,1),
  ('C3-2508','materiaal','Aardingsmateriaal',60,0,0),('C3-2508','arbeid','Aanleggen',0,90,1),
  ('C3-2510','materiaal','Domotica-set',450,0,0),('C3-2510','arbeid','Installeren',0,350,1),
  ('C3-2512','materiaal','Voorbereiding laadpunt',180,0,0),('C3-2512','arbeid','Bekabelen',0,280,1),
  ('C3-2513','materiaal','Noodverlichtingsarmatuur',85,0,0),('C3-2513','arbeid','Monteren',0,55,1),
  ('C3-2514','materiaal','Rookmelder/brandmelder',65,0,0),('C3-2514','arbeid','Monteren',0,60,1),
  ('C3-2515','materiaal','Keuringsrapport',0,0,0),('C3-2515','arbeid','Inspectie + keuring',0,350,1),
  ('C3-2406','materiaal','Doorvoer + brandwerend',25,0,0),('C3-2406','arbeid','Maken',0,35,1),
  ('C3-2407','materiaal','Mantelbuis',8,0,0),('C3-2407','arbeid','Aanleg',0,10,1),
  ('C3-2408','materiaal','Inrichting technische ruimte',350,0,0),('C3-2408','arbeid','Installeren',0,450,1),
  ('C3-2412','materiaal','Leidingisolatie',6,0,0),('C3-2412','arbeid','Aanbrengen',0,8,1),
  ('C3-2413','materiaal','Appendages',45,0,0),('C3-2413','arbeid','Monteren',0,35,1),
  ('C3-2414','materiaal','Meet/inregelmateriaal',0,0,0),('C3-2414','arbeid','Inregelen',0,280,1),
  ('C3-3203','materiaal','Straatkolk',65,0,0),('C3-3203','arbeid','Plaatsen',0,80,1),
  ('C3-3205','materiaal','Inspectieput',180,0,0),('C3-3205','arbeid','Plaatsen',0,220,1),
  ('C3-3211','materiaal','PVC vuilwaterbuis',16,0,0),('C3-3211','arbeid','Aanleg',0,26,1),
  ('C3-3213','materiaal','Ontstoppingsstuk',35,0,0),('C3-3213','arbeid','Plaatsen',0,55,1),
  ('C3-2605','materiaal','Dakdoorvoer',85,0,0),('C3-2605','arbeid','Monteren',0,95,1),
  ('C3-2610','materiaal','Ventilatiebox',450,0,0),('C3-2610','arbeid','Installeren',0,250,1),
  ('C3-2611','materiaal','CO2-sensor + sturing',180,0,0),('C3-2611','arbeid','Installeren',0,120,1),
  ('C3-2612','materiaal','Geluiddemper',65,0,0),('C3-2612','arbeid','Monteren',0,35,1),
  ('C3-2805','materiaal','Verdeler vloerverwarming',280,0,0),('C3-2805','arbeid','Monteren',0,180,1),
  ('C3-2807','materiaal','CV-leiding + fittingen',13,0,0),('C3-2807','arbeid','Aanleg',0,18,1),
  ('C3-2808','materiaal','Buffervat',650,0,0),('C3-2808','arbeid','Plaatsen + aansluiten',0,250,1),
  ('C3-2811','materiaal','Leidingisolatie',6,0,0),('C3-2811','arbeid','Aanbrengen',0,7,1),
  ('C3-2813','materiaal','Hybride warmtepomp + ketel',3800,0,0),('C3-2813','arbeid','Installeren',0,900,1),
  ('C3-2814','materiaal','Convector',220,0,0),('C3-2814','arbeid','Monteren',0,110,1),
  ('C3-2714','materiaal','Sanitairleiding + fittingen',12,0,0),('C3-2714','arbeid','Aanleg',0,20,1)
) v(code,type,oms,mat,arb,vg) on c.code=v.code and c.source='curated';

insert into public.bouwdeel_combis (bouwdeel_id, combi_id, volgorde)
select b.id, k.id, 3 from public.combis k
join public.bouwdelen b on b.category_code=k.category_code and b.subcategory_code=k.subcategory_code
where k.code like 'C3-%'
  and not exists (select 1 from public.bouwdeel_combis bc where bc.bouwdeel_id=b.id and bc.combi_id=k.id);
