-- Driver-attribuut-seed V1.0 — 28 canonieke definities + 27 ETIM/IFC-crosswalk.
-- Geen prijzen/bedragen/projectinput; twijfel-matches → review_queue.
-- Toegepast op pmovaz-prod 2026-06-16 (mirror van apply_migration 20260616_13).
insert into attr.attribute_definition (code,naam,categorie,datatype,unit,allowed_values) values
('dikte_mm','Dikte','hoeveelheid_driver','number','mm','[]'),
('element_lengte_m','Element-lengte','hoeveelheid_driver','number','m','[]'),
('element_breedte_m','Element-breedte','hoeveelheid_driver','number','m','[]'),
('element_hoogte_m','Element-hoogte','hoeveelheid_driver','number','m','[]'),
('gewicht_kg_per_m','Gewicht per m1','hoeveelheid_driver','number','kg/m','[]'),
('aantal_glaslagen','Aantal glaslagen','hoeveelheid_driver','number','st','[]'),
('betonsterkteklasse','Betonsterkteklasse','calc_driver','enum',null,'["C20/25","C25/30","C30/37","C35/45","ZVB"]'),
('bekistingstype','Bekistingstype','calc_driver','enum',null,'["systeem","traditioneel","geen"]'),
('beglazingstype','Beglazingstype','calc_driver','enum',null,'["enkel","dubbel","HR++","triple"]'),
('kwaliteitsniveau','Kwaliteitsniveau','calc_driver','enum',null,'["budget","standaard","premium"]'),
('isolatietype','Isolatietype','calc_driver','enum',null,'["EPS","XPS","PIR","minerale_wol","glaswol"]'),
('systeemtype','Installatiesysteem','calc_driver','enum',null,'["cv_ketel","warmtepomp","hybride","mv","wtw"]'),
('afwerkingsniveau','Afwerkingsniveau','calc_driver','enum',null,'["basis","standaard","luxe"]'),
('materiaalsoort','Materiaalsoort','materiaal','enum',null,'["hout","kunststof","aluminium","staal","beton","steen","gips"]'),
('dichtheid_kg_m3','Dichtheid','materiaal','number','kg/m3','[]'),
('kleur','Kleur','materiaal','text',null,'[]'),
('brandwerendheid_min','Brandwerendheid','prestatie','number','min','[]'),
('warmteweerstand_rc','Warmteweerstand Rc','prestatie','number','m2K/W','[]'),
('warmtedoorgang_u','Warmtedoorgang U','prestatie','number','W/m2K','[]'),
('warmtegeleiding_lambda','Warmtegeleiding lambda','prestatie','number','W/mK','[]'),
('geluidsisolatie_db','Geluidsisolatie','prestatie','number','dB','[]'),
('milieuklasse_mpg','MPG-/milieuwaarde','prestatie','number',null,'[]'),
('nominaal_vermogen_w','Nominaal vermogen','technisch','number','W','[]'),
('nominale_stroom_a','Nominale stroom','technisch','number','A','[]'),
('luchtdebiet_m3h','Luchtdebiet','technisch','number','m3/h','[]'),
('verplicht_bij_projecttype','Verplicht bij projecttype','validatie','text',null,'[]'),
('min_hoeveelheid','Min. hoeveelheid','validatie','number',null,'[]'),
('max_hoeveelheid','Max. hoeveelheid','validatie','number',null,'[]')
on conflict (code) do nothing;

insert into attr.definition_source (attribute_id, source_id, source_record_id, property_code, confidence, mapping_status, content_hash)
select d.id, s.id, x.prop, x.prop, x.conf, x.ms::attr.map_status, md5(x.src||x.prop||x.attr)
from (values
 ('etim-properties','EF000125','dikte_mm',0.90,'auto_match'),
 ('etim-properties','EF000008','element_breedte_m',0.80,'auto_match'),
 ('etim-properties','EF000040','element_hoogte_m',0.80,'auto_match'),
 ('etim-properties','EF000167','gewicht_kg_per_m',0.60,'twijfel'),
 ('etim-properties','EF001347','betonsterkteklasse',0.60,'twijfel'),
 ('etim-properties','EF020000','dichtheid_kg_m3',0.90,'auto_match'),
 ('etim-properties','EF016887','dichtheid_kg_m3',0.60,'twijfel'),
 ('etim-properties','EF000007','kleur',0.90,'auto_match'),
 ('etim-properties','EF001743','brandwerendheid_min',0.50,'twijfel'),
 ('etim-properties','EF010245','warmteweerstand_rc',0.90,'auto_match'),
 ('etim-properties','EF010083','warmtedoorgang_u',0.95,'auto_match'),
 ('etim-properties','EF010338','warmtegeleiding_lambda',0.90,'auto_match'),
 ('etim-properties','EF002270','geluidsisolatie_db',0.60,'twijfel'),
 ('etim-properties','EF000169','nominaal_vermogen_w',0.90,'auto_match'),
 ('etim-properties','EF000001','nominale_stroom_a',0.90,'auto_match'),
 ('etim-properties','EF001605','luchtdebiet_m3h',0.85,'auto_match'),
 ('ifc-psets','Thickness','dikte_mm',0.85,'auto_match'),
 ('ifc-psets','GlassLayers','aantal_glaslagen',0.90,'auto_match'),
 ('ifc-psets','CompressiveStrength','betonsterkteklasse',0.70,'twijfel'),
 ('ifc-psets','Material','materiaalsoort',0.85,'auto_match'),
 ('ifc-psets','Colour','kleur',0.90,'auto_match'),
 ('ifc-psets','FireRating','brandwerendheid_min',0.80,'auto_match'),
 ('ifc-psets','ThermalTransmittance','warmtedoorgang_u',0.95,'auto_match'),
 ('ifc-psets','ThermalConductivity','warmtegeleiding_lambda',0.90,'auto_match'),
 ('ifc-psets','AcousticRating','geluidsisolatie_db',0.85,'auto_match'),
 ('ifc-psets','NominalCurrent','nominale_stroom_a',0.90,'auto_match'),
 ('ifc-psets','AirFlowRate','luchtdebiet_m3h',0.90,'auto_match')
) as x(src,prop,attr,conf,ms)
join attr.attribute_definition d on d.code=x.attr
join harvest.sources s on s.code=x.src
on conflict (source_id, source_record_id) do nothing;

insert into attr.review_queue (entity, entity_id, reden, details)
select 'definition_source', ds.id, 'twijfel',
  jsonb_build_object('property_code',ds.property_code,'attribute',d.code,'confidence',ds.confidence)
from attr.definition_source ds join attr.attribute_definition d on d.id=ds.attribute_id
where ds.mapping_status='twijfel'
  and not exists (select 1 from attr.review_queue rq where rq.entity='definition_source' and rq.entity_id=ds.id);

insert into attr.audit_log (entity, entity_id, actie, nieuwe_waarde, actor, reason)
values ('seed', null, 'insert', jsonb_build_object('definitions',28,'crosswalk',27), 'harvest-sprint',
  'Driver-attribuut-seed V1.0: 28 definities + 27 ETIM/IFC-crosswalk; twijfel naar review');
