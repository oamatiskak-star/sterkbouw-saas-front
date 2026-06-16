-- IFcWindow rekenmodel-route promootbaar V1.0 — rekenmodel-output → canonieke generated_items,
-- review/promote/rollback identiek aan combi_set. Geen auto-promote, geen prijzen, geen core-mutatie.

-- provenance-meta op canonieke laag (rekenmodel_object, ThermalTransmittance, variant-values, inputs)
alter table assembly.generated_item add column if not exists meta jsonb default '{}'::jsonb;

-- variant-keuze + context herbruikbaar (combi_set én rekenmodel)
create or replace function assembly.pick_variant(p_object_id uuid)
returns jsonb language plpgsql stable as $$
declare v_obj harvest.ifc_object%rowtype; v_tpl assembly.template%rowtype;
  v_variant text; v_rule uuid; r record; v_raw text;
begin
  select * into v_obj from harvest.ifc_object where id=p_object_id;
  if not found then return jsonb_build_object('ok',false,'reason','object niet gevonden'); end if;
  select * into v_tpl from assembly.template where ifc_entity=v_obj.ifc_entity and status='active' order by is_default desc limit 1;
  if not found then return jsonb_build_object('ok',false,'reason','geen template'); end if;
  for r in select id,conditie,kies_variant_code from assembly.rule where template_id=v_tpl.id and status='active' order by prioriteit asc loop
    v_raw := assembly.ifc_prop(v_obj.propertyset,v_obj.quantities,r.conditie->>'property');
    if v_raw is null then continue; end if;
    if (r.conditie->>'op')='=' and lower(v_raw)=lower(r.conditie->>'value') then v_variant:=r.kies_variant_code; v_rule:=r.id; exit;
    elsif (r.conditie->>'op')='<' and v_raw ~ '^-?[0-9.]+$' and v_raw::numeric < (r.conditie->>'value')::numeric then v_variant:=r.kies_variant_code; v_rule:=r.id; exit;
    elsif (r.conditie->>'op')='in' and exists(select 1 from jsonb_array_elements_text(r.conditie->'value') e where lower(e)=lower(v_raw)) then v_variant:=r.kies_variant_code; v_rule:=r.id; exit;
    end if;
  end loop;
  v_variant := coalesce(v_variant, v_tpl.default_variant_code);
  return jsonb_build_object('ok',true,'ifc_object_id',v_obj.id,'ifc_guid',v_obj.ifc_guid,'ifc_entity',v_obj.ifc_entity,
    'template_id',v_tpl.id,'template_code',v_tpl.code,'route',v_tpl.route,'rekenmodel_object',v_tpl.rekenmodel_object,
    'nlsfb_code',v_obj.nlsfb_code,'variant',v_variant,'rule_id',v_rule,
    'quantities',v_obj.quantities,'propertyset',v_obj.propertyset,
    'rekenmodel_values',(select rekenmodel_values from assembly.variant where template_id=v_tpl.id and code=v_variant));
end $$;

-- promote: merge generated_item.meta (rekenmodel-provenance) in werktafel meta + extra aanname
create or replace function assembly.promote_generated_item(p_item_id uuid, p_calculatie_id uuid)
returns jsonb language plpgsql as $$
declare
  gi assembly.generated_item%rowtype;
  v_combi_id uuid; v_combi_naam text; v_stabu text; v_dup uuid; v_row_id uuid; v_meta jsonb; v_vol int;
begin
  select * into gi from assembly.generated_item where id = p_item_id;
  if not found then return jsonb_build_object('ok',false,'reason','generated_item niet gevonden'); end if;
  if gi.status <> 'approved' then
    insert into assembly.promotion_log(generated_item_id,calculatie_id,actie,reden)
      values (gi.id,p_calculatie_id,'blocked',format('status=%s (alleen approved promootbaar)',gi.status));
    return jsonb_build_object('ok',false,'reason',format('status=%s — alleen approved items promootbaar',gi.status)); end if;
  if not exists (select 1 from calculaties where id = p_calculatie_id) then
    return jsonb_build_object('ok',false,'reason','calculatie niet gevonden'); end if;

  select id, naam, stabu_hoofdstuk into v_combi_id, v_combi_naam, v_stabu
    from combis where code = gi.combi_code and coalesce(actief,true) limit 1;
  if v_combi_id is null then
    insert into assembly.promotion_log(generated_item_id,calculatie_id,actie,reden)
      values (gi.id,p_calculatie_id,'blocked',format('combi %s onbekend/inactief',gi.combi_code));
    return jsonb_build_object('ok',false,'reason',format('combi %s onbekend/inactief',gi.combi_code)); end if;

  v_dup := assembly.werktafel_dup(p_calculatie_id, gi.ifc_guid, gi.functie, gi.combi_code);
  if v_dup is not null then
    insert into assembly.promotion_log(generated_item_id,werktafel_row_id,calculatie_id,actie,reden)
      values (gi.id,v_dup,p_calculatie_id,'blocked','duplicate: bestaande werktafelregel ifc_guid+functie+combi');
    return jsonb_build_object('ok',false,'reason','duplicate — bestaande werktafelregel','existing_row_id',v_dup); end if;

  select coalesce(max(volgorde),0)+1 into v_vol from werktafel_rows where calculatie_id=p_calculatie_id;
  v_meta := jsonb_build_object(
    'bron','assembly.generated_item','generated_item_id',gi.id,'ifc_guid',gi.ifc_guid,
    'ifc_object_id',gi.ifc_object_id,'template_id',gi.template_id,'variant_code',gi.variant_code,
    'assembly_item_id',gi.assembly_item_id,'functie',gi.functie,'combi_code',gi.combi_code,
    'quantity_source',gi.quantity_source,'factor',gi.factor,'rule_id',gi.rule_id,'confidence',gi.confidence,
    'aannames', jsonb_build_array(
      format('Hoeveelheid %s %s afgeleid uit IFC-%s × factor %s (object %s)',
             gi.quantity, coalesce(gi.eenheid,''), gi.quantity_source, gi.factor, gi.ifc_guid),
      format('Variant ''%s'' via assembly-template (rule %s)', gi.variant_code, coalesce(gi.rule_id::text,'default')),
      format('Gepromoot uit assembly.generated_item %s (confidence %s)', gi.id, coalesce(gi.confidence,0))));
  -- rekenmodel-provenance (indien aanwezig) meenemen
  if coalesce(gi.meta,'{}'::jsonb) <> '{}'::jsonb then
    v_meta := v_meta || jsonb_build_object('rekenmodel', gi.meta);
    v_meta := jsonb_set(v_meta,'{aannames}', (v_meta->'aannames') || to_jsonb(
      format('Rekenmodel %s, variant %s (ThermalTransmittance=%s)',
             gi.meta->>'rekenmodel_object', gi.variant_code, coalesce(gi.meta->>'thermal_transmittance','—'))));
  end if;

  insert into werktafel_rows(calculatie_id, omschrijving, stabu_code, hoeveelheid, eenheid,
    is_combi, combi_id, volgorde, meta)
  values (p_calculatie_id, initcap(gi.functie)||' — '||v_combi_naam, v_stabu, gi.quantity, gi.eenheid,
    true, v_combi_id, v_vol, v_meta)
  returning id into v_row_id;

  insert into assembly.promotion_log(generated_item_id,werktafel_row_id,calculatie_id,actie,reden,snapshot)
    values (gi.id,v_row_id,p_calculatie_id,'promote','expliciete promotie',
            (select to_jsonb(w) from werktafel_rows w where w.id=v_row_id));
  return jsonb_build_object('ok',true,'werktafel_row_id',v_row_id,'hoeveelheid',gi.quantity,'eenheid',gi.eenheid);
end $$;

-- context-RPC (service-role): IFC + variant + rekenmodel_values voor de JS-rekenmodel-runner
create or replace function public.ifc_rekenmodel_context(p_object_id uuid)
returns jsonb language sql stable security definer set search_path=public,assembly,harvest as $$
  select assembly.pick_variant(p_object_id);
$$;

-- staging-RPC (service-role): rekenmodel-output → canonieke generated_items
create or replace function public.ifc_stage_rekenmodel_items(p_object_id uuid, p_items jsonb, p_meta jsonb)
returns jsonb language plpgsql security definer set search_path=public,assembly,harvest as $$
declare ctx jsonb; it jsonb; v_een text; v_func text; v_combi text; n int:=0;
begin
  ctx := assembly.pick_variant(p_object_id);
  if (ctx->>'ok')<>'true' then return ctx; end if;
  if (ctx->>'route')<>'rekenmodel' then return jsonb_build_object('ok',false,'reason','geen rekenmodel-route'); end if;
  for it in select value from jsonb_array_elements(p_items) loop
    v_func := it->>'functie'; v_combi := it->>'combi_code';
    select eenheid into v_een from combis where code=v_combi limit 1;
    insert into assembly.generated_item(ifc_object_id, ifc_guid, template_id, variant_code, assembly_item_id,
      functie, combi_code, quantity, eenheid, factor, quantity_source, rule_id, confidence, meta)
    values (p_object_id, ctx->>'ifc_guid', (ctx->>'template_id')::uuid, ctx->>'variant', null,
      v_func, v_combi, (it->>'hoeveelheid')::numeric, coalesce(it->>'eenheid', v_een),
      1.0, 'rekenmodel:'||(ctx->>'rekenmodel_object'), nullif(ctx->>'rule_id','')::uuid, 0.8,
      coalesce(p_meta,'{}'::jsonb) || jsonb_build_object('functie',v_func))
    on conflict (ifc_object_id,functie) do nothing;
    if found then n:=n+1; end if;
  end loop;
  return jsonb_build_object('ok',true,'staged',n,'variant',ctx->>'variant','rekenmodel_object',ctx->>'rekenmodel_object');
end $$;

-- state uitbreiden: rekenmodel-route-objecten zonder items tonen als 'te_genereren'
create or replace function public.ifc_review_state()
returns jsonb language sql stable security definer set search_path=public,assembly,harvest as $$
  with it as (
    select gi.*, o.ifc_entity, o.nlsfb_code, o.ranking_confidence, o.match_reason,
           t.code as template_code, b.naam as combi_naam,
           exists(select 1 from werktafel_rows w where w.meta->>'generated_item_id'=gi.id::text
                    and w.meta->>'bron'='assembly.generated_item') as promoted,
           exists(select 1 from werktafel_rows w where w.meta->>'ifc_guid'=gi.ifc_guid
                    and w.meta->>'functie'=gi.functie and w.meta->>'combi_code'=gi.combi_code
                    and coalesce(w.meta->>'generated_item_id','') <> gi.id::text) as duplicate
    from assembly.generated_item gi
    join harvest.ifc_object o on o.id = gi.ifc_object_id
    join assembly.template t on t.id = gi.template_id
    left join combis b on b.code = gi.combi_code
  ),
  obj as (
    select ifc_object_id, ifc_guid, max(ifc_entity) ifc_entity, max(nlsfb_code) nlsfb_code,
           max(template_code) template_code, max(variant_code) variant_code,
           round(avg(confidence),2) confidence, string_agg(distinct quantity_source,', ') quantity_source,
           max(ranking_confidence) ranking_confidence, max(match_reason) match_reason,
           count(*) n_items, count(*) filter (where status='staged') n_staged,
           count(*) filter (where status='approved') n_approved, count(*) filter (where status='rejected') n_rejected,
           count(*) filter (where promoted) n_promoted, count(*) filter (where duplicate) n_dup,
           jsonb_agg(jsonb_build_object('id',id,'functie',functie,'combi_code',combi_code,
             'omschrijving',combi_naam,'hoeveelheid',quantity,'eenheid',eenheid,'confidence',confidence,
             'status',status,'duplicate',duplicate,'promoted',promoted) order by functie) items
    from it group by ifc_object_id, ifc_guid
  ),
  objx as (
    select obj.*, false as needs_generation,
      case when n_promoted>0 then 'promoted'
           when n_staged=0 and n_approved>0 then 'approved'
           when n_staged>0 and n_staged<n_items then 'in_review'
           when n_staged=0 and n_approved=0 then 'rejected'
           else 'staged' end as object_state,
      (n_staged=0 and (n_approved - n_promoted) > 0) as promotable
    from obj
  ),
  gen as (  -- rekenmodel-route objecten zonder gegenereerde items
    select o.id as ifc_object_id, o.ifc_guid, o.ifc_entity, o.nlsfb_code, t.code template_code,
           (assembly.pick_variant(o.id)->>'variant') variant_code, null::numeric confidence,
           t.rekenmodel_object quantity_source, o.ranking_confidence, o.match_reason
    from harvest.ifc_object o
    join assembly.template t on t.ifc_entity=o.ifc_entity and t.status='active' and t.route='rekenmodel'
    where not exists (select 1 from assembly.generated_item gi where gi.ifc_object_id=o.id)
  )
  select jsonb_build_object(
    'kpis', jsonb_build_object(
      'objecten_staged',   (select count(*) from objx where object_state='staged'),
      'objecten_in_review',(select count(*) from objx where object_state='in_review'),
      'objecten_approved', (select count(*) from objx where object_state='approved'),
      'objecten_promoted', (select count(*) from objx where object_state='promoted'),
      'objecten_te_genereren',(select count(*) from gen),
      'duplicate_warnings',(select coalesce(sum(n_dup),0) from objx),
      'rejected_items',    (select coalesce(sum(n_rejected),0) from objx)),
    'objecten', coalesce((select jsonb_agg(to_jsonb(objx) order by ifc_entity, ifc_guid) from objx),'[]'::jsonb)
      || coalesce((select jsonb_agg(jsonb_build_object(
            'ifc_object_id',ifc_object_id,'ifc_guid',ifc_guid,'ifc_entity',ifc_entity,'nlsfb_code',nlsfb_code,
            'template_code',template_code,'variant_code',variant_code,'confidence',confidence,
            'quantity_source',quantity_source,'ranking_confidence',ranking_confidence,'match_reason',match_reason,
            'n_items',0,'n_staged',0,'n_approved',0,'n_rejected',0,'n_promoted',0,'n_dup',0,
            'items','[]'::jsonb,'needs_generation',true,'object_state','te_genereren','promotable',false)
          ) from gen),'[]'::jsonb));
$$;

revoke all on function public.ifc_rekenmodel_context(uuid) from public, anon, authenticated;
revoke all on function public.ifc_stage_rekenmodel_items(uuid,jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.ifc_rekenmodel_context(uuid) to service_role;
grant execute on function public.ifc_stage_rekenmodel_items(uuid,jsonb,jsonb) to service_role;

select 'ifc window rekenmodel-route (v1.0) toegepast' as status;
