-- P3 Batch 5 — Terrein/Buiten. Gecureerd, C3-prefix, eigen componenten, correcte eenheid, NL-richtprijzen.
-- Reeds toegepast op pmovaz-prod. Idempotent.
insert into public.combis (code, naam, eenheid, category_code, subcategory_code, source, status, actief) values
  ('C3-3003','Opritten','m²','30','03','curated','active',true),
  ('C3-3004','Tuinpaden','m²','30','04','curated','active',true),
  ('C3-3005','Grondwerk terrein','m²','30','05','curated','active',true),
  ('C3-3009','Keerwanden tuin','m¹','30','09','curated','active',true),
  ('C3-3010','Buitenverlichting','st','30','10','curated','active',true),
  ('C3-3013','Kunstgras','m²','30','13','curated','active',true),
  ('C3-3015','Tuinmuren','m²','30','15','curated','active',true),
  ('C3-3204','Drainage','m¹','32','04','curated','active',true),
  ('C3-3207','Infiltratiekratten','st','32','07','curated','active',true),
  ('C3-3210','Terreinriolering','m¹','32','10','curated','active',true),
  ('C3-3214','Pompput','st','32','14','curated','active',true),
  ('C3-3102','Sierhekwerk','m¹','31','02','curated','active',true),
  ('C3-3103','Gaashekwerk','m¹','31','03','curated','active',true),
  ('C3-3104','Poorten','st','31','04','curated','active',true),
  ('C3-3105','Leuningen buiten','m¹','31','05','curated','active',true),
  ('C3-3107','Terreinafscheiding','m¹','31','07','curated','active',true)
on conflict do nothing;

insert into public.combi_components (combi_id, type, omschrijving, eenheid, hoeveelheid_per_eenheid, materiaalprijs, arbeidsprijs, materieelprijs, volgorde)
select c.id, v.type::calc_row_type, v.oms, c.eenheid, 1, v.mat, v.arb, v.mtl, v.vg
from public.combis c join (values
  ('C3-3003','materiaal','Bestrating + fundering',35,0,0,0),('C3-3003','arbeid','Aanleggen oprit',0,30,0,1),
  ('C3-3004','materiaal','Tegels + zand',30,0,0,0),('C3-3004','arbeid','Bestraten pad',0,28,0,1),
  ('C3-3005','materiaal','Aanvulzand',5,0,0,0),('C3-3005','arbeid','Grondwerk',0,12,0,1),('C3-3005','materieel','Minigraver',0,0,6,2),
  ('C3-3009','materiaal','Keerelementen',65,0,0,0),('C3-3009','arbeid','Plaatsen',0,55,0,1),
  ('C3-3010','materiaal','Armatuur + kabel',85,0,0,0),('C3-3010','arbeid','Aanleggen',0,70,0,1),
  ('C3-3013','materiaal','Kunstgras + onderlaag',28,0,0,0),('C3-3013','arbeid','Leggen',0,18,0,1),
  ('C3-3015','materiaal','Steen + mortel',75,0,0,0),('C3-3015','arbeid','Metselen tuinmuur',0,85,0,1),
  ('C3-3204','materiaal','Drainagebuis + grind',14,0,0,0),('C3-3204','arbeid','Aanleggen',0,16,0,1),
  ('C3-3207','materiaal','Infiltratiekrat',120,0,0,0),('C3-3207','arbeid','Plaatsen',0,90,0,1),
  ('C3-3210','materiaal','PVC riool + hulpstukken',18,0,0,0),('C3-3210','arbeid','Aanleg',0,28,0,1),
  ('C3-3214','materiaal','Pompput + pomp',450,0,0,0),('C3-3214','arbeid','Plaatsen + aansluiten',0,350,0,1),
  ('C3-3102','materiaal','Sierhekwerk',120,0,0,0),('C3-3102','arbeid','Plaatsen',0,60,0,1),
  ('C3-3103','materiaal','Gaashek + palen',35,0,0,0),('C3-3103','arbeid','Plaatsen',0,30,0,1),
  ('C3-3104','materiaal','Poort + beslag',650,0,0,0),('C3-3104','arbeid','Monteren',0,250,0,1),
  ('C3-3105','materiaal','Buitenleuning RVS',85,0,0,0),('C3-3105','arbeid','Monteren',0,55,0,1),
  ('C3-3107','materiaal','Afscheiding',55,0,0,0),('C3-3107','arbeid','Plaatsen',0,40,0,1)
) v(code,type,oms,mat,arb,mtl,vg) on c.code=v.code and c.source='curated';

insert into public.bouwdeel_combis (bouwdeel_id, combi_id, volgorde)
select b.id, k.id, 3 from public.combis k
join public.bouwdelen b on b.category_code=k.category_code and b.subcategory_code=k.subcategory_code
where k.code like 'C3-%'
  and not exists (select 1 from public.bouwdeel_combis bc where bc.bouwdeel_id=b.id and bc.combi_id=k.id);
