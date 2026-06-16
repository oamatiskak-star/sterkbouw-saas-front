-- Actieve attribuut → rekenmodel-input koppelingen (alleen bestaande input-keys).
-- proposed thermische/dimensionele drivers (dikte/Rc/U/lambda/installatie-technisch)
-- worden NIET geseed: die hebben nog geen rekenmodel-input. Geen core-/bedrag-mutatie.
-- Toegepast op pmovaz-prod 2026-06-16 (mirror van apply_migration 20260616_14).
insert into attr.rekenmodel_input_map (attribute_id, rekenmodel_object, input_key, relatie, confidence, status)
select d.id, x.obj, x.input, 'drives', x.conf, 'active'
from (values
 ('betonsterkteklasse','fundering','betonsoort',0.95),
 ('bekistingstype','fundering','bekisting',0.95),
 ('gewicht_kg_per_m','staal','gewicht_kg_m',0.95),
 ('beglazingstype','kozijn','beglazing',0.95),
 ('materiaalsoort','kozijn','materiaal',0.90),
 ('kwaliteitsniveau','elektra','niveau',0.90),
 ('kwaliteitsniveau','keuken','niveau',0.90),
 ('systeemtype','verwarming','systeem',0.90),
 ('systeemtype','ventilatie','systeem',0.90),
 ('isolatietype','gevel','isolatie',0.65),
 ('isolatietype','dak','isolatie',0.65),
 ('isolatietype','vloer','isolatie',0.65),
 ('afwerkingsniveau','binnenwand','afwerking',0.70),
 ('afwerkingsniveau','vloer','afwerking',0.70)
) as x(attr,obj,input,conf)
join attr.attribute_definition d on d.code=x.attr
on conflict (attribute_id, rekenmodel_object, input_key) do nothing;
