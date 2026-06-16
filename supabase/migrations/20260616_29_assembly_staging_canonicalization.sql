-- Assembly staging canonicalization — assembly.generated_item = enige canonieke staged-laag.
-- assembly.staged_regel wordt DEPRECATED (NIET verwijderd, data behouden). Geen werktafel-/prijs-/promote-logica.

-- 1) Canoniek markeren
comment on table assembly.generated_item is
  'CANONIEK (2026-06-16) — single source of truth voor staged assembly-opbouw uit IFC-objecten. '
  'Gegenereerd door assembly.generate_items_from_ifc()/generate_items_all(). UNIQUE(ifc_object_id,functie).';

-- 2) Deprecated markeren (metadata via COMMENT; data + objecten blijven bestaan)
comment on table assembly.staged_regel is
  'DEPRECATED (2026-06-16) — vervangen door assembly.generated_item (canoniek). '
  'Data behouden voor historie; NIET gebruiken voor nieuwe generatie of consumptie.';
comment on function assembly.generate_staged_from_ifc(uuid) is
  'DEPRECATED (2026-06-16) — gebruik assembly.generate_items_from_ifc(uuid). Behouden, niet uitbreiden.';
comment on function assembly.generate_staged_all() is
  'DEPRECATED (2026-06-16) — gebruik assembly.generate_items_all(). Behouden, niet uitbreiden.';

-- 3) Canonieke read-view (enige aanbevolen leesoppervlak voor staged assembly-opbouw)
create or replace view assembly.v_assembly_staged as
  select gi.id, gi.ifc_object_id, gi.ifc_guid, t.code as template_code, gi.variant_code,
         gi.functie, gi.combi_code, gi.quantity, gi.eenheid, gi.factor,
         gi.quantity_source, gi.rule_id, gi.confidence, gi.status, gi.created_at
  from assembly.generated_item gi
  join assembly.template t on t.id = gi.template_id;
comment on view assembly.v_assembly_staged is
  'CANONIEK leesoppervlak voor staged assembly-opbouw (over assembly.generated_item).';

select 'assembly staging canonicalization toegepast' as status;
