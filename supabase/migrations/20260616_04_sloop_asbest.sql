-- P2.1 — Sloop/Asbest: asbestinventarisatie als losse post. Additief, idempotent.
insert into sterkcalc_visual_subcategories (category_code, code, title, sort_order, active, stabu_mapping)
select '02','16','Asbestinventarisatie',16,true,'{}'::jsonb
where not exists (select 1 from sterkcalc_visual_subcategories s where s.category_code='02' and s.code='16');

delete from combi_components where combi_id in (select id from combis where code='P5-D216');
delete from combis where code='P5-D216';

insert into combis (code, naam, eenheid, category_code, subcategory_code, source, status, actief, stabu_hoofdstuk)
values ('P5-D216','Asbestinventarisatie (onderzoek + rapport)','pst','02','16','curated','active',true,'01');

insert into combi_components (combi_id, type, omschrijving, hoeveelheid_per_eenheid, eenheid, materiaalprijs, arbeidsprijs, materieelprijs, volgorde)
select cb.id, 'arbeid'::calc_row_type, 'Gecertificeerd asbestonderzoek + rapportage', 1, 'pst', 0, 650, 0, 0
from combis cb where cb.code='P5-D216';
