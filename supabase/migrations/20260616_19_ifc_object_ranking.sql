-- IFC candidate ranking — kolommen voor gerangschikte topselectie per IFC-object.
-- Geen werktafel-/core-mutatie; alles blijft staged. Toegepast op pmovaz-prod 2026-06-16.
alter table harvest.ifc_object
  add column if not exists top_candidate jsonb,
  add column if not exists top_3 jsonb,
  add column if not exists ranking_confidence numeric,
  add column if not exists match_reason text,
  add column if not exists ranking_status text;  -- auto_suggested | needs_review
