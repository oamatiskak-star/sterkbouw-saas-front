-- Fix: harvest.review_queue.source_id/staging_id FK'en wijzen naar sources/staging,
-- niet naar ifc_object. Referentie naar het IFC-object dus in details (jsonb), FK-kolommen NULL.
create or replace function assembly.generate_staged_from_ifc(p_object_id uuid)
returns jsonb language plpgsql as $$
declare
  v_obj    harvest.ifc_object%rowtype;
  v_tpl    assembly.template%rowtype;
  v_variant text;
  r        record;
  it       record;
  v_prop   text; v_op text; v_raw text;
  v_calc   numeric; v_dedup text;
  v_staged int := 0; v_reviews int := 0; v_dups int := 0;
begin
  select * into v_obj from harvest.ifc_object where id = p_object_id;
  if not found then
    return jsonb_build_object('ok',false,'reason','ifc_object niet gevonden','object_id',p_object_id);
  end if;

  -- template op ifc_entity
  select * into v_tpl from assembly.template
   where ifc_entity = v_obj.ifc_entity and status='active'
   order by is_default desc limit 1;
  if not found then
    insert into harvest.review_queue(reden, details)
    values ('assembly-geen-template',
      jsonb_build_object('ifc_object_id',v_obj.id,'ifc_guid',v_obj.ifc_guid,'ifc_entity',v_obj.ifc_entity));
    return jsonb_build_object('ok',false,'reason','geen template voor entity',
      'ifc_entity',v_obj.ifc_entity,'ifc_guid',v_obj.ifc_guid,'reviews',1);
  end if;

  -- Fase 2 dekt alleen combi_set; rekenmodel-route expliciet naar review
  if v_tpl.route = 'rekenmodel' then
    insert into harvest.review_queue(reden, details)
    values ('assembly-route-rekenmodel-buiten-fase2',
      jsonb_build_object('ifc_object_id',v_obj.id,'ifc_guid',v_obj.ifc_guid,'template',v_tpl.code,
        'route','rekenmodel','rekenmodel_object',v_tpl.rekenmodel_object,
        'toelichting','Fase 2 genereert alleen combi_set-regels; rekenmodel-route vereist input-mapping (Fase 3).'));
    return jsonb_build_object('ok',true,'route','rekenmodel','template',v_tpl.code,
      'staged',0,'reviews',1,'ifc_guid',v_obj.ifc_guid,
      'note','rekenmodel-route buiten Fase 2-scope → review_queue');
  end if;

  -- variant kiezen via regels (prioriteit oplopend); anders default
  for r in select conditie, kies_variant_code from assembly.rule
            where template_id = v_tpl.id and status='active'
            order by prioriteit asc loop
    v_prop := r.conditie->>'property';
    v_op   := r.conditie->>'op';
    v_raw  := assembly.ifc_prop(v_obj.propertyset, v_obj.quantities, v_prop);
    if v_raw is null then continue; end if;
    if v_op = '=' and lower(v_raw) = lower(r.conditie->>'value') then
      v_variant := r.kies_variant_code; exit;
    elsif v_op = '<' and v_raw ~ '^-?[0-9.]+$'
          and v_raw::numeric < (r.conditie->>'value')::numeric then
      v_variant := r.kies_variant_code; exit;
    elsif v_op = 'in' and exists (
            select 1 from jsonb_array_elements_text(r.conditie->'value') e
             where lower(e) = lower(v_raw)) then
      v_variant := r.kies_variant_code; exit;
    end if;
  end loop;
  v_variant := coalesce(v_variant, v_tpl.default_variant_code);

  -- per template_item van de gekozen variant
  for it in select * from assembly.template_item
             where template_id = v_tpl.id and status='active'
               and (variant_code = v_variant or variant_code is null)
             order by volgorde loop
    v_raw := assembly.ifc_prop(v_obj.propertyset, v_obj.quantities, it.base_quantity);
    if v_raw is null or v_raw !~ '^-?[0-9.]+$' then
      insert into harvest.review_queue(reden, details)
      values ('assembly-quantity-ontbreekt',
        jsonb_build_object('ifc_object_id',v_obj.id,'ifc_guid',v_obj.ifc_guid,'template',v_tpl.code,'variant',v_variant,
          'functie',it.functie,'base_quantity',it.base_quantity,'combi_code',it.combi_code));
      v_reviews := v_reviews + 1;
      continue;
    end if;
    v_calc  := round(v_raw::numeric * it.factor, 3);
    v_dedup := v_obj.ifc_guid || '|' || it.functie || '|' || it.combi_code;
    insert into assembly.staged_regel(
      ifc_object_id, ifc_guid, assembly_template_id, variant_code, assembly_item_id,
      functie, combi_code, base_quantity, factor, calculated_quantity, eenheid,
      quantity_source, confidence, dedup_key)
    values (
      v_obj.id, v_obj.ifc_guid, v_tpl.id, v_variant, it.id,
      it.functie, it.combi_code, it.base_quantity, it.factor, v_calc, it.eenheid,
      'ifc_quantity', 0.9, v_dedup)
    on conflict (dedup_key) do nothing;
    if found then v_staged := v_staged + 1; else v_dups := v_dups + 1; end if;
  end loop;

  return jsonb_build_object('ok',true,'route','combi_set','template',v_tpl.code,
    'variant',v_variant,'ifc_guid',v_obj.ifc_guid,
    'staged',v_staged,'reviews',v_reviews,'duplicates',v_dups);
end $$;

select 'engine review-fk fix toegepast' as status;
