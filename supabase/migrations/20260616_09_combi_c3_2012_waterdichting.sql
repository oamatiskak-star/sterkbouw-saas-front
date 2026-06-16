-- Seed ontbrekende combi C3-2012 "Waterdichting (smeerfolie)" (cat 20 Tegelwerk, sub 13).
-- Aangeroepen door objectEngine (badkamer) + badkamer-rekenmodel, maar ontbrak in de bibliotheek
-- → die regel viel stil in "ontbrekend". Materiaal ~€16/m² (Bouwmaat natte-cel/kimband-niveau),
-- arbeid €14/m². Idempotent.
with nieuw as (
  insert into combis (code, naam, eenheid, category_code, subcategory_code, actief, source, status)
  select 'C3-2012','Waterdichting (smeerfolie)','m²','20','13', true, 'manual','active'
  where not exists (select 1 from combis where code='C3-2012')
  returning id
)
insert into combi_components (combi_id, type, omschrijving, hoeveelheid_per_eenheid, eenheid, materiaalprijs, arbeidsprijs, volgorde)
select id,'materiaal'::calc_row_type,'Afdichtingsmembraan + kimband (natte cel)',1,'m²',16,0,0 from nieuw
union all
select id,'arbeid'::calc_row_type,'Aanbrengen waterdichting',1,'m²',0,14,1 from nieuw;
