-- scripts/assembly-quantity-engine.sql — Assembly-engine operator-script
-- Draait de geïsoleerde `assembly`-engine tegen de staged IFC-objecten (harvest.ifc_object).
-- Vereist privileges (service-role / MCP / psql met owner) — het assembly-schema is bewust
-- NIET via de anon-API ontsloten. GEEN werktafel-mutatie, GEEN core-mutatie, GEEN prijzen.
--
-- CANONIEK: assembly.generated_item (+ assembly.generate_items_from_ifc/_all, view assembly.v_assembly_staged).
-- DEPRECATED: assembly.staged_regel + generate_staged_from_ifc/_all (sectie 1-4 hieronder; behouden voor
--   historie, NIET gebruiken voor nieuwe generatie). Zie migratie 20260616_29.
--
-- Gebruik (privileged):
--   psql "$DATABASE_URL" -f scripts/assembly-quantity-engine.sql
-- of via Supabase MCP execute_sql per statement.

-- 1) Eén object → staged regels (+ review_queue bij gaten):
--    select assembly.generate_staged_from_ifc('<harvest.ifc_object.id>');

-- 2) Batch: alle staged IFC-objecten → aggregaat (idempotent: dedup op ifc_guid|functie|combi_code)
select jsonb_pretty(assembly.generate_staged_all()) as resultaat;

-- 3) Inspectie van de gegenereerde staged regels (provenance per regel)
select ifc_guid, variant_code, functie, combi_code, base_quantity, factor,
       calculated_quantity, eenheid, quantity_source, confidence, status, dedup_key
from assembly.staged_regel
order by ifc_guid, functie;

-- 4) Openstaande assembly-reviews (gaten: geen template / quantity ontbreekt / rekenmodel-route)
select reden, details->>'ifc_guid' as ifc_guid, details->>'functie' as functie,
       details->>'combi_code' as combi_code, details->>'ifc_entity' as ifc_entity, status
from harvest.review_queue
where reden like 'assembly-%' and status='open'
order by reden;

-- ── Fase 2: generated_item engine (UNIQUE(ifc_object_id,functie) + rule_id-provenance) ──
-- Eén object → volledige staged opbouw:
--   select assembly.generate_items_from_ifc('<harvest.ifc_object.id>');
-- Batch + rapport (objecten/generated/duplicates/missing/unmatched/rekenmodel_route):
select jsonb_pretty(assembly.generate_items_all()) as fase2_resultaat;
-- Provenance per staged generated_item:
select ifc_guid, variant_code, functie, combi_code, quantity, eenheid, factor,
       quantity_source, rule_id, confidence, status
from assembly.generated_item order by ifc_guid, functie;
