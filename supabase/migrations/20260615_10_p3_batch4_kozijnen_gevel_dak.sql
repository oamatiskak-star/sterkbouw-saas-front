-- P3 Batch 4 — Kozijnen/Gevel/Dak. Gecureerd, C3-prefix, eigen componenten, correcte eenheid, NL-richtprijzen.
-- Reeds toegepast op pmovaz-prod. Idempotent.
insert into public.combis (code, naam, eenheid, category_code, subcategory_code, source, status, actief) values
  ('C3-1407','Stelkozijnen','m¹','14','07','curated','active',true),
  ('C3-1410','Raamdorpels (kozijn)','m¹','14','10','curated','active',true),
  ('C3-1411','Kozijnmontage','st','14','11','curated','active',true),
  ('C3-1412','Kozijnvervanging (incl. demontage)','st','14','12','curated','active',true),
  ('C3-1415','Puien (vast/draai)','m²','14','15','curated','active',true),
  ('C3-1501','HR++ glas','m²','15','01','curated','active',true),
  ('C3-1502','Triple glas','m²','15','02','curated','active',true),
  ('C3-1503','Veiligheidsglas','m²','15','03','curated','active',true),
  ('C3-1504','Brandwerend glas','m²','15','04','curated','active',true),
  ('C3-1509','Glas vervangen','st','15','09','curated','active',true),
  ('C3-1510','Doucheglas (glaswand)','st','15','10','curated','active',true),
  ('C3-1001','Houten gevelbekleding','m²','10','01','curated','active',true),
  ('C3-1002','Kunststof gevelbekleding','m²','10','02','curated','active',true),
  ('C3-1003','Aluminium gevelbekleding','m²','10','03','curated','active',true),
  ('C3-1004','Vezelcement gevelplaten','m²','10','04','curated','active',true),
  ('C3-1005','Steenstrips','m²','10','05','curated','active',true),
  ('C3-1006','Stucgevel','m²','10','06','curated','active',true),
  ('C3-1008','Gevelisolatiesysteem (ETICS)','m²','10','08','curated','active',true),
  ('C3-1015','Gevelcoating','m²','10','15','curated','active',true),
  ('C3-1206','Zinken dak','m²','12','06','curated','active',true),
  ('C3-1208','Dampremmer','m²','12','08','curated','active',true),
  ('C3-1212','Nokvorsten','m¹','12','12','curated','active',true),
  ('C3-1214','Dakreparatie','m²','12','14','curated','active',true),
  ('C3-1215','Groendak','m²','12','15','curated','active',true),
  ('C3-1107','Dakopbouw','m²','11','07','curated','active',true)
on conflict do nothing;

insert into public.combi_components (combi_id, type, omschrijving, eenheid, hoeveelheid_per_eenheid, materiaalprijs, arbeidsprijs, materieelprijs, volgorde)
select c.id, v.type::calc_row_type, v.oms, c.eenheid, 1, v.mat, v.arb, 0, v.vg
from public.combis c join (values
  ('C3-1407','materiaal','Stelkozijn',18,0,0),('C3-1407','arbeid','Stellen',0,22,1),
  ('C3-1410','materiaal','Raamdorpel',28,0,0),('C3-1410','arbeid','Stellen',0,17,1),
  ('C3-1411','materiaal','Bevestiging + kit',30,0,0),('C3-1411','arbeid','Monteren kozijn',0,120,1),
  ('C3-1412','materiaal','Nieuw kozijn + glas',480,0,0),('C3-1412','arbeid','Demontage + montage',0,220,1),
  ('C3-1415','materiaal','Pui + glas',480,0,0),('C3-1415','arbeid','Stellen',0,130,1),
  ('C3-1501','materiaal','HR++ glas',95,0,0),('C3-1501','arbeid','Beglazen',0,35,1),
  ('C3-1502','materiaal','Triple glas',145,0,0),('C3-1502','arbeid','Beglazen',0,40,1),
  ('C3-1503','materiaal','Gelaagd veiligheidsglas',120,0,0),('C3-1503','arbeid','Beglazen',0,35,1),
  ('C3-1504','materiaal','Brandwerend glas',320,0,0),('C3-1504','arbeid','Beglazen',0,50,1),
  ('C3-1509','materiaal','Ruit op maat',120,0,0),('C3-1509','arbeid','Vervangen',0,90,1),
  ('C3-1510','materiaal','Glaswand + beslag',450,0,0),('C3-1510','arbeid','Monteren',0,180,1),
  ('C3-1001','materiaal','Houten gevelbekleding + regelwerk',55,0,0),('C3-1001','arbeid','Aanbrengen',0,45,1),
  ('C3-1002','materiaal','Kunststof delen + regelwerk',48,0,0),('C3-1002','arbeid','Aanbrengen',0,38,1),
  ('C3-1003','materiaal','Aluminium gevelpaneel',95,0,0),('C3-1003','arbeid','Monteren',0,55,1),
  ('C3-1004','materiaal','Vezelcementplaat',65,0,0),('C3-1004','arbeid','Monteren',0,45,1),
  ('C3-1005','materiaal','Steenstrips + lijm',55,0,0),('C3-1005','arbeid','Aanbrengen',0,60,1),
  ('C3-1006','materiaal','Buitenstuc + wapening',22,0,0),('C3-1006','arbeid','Stucwerk gevel',0,38,1),
  ('C3-1008','materiaal','ETICS isolatie + pleister',45,0,0),('C3-1008','arbeid','Systeem aanbrengen',0,55,1),
  ('C3-1015','materiaal','Gevelcoating',9,0,0),('C3-1015','arbeid','Aanbrengen',0,16,1),
  ('C3-1206','materiaal','Zink + onderdak',90,0,0),('C3-1206','arbeid','Aanbrengen',0,70,1),
  ('C3-1208','materiaal','Dampremmende folie',6,0,0),('C3-1208','arbeid','Aanbrengen',0,8,1),
  ('C3-1212','materiaal','Nokvorst + mortel',22,0,0),('C3-1212','arbeid','Aanbrengen',0,24,1),
  ('C3-1214','materiaal','Reparatiemateriaal',18,0,0),('C3-1214','arbeid','Dak repareren',0,35,1),
  ('C3-1215','materiaal','Substraat + sedum',65,0,0),('C3-1215','arbeid','Aanleggen',0,45,1),
  ('C3-1107','materiaal','Dakopbouw constructie',60,0,0),('C3-1107','arbeid','Opbouwen',0,50,1)
) v(code,type,oms,mat,arb,vg) on c.code=v.code and c.source='curated';

insert into public.bouwdeel_combis (bouwdeel_id, combi_id, volgorde)
select b.id, k.id, 3 from public.combis k
join public.bouwdelen b on b.category_code=k.category_code and b.subcategory_code=k.subcategory_code
where k.code like 'C3-%'
  and not exists (select 1 from public.bouwdeel_combis bc where bc.bouwdeel_id=b.id and bc.combi_id=k.id);
