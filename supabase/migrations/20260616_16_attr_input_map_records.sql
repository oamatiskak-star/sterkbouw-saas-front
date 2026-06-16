-- Activeer voorheen 'proposed' thermische/dimensionele drivers: de rekenmodellen hebben nu
-- spec-inputs (isolatie dikte/λ/Rc, gevel/dak Rc, kozijn U, ventilatie luchtdebiet).
-- relatie='records' = vastgelegd als aanname; geen prijseffect tot combi-varianten per dikte/Rc bestaan.
-- Toegepast op pmovaz-prod 2026-06-16 (mirror van apply_migration 20260616_16).
insert into attr.rekenmodel_input_map (attribute_id, rekenmodel_object, input_key, relatie, confidence, status)
select d.id, x.obj, x.input, 'records', x.conf, 'active'
from (values
 ('dikte_mm','isolatie','dikte_mm',0.60),
 ('warmtegeleiding_lambda','isolatie','lambda',0.70),
 ('warmteweerstand_rc','isolatie','rc_waarde',0.70),
 ('warmteweerstand_rc','gevel','rc_waarde',0.70),
 ('warmteweerstand_rc','dak','rc_waarde',0.70),
 ('warmtedoorgang_u','kozijn','u_waarde',0.70),
 ('luchtdebiet_m3h','ventilatie','luchtdebiet_m3h',0.80)
) as x(attr,obj,input,conf)
join attr.attribute_definition d on d.code=x.attr
on conflict (attribute_id, rekenmodel_object, input_key) do nothing;
