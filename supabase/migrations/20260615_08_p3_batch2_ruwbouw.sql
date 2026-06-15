-- P3 Batch 2 — Ruwbouw. Gecureerd, C3-prefix, eigen componenten, correcte eenheid, NL-richtprijzen.
-- Reeds toegepast op pmovaz-prod. Idempotent.
insert into public.combis (code, naam, eenheid, category_code, subcategory_code, source, status, actief) values
  ('C3-0403','Funderingsbalken','m¹','04','03','curated','active',true),
  ('C3-0409','Bekisting fundering','m²','04','09','curated','active',true),
  ('C3-0411','Kruipruimte drainage','m¹','04','11','curated','active',true),
  ('C3-0414','Betonstorten fundering','m³','04','14','curated','active',true),
  ('C3-0501','Betonvloer (constructief)','m²','05','01','curated','active',true),
  ('C3-0502','Betonwand','m²','05','02','curated','active',true),
  ('C3-0503','Betonkolom','st','05','03','curated','active',true),
  ('C3-0504','Betonbalk','m¹','05','04','curated','active',true),
  ('C3-0505','Wapening','m²','05','05','curated','active',true),
  ('C3-0506','Bekisting','m²','05','06','curated','active',true),
  ('C3-0510','Breedplaatvloer','m²','05','10','curated','active',true),
  ('C3-0511','Kanaalplaatvloer','m²','05','11','curated','active',true),
  ('C3-0601','Bedrijfsvloer (monoliet)','m²','06','01','curated','active',true),
  ('C3-0603','Keerwand','m¹','06','03','curated','active',true),
  ('C3-0604','Betontrap','st','06','04','curated','active',true),
  ('C3-0905','Rollagen','m¹','09','05','curated','active',true),
  ('C3-0907','Schoorsteen (metselen)','st','09','07','curated','active',true),
  ('C3-0908','Metselwerk herstel','m²','09','08','curated','active',true),
  ('C3-0911','Siermetselwerk','m²','09','11','curated','active',true),
  ('C3-0701','Stalen kolom','st','07','01','curated','active',true),
  ('C3-0702','Stalen ligger','m¹','07','02','curated','active',true),
  ('C3-0706','Stalen trap','st','07','06','curated','active',true),
  ('C3-0712','Conservering staal (coating)','m²','07','12','curated','active',true),
  ('C3-0714','Constructieve versterking (stalen balk)','st','07','14','curated','active',true),
  ('C3-1102','Spanten','st','11','02','curated','active',true),
  ('C3-1105','Houtskelet dakelement','m²','11','05','curated','active',true),
  ('C3-1108','Dakkapelconstructie','st','11','08','curated','active',true),
  ('C3-1203','PVC dakbedekking','m²','12','03','curated','active',true),
  ('C3-1205','Leien','m²','12','05','curated','active',true),
  ('C3-1209','Dakrandafwerking','m¹','12','09','curated','active',true),
  ('C3-1213','Loodslabben','m¹','12','13','curated','active',true),
  ('C3-0805','Cellenbeton gevel','m²','08','05','curated','active',true),
  ('C3-0806','Houtskeletbouw element','m²','08','06','curated','active',true),
  ('C3-0811','Spouwankers','m²','08','11','curated','active',true),
  ('C3-0812','Waterkering (folie)','m¹','08','12','curated','active',true)
on conflict do nothing;

insert into public.combi_components (combi_id, type, omschrijving, eenheid, hoeveelheid_per_eenheid, materiaalprijs, arbeidsprijs, materieelprijs, volgorde)
select c.id, v.type::calc_row_type, v.oms, c.eenheid, 1, v.mat, v.arb, v.mtl, v.vg
from public.combis c join (values
  ('C3-0403','materiaal','Beton + wapening',95,0,0,0),('C3-0403','arbeid','Storten + vlechten',0,70,0,1),
  ('C3-0409','materiaal','Bekistingmateriaal',18,0,0,0),('C3-0409','arbeid','Stellen',0,28,0,1),
  ('C3-0411','materiaal','Drainagebuis + grind',14,0,0,0),('C3-0411','arbeid','Aanleggen',0,16,0,1),
  ('C3-0414','materiaal','Beton C20/25',130,0,0,0),('C3-0414','arbeid','Storten',0,35,0,1),('C3-0414','materieel','Pomp',0,0,25,2),
  ('C3-0501','materiaal','Beton + wapening',42,0,0,0),('C3-0501','arbeid','Storten + afwerken',0,30,0,1),
  ('C3-0502','materiaal','Beton + wapening + bekisting',55,0,0,0),('C3-0502','arbeid','Storten',0,48,0,1),
  ('C3-0503','materiaal','Beton + wapening kolom',180,0,0,0),('C3-0503','arbeid','Bekisten + storten',0,160,0,1),
  ('C3-0504','materiaal','Beton + wapening balk',95,0,0,0),('C3-0504','arbeid','Bekisten + storten',0,75,0,1),
  ('C3-0505','materiaal','Wapeningsnet/staal',18,0,0,0),('C3-0505','arbeid','Vlechten',0,10,0,1),
  ('C3-0506','materiaal','Bekistingmateriaal',16,0,0,0),('C3-0506','arbeid','Stellen',0,26,0,1),
  ('C3-0510','materiaal','Breedplaat',58,0,0,0),('C3-0510','arbeid','Stellen + druklaag',0,22,0,1),
  ('C3-0511','materiaal','Kanaalplaat',52,0,0,0),('C3-0511','arbeid','Stellen',0,18,0,1),
  ('C3-0601','materiaal','Beton monoliet',28,0,0,0),('C3-0601','arbeid','Storten + vlinderen',0,22,0,1),('C3-0601','materieel','Vlindermachine',0,0,6,2),
  ('C3-0603','materiaal','Beton + wapening keerwand',180,0,0,0),('C3-0603','arbeid','Bekisten + storten',0,120,0,1),
  ('C3-0604','materiaal','Prefab betontrap',850,0,0,0),('C3-0604','arbeid','Plaatsen',0,350,0,1),
  ('C3-0905','materiaal','Baksteen + mortel',22,0,0,0),('C3-0905','arbeid','Rollaag metselen',0,38,0,1),
  ('C3-0907','materiaal','Steen + mortel + kanaal',450,0,0,0),('C3-0907','arbeid','Schoorsteen metselen',0,650,0,1),
  ('C3-0908','materiaal','Steen + mortel',25,0,0,0),('C3-0908','arbeid','Herstel metselwerk',0,55,0,1),
  ('C3-0911','materiaal','Siersteen + mortel',65,0,0,0),('C3-0911','arbeid','Siermetselwerk',0,90,0,1),
  ('C3-0701','materiaal','Stalen kolom HEA',320,0,0,0),('C3-0701','arbeid','Stellen',0,180,0,1),
  ('C3-0702','materiaal','Stalen ligger HEA/IPE',140,0,0,0),('C3-0702','arbeid','Monteren',0,70,0,1),
  ('C3-0706','materiaal','Stalen trap op maat',1800,0,0,0),('C3-0706','arbeid','Plaatsen',0,450,0,1),
  ('C3-0712','materiaal','Coating/primer',12,0,0,0),('C3-0712','arbeid','Conserveren',0,18,0,1),
  ('C3-0714','materiaal','Stalen balk + ondersteuning',950,0,0,0),('C3-0714','arbeid','Inbrengen + stempelen',0,750,0,1),
  ('C3-1102','materiaal','Houten/stalen spant',180,0,0,0),('C3-1102','arbeid','Plaatsen',0,90,0,1),
  ('C3-1105','materiaal','HSB-dakelement',55,0,0,0),('C3-1105','arbeid','Monteren',0,45,0,1),
  ('C3-1108','materiaal','Dakkapel constructie + afwerking',1200,0,0,0),('C3-1108','arbeid','Plaatsen',0,1400,0,1),
  ('C3-1203','materiaal','PVC dakbaan + isolatie',30,0,0,0),('C3-1203','arbeid','Aanbrengen',0,26,0,1),
  ('C3-1205','materiaal','Natuurleien',75,0,0,0),('C3-1205','arbeid','Leggen',0,65,0,1),
  ('C3-1209','materiaal','Dakrandprofiel',22,0,0,0),('C3-1209','arbeid','Monteren',0,18,0,1),
  ('C3-1213','materiaal','Lood + kit',28,0,0,0),('C3-1213','arbeid','Aanbrengen',0,26,0,1),
  ('C3-0805','materiaal','Cellenbeton + lijm',30,0,0,0),('C3-0805','arbeid','Stellen',0,32,0,1),
  ('C3-0806','materiaal','HSB-gevelelement',85,0,0,0),('C3-0806','arbeid','Monteren',0,55,0,1),
  ('C3-0811','materiaal','Spouwankers',4,0,0,0),('C3-0811','arbeid','Plaatsen',0,6,0,1),
  ('C3-0812','materiaal','Waterkeringsfolie',6,0,0,0),('C3-0812','arbeid','Aanbrengen',0,9,0,1)
) v(code,type,oms,mat,arb,mtl,vg) on c.code=v.code and c.source='curated';

insert into public.bouwdeel_combis (bouwdeel_id, combi_id, volgorde)
select b.id, k.id, 3 from public.combis k
join public.bouwdelen b on b.category_code=k.category_code and b.subcategory_code=k.subcategory_code
where k.code like 'C3-%'
  and not exists (select 1 from public.bouwdeel_combis bc where bc.bouwdeel_id=b.id and bc.combi_id=k.id);
