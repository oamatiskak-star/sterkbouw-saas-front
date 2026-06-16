-- Assembly Engine Fase 2 — één IFC-object → volledige staged opbouw via assembly.template.
-- Nieuwe tabel assembly.generated_item met UNIQUE(ifc_object_id, functie) (voorkomt dubbele opbouw).
-- GEEN werktafel-mutatie, GEEN prijzen, GEEN calculatie, GEEN auto-promotie. Alleen staged generatie.

create table if not exists assembly.generated_item (
  id uuid primary key default gen_random_uuid(),
  ifc_object_id uuid not null references harvest.ifc_object(id) on delete cascade,
  ifc_guid text,                                   -- provenance
  template_id uuid not null references assembly.template(id),
  variant_code text not null,
  assembly_item_id uuid references assembly.template_item(id),  -- provenance
  functie text not null,
  combi_code text not null,                        -- soft-ref combis.code (geen core-koppeling)
  quantity numeric not null,
  eenheid text,
  factor numeric not null default 1.0,             -- provenance
  quantity_source text not null,                   -- bv. NetArea/NetSideArea/Perimeter/Count
  rule_id uuid references assembly.rule(id),       -- provenance: welke rule koos de variant (null=default)
  confidence numeric,
  status text not null default 'staged',           -- staged | approved | rejected
  created_at timestamptz default now(),
  unique (ifc_object_id, functie)
);
create index if not exists ix_gen_item_obj on assembly.generated_item(ifc_object_id);
create index if not exists ix_gen_item_combi on assembly.generated_item(combi_code);

-- Engine: IFC-object → template → variant (via rule) → items → quantity × factor → staged generated_item.
create or replace function assembly.generate_items_from_ifc(p_object_id uuid)
returns jsonb language plpgsql as $$
declare
  v_obj   harvest.ifc_object%rowtype;
  v_tpl   assembly.template%rowtype;
  v_variant text;
  v_rule_id uuid;
  r record; it record;
  v_prop text; v_op text; v_raw text;
  v_qty numeric; v_dup int := 0; v_gen int := 0; v_miss int := 0;
begin
  select * into v_obj from harvest.ifc_object where id = p_object_id;
  if not found then
    return jsonb_build_object('ok',false,'reason','ifc_object niet gevonden','object_id',p_object_id);
  end if;

  -- template selecteren op ifc_entity
  select * into v_tpl from assembly.template
   where ifc_entity = v_obj.ifc_entity and status='active'
   order by is_default desc limit 1;
  if not found then
    return jsonb_build_object('ok',false,'reason','unmatched: geen template',
      'ifc_entity',v_obj.ifc_entity,'ifc_guid',v_obj.ifc_guid);
  end if;

  -- variant bepalen via rules (prioriteit oplopend); rule_id vastleggen, anders default
  for r in select id, conditie, kies_variant_code from assembly.rule
            where template_id = v_tpl.id and status='active'
            order by prioriteit asc loop
    v_prop := r.conditie->>'property';
    v_op   := r.conditie->>'op';
    v_raw  := assembly.ifc_prop(v_obj.propertyset, v_obj.quantities, v_prop);
    if v_raw is null then continue; end if;
    if v_op = '=' and lower(v_raw) = lower(r.conditie->>'value') then
      v_variant := r.kies_variant_code; v_rule_id := r.id; exit;
    elsif v_op = '<' and v_raw ~ '^-?[0-9.]+$'
          and v_raw::numeric < (r.conditie->>'value')::numeric then
      v_variant := r.kies_variant_code; v_rule_id := r.id; exit;
    elsif v_op = 'in' and exists (
            select 1 from jsonb_array_elements_text(r.conditie->'value') e
             where lower(e)=lower(v_raw)) then
      v_variant := r.kies_variant_code; v_rule_id := r.id; exit;
    end if;
  end loop;
  v_variant := coalesce(v_variant, v_tpl.default_variant_code);

  -- rekenmodel-route: combi_set-generatie n.v.t. (variant + rule wel bepaald)
  if v_tpl.route = 'rekenmodel' then
    return jsonb_build_object('ok',true,'route','rekenmodel','template',v_tpl.code,
      'variant',v_variant,'rule_id',v_rule_id,'rekenmodel_object',v_tpl.rekenmodel_object,
      'generated',0,'ifc_guid',v_obj.ifc_guid,
      'note','rekenmodel-route gekozen — geen combi_set-opbouw (Fase 3: rekenmodel-input-mapping)');
  end if;

  -- template_items ophalen → quantity berekenen → staged genereren
  for it in select * from assembly.template_item
             where template_id = v_tpl.id and status='active'
               and (variant_code = v_variant or variant_code is null)
             order by volgorde loop
    v_raw := assembly.ifc_prop(v_obj.propertyset, v_obj.quantities, it.base_quantity);
    if v_raw is null or v_raw !~ '^-?[0-9.]+$' then
      v_miss := v_miss + 1;          -- quantity ontbreekt → niet genereren (error/unmatched item)
      continue;
    end if;
    v_qty := round(v_raw::numeric * it.factor, 3);
    insert into assembly.generated_item(
      ifc_object_id, ifc_guid, template_id, variant_code, assembly_item_id, functie,
      combi_code, quantity, eenheid, factor, quantity_source, rule_id, confidence)
    values (
      v_obj.id, v_obj.ifc_guid, v_tpl.id, v_variant, it.id, it.functie,
      it.combi_code, v_qty, it.eenheid, it.factor, it.base_quantity, v_rule_id,
      case when v_obj.quantities ? it.base_quantity then 0.9 else 0.6 end)
    on conflict (ifc_object_id, functie) do nothing;
    if found then v_gen := v_gen + 1; else v_dup := v_dup + 1; end if;
  end loop;

  return jsonb_build_object('ok',true,'route','combi_set','template',v_tpl.code,
    'variant',v_variant,'rule_id',v_rule_id,'ifc_guid',v_obj.ifc_guid,
    'generated',v_gen,'duplicates',v_dup,'missing_quantity',v_miss);
end $$;

-- Batch: alle IFC-objecten → aggregaat + per-object detail.
create or replace function assembly.generate_items_all()
returns jsonb language plpgsql as $$
declare o record; res jsonb; arr jsonb := '[]'::jsonb;
  t_obj int:=0; t_gen int:=0; t_dup int:=0; t_miss int:=0; t_unmatched int:=0; t_rekenmodel int:=0;
begin
  for o in select id from harvest.ifc_object order by created_at loop
    res := assembly.generate_items_from_ifc(o.id);
    arr := arr || jsonb_build_array(res);
    t_obj := t_obj + 1;
    t_gen := t_gen + coalesce((res->>'generated')::int,0);
    t_dup := t_dup + coalesce((res->>'duplicates')::int,0);
    t_miss := t_miss + coalesce((res->>'missing_quantity')::int,0);
    if (res->>'ok')='false' then t_unmatched := t_unmatched + 1; end if;
    if (res->>'route')='rekenmodel' then t_rekenmodel := t_rekenmodel + 1; end if;
  end loop;
  return jsonb_build_object('objecten',t_obj,'generated_regels',t_gen,'duplicates',t_dup,
    'missing_quantity',t_miss,'unmatched',t_unmatched,'rekenmodel_route',t_rekenmodel,'per_object',arr);
end $$;

select 'assembly generated_item engine (fase 2) toegepast' as status;
