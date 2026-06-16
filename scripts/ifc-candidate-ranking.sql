-- IFC candidate ranking V1.1 — scoort combi-kandidaten per staged IFC-object.
-- Criteria (gewogen): entity/omschrijving 0.45 · STABU-cat 0.25 · NL-SfB 0.10 basis ·
--   quantity-eenheid 0.10 · property 0.05 · IFC↔NL-SfB-confidence 0.05× ·
--   tie-break: primaire-STABU-cat +0.03 · renovatie-woord (herstel/vervang/infrez/demont/sloop/renovat) -0.05.
-- top_candidate/top_3/ranking_confidence/match_reason; <0.85 → needs_review. Idempotent; re-runbaar.
-- Geen prijzen, geen core-/werktafel-mutatie, geen auto-promotie.
with entity_rule(ent, kw, cats, propkw) as (values
  ('IfcWindow','(kozijn|raam|venster|glas|pui)', array['14','15'], '(glas|hr|beglaz|isolat)'),
  ('IfcDoor','(deur|kozijn)', array['14'], '()'),
  ('IfcWallStandardCase','(wand|metsel|gevel|spouw|kalkzand|cellenbeton)', array['08','09','10','17','21'], '(isolat|rc)'),
  ('IfcSlab','(vloer|dekvloer|kanaalplaat|breedplaat|beton)', array['19','05','06'], '()'),
  ('IfcRoof','(dak|pannen|bitumen|epdm|nok|goot)', array['11','12','13'], '(isolat|rc)')
),
cand as (
  select o.id obj_id, o.ifc_entity, o.quantities, o.propertyset, o.confidence,
         b.code, b.naam combi_naam, b.category_code, b.eenheid, r.kw, r.cats, r.propkw,
         exists(select 1 from jsonb_object_keys(o.quantities) k where k ~* 'area') as heeft_area,
         (b.naam ~* '(herstel|vervang|infrez|demont|sloop|renovat)') as is_renovatie
  from harvest.ifc_object o
  join entity_rule r on r.ent=o.ifc_entity
  join harvest.staging s on s.classification='nlsfb' and s.code=o.nlsfb_code
  join harvest.links l on l.staging_id=s.id and l.core_type='combi'
  join combis b on b.code=l.core_ref and b.actief=true
),
scored as (
  select *, least(1.0, greatest(0, round((
        0.45*(case when combi_naam ~* kw then 1 else 0 end)
      + 0.25*(case when category_code = any(cats) then 1 else 0 end) + 0.10
      + 0.10*(case when (eenheid in ('m²','m2') and heeft_area) or (eenheid ~* '^(st|stuk)' and ifc_entity in ('IfcWindow','IfcDoor')) then 1 else 0 end)
      + 0.05*(case when propertyset <> '{}'::jsonb and propkw <> '()' and combi_naam ~* propkw then 1 else 0 end)
      + 0.05*coalesce(confidence,0)
      + 0.03*(case when category_code = cats[1] then 1 else 0 end)
      - 0.05*(case when is_renovatie then 1 else 0 end))::numeric, 3))) as score
  from cand
),
ranked as (
  select *, concat_ws(' + ',
      case when combi_naam ~* kw then 'entity' end,
      case when category_code = any(cats) then 'cat' end,'NL-SfB',
      case when (eenheid in ('m²','m2') and heeft_area) or (eenheid ~* '^(st|stuk)' and ifc_entity in ('IfcWindow','IfcDoor')) then 'eenheid' end,
      case when propertyset <> '{}'::jsonb and propkw <> '()' and combi_naam ~* propkw then 'property' end,
      case when category_code = cats[1] then 'primair' end,
      case when is_renovatie then '-renovatie' end) as reason,
    row_number() over (partition by obj_id order by score desc, is_renovatie asc, code) rn
  from scored
)
update harvest.ifc_object o set
  top_candidate = (select jsonb_build_object('code',code,'naam',combi_naam,'score',score,'reason',reason) from ranked where obj_id=o.id and rn=1),
  top_3 = (select jsonb_agg(jsonb_build_object('code',code,'naam',combi_naam,'score',score) order by rn) from ranked where obj_id=o.id and rn<=3),
  ranking_confidence = (select score from ranked where obj_id=o.id and rn=1),
  match_reason = (select reason from ranked where obj_id=o.id and rn=1),
  ranking_status = case when (select score from ranked where obj_id=o.id and rn=1) >= 0.85 then 'auto_suggested' else 'needs_review' end
where exists (select 1 from ranked where obj_id=o.id);
