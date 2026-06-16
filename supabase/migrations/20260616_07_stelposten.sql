-- P4.3 — Stelposten/onvoorzien: generieke €-combi (1 euro per eenheid) zodat een ingevoerd
-- bedrag 1-op-1 als werktafelregel landt. Additief, idempotent.
insert into sterkcalc_visual_subcategories (category_code, code, title, sort_order, active, stabu_mapping)
select '00','36','Stelposten & onvoorzien',36,true,'{}'::jsonb
where not exists (select 1 from sterkcalc_visual_subcategories s where s.category_code='00' and s.code='36');

delete from combi_components where combi_id in (select id from combis where code='P5-STEL');
delete from combis where code='P5-STEL';

insert into combis (code, naam, eenheid, category_code, subcategory_code, source, status, actief, stabu_hoofdstuk)
values ('P5-STEL','Stelpost / onvoorzien','€','00','36','curated','active',true,'01');

insert into combi_components (combi_id, type, omschrijving, hoeveelheid_per_eenheid, eenheid, materiaalprijs, arbeidsprijs, materieelprijs, volgorde)
select cb.id, 'materiaal'::calc_row_type, 'Stelpost (bedrag)', 1, '€', 1, 0, 0, 0
from combis cb where cb.code='P5-STEL';
