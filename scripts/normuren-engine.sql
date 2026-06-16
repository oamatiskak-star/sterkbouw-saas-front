-- scripts/normuren-engine.sql — Normuren-import operator-script V1.0 (privileged)
-- Volledige flow ná het laden van staged regels (zie scripts/normuren-import.py voor extractie):
--   staging → matching → conflict-detectie → review → approved normurenlaag.
-- Het `normuren`-schema is bewust NIET via de anon-API ontsloten. Vereist service-role/psql/MCP.
-- GEEN core-mutatie, GEEN prijzen/marges, GEEN werktafel-mutatie.
--
-- Gebruik (vervang <batch_id> door de import_batch.id):
--   1) extractie + staging-insert: python3 scripts/normuren-import.py calc.txt out.json [uurloon]
--      → laad import_batch + staging_regel (on conflict (source_file,source_row) do nothing = dedup #1)
--   2) matching + conflicten:
--        select normuren.run_matching('<batch_id>');       -- vult combi_code (suggestie, review)
--        select normuren.detect_conflicts('<batch_id>');   -- markeert afwijkende normuren → review

-- Rapport per batch (regels ingelezen / arbeid / uren expliciet / afgeleid / gematcht / conflicten / dekking)
select
  (select regels_ingelezen from normuren.import_batch where id='<batch_id>')                                  as regels_ingelezen,
  count(*)                                                                                                    as arbeidregels,
  count(*) filter (where uren_bron='expliciet')                                                               as uren_expliciet,
  count(*) filter (where uren_bron='afgeleid_uit_loon')                                                       as uren_afgeleid,
  count(*) filter (where combi_code is not null)                                                              as gematcht_combi,
  count(*) filter (where is_correctie)                                                                        as correctieregels,
  count(*) filter (where review_note ilike '%conflict%')                                                      as conflict_rijen,
  count(*) filter (where uren_per_eenheid is null)                                                            as zonder_normuur,
  count(distinct (stabu_code,regelcode,eenheid_norm)) filter (where uren_per_eenheid is not null)             as kandidaat_normuur_keys,
  count(distinct stabu_code)                                                                                  as stabu_dekking
from normuren.staging_regel where batch_id='<batch_id>';

-- Matching Fase 2 (betrouwbaar, pg_trgm + STABU-crosswalk + werksoort-blokkade):
--   select * from normuren.run_matching_v2('<batch_id>');   -- vult suggested_combi_code/_component_id,
--                                                            -- match_score, match_reason, suggest_high_confidence
-- Output per regel: suggested_combi_code · suggested_component_id · match_score · match_reason.
-- Drempels: score < 0.85 → review; score >= 0.85 → suggest_high_confidence=true (NOOIT auto-approved).
-- Top review-items (suggesties, hoogste score eerst):
--   select left(omschrijving,40), eenheid_norm, uren_per_eenheid, suggested_combi_code,
--          suggested_component_id, match_score, match_reason
--   from normuren.staging_regel
--   where batch_id='<batch_id>' and suggested_combi_code is not null
--   order by match_score desc limit 20;

-- Review-flow (handmatig, dedup-regel #3 = afwijkende normuur per component → conflict/review):
--   accepteren:  update normuren.staging_regel set status='approved', combi_code=suggested_combi_code,
--                    component_id=suggested_component_id where id = '<regel_id>';
--   afwijzen:    update normuren.staging_regel set status='rejected', review_note='<reden>' where id = '<regel_id>';
-- Bouw daarna de approved normurenlaag (consensus per stabu/regelcode/combi/eenheid; couple=gelijke upe):
--   select normuren.build_normuren();
