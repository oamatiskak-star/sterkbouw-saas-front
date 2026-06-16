-- Generated Item Review/Promote V1.0 — gecontroleerde stap assembly.generated_item → werktafelregel.
-- Alleen op expliciete promotie (geen auto/bulk). Geen prijzen aangepast (price-kolommen op default).
-- Werktafel blijft SSOT. Deprecated assembly.staged_regel wordt genegeerd. Rollback + auditlog + dup-check.

-- Auditlog
create table if not exists assembly.promotion_log (
  id uuid primary key default gen_random_uuid(),
  generated_item_id uuid references assembly.generated_item(id) on delete set null,
  werktafel_row_id uuid,                 -- soft-ref (row kan na rollback weg zijn)
  calculatie_id uuid,
  actie text not null,                   -- promote | rollback | blocked
  reden text,
  snapshot jsonb,
  created_by text default current_user,
  created_at timestamptz default now()
);
create index if not exists ix_promlog_item on assembly.promotion_log(generated_item_id);

-- Duplicate-check: bestaande werktafelregel met zelfde ifc_guid + functie + combi_code in dezelfde calculatie
create or replace function assembly.werktafel_dup(p_calc uuid, p_guid text, p_functie text, p_combi text)
returns uuid language sql stable as $$
  select w.id from werktafel_rows w
  where w.calculatie_id = p_calc
    and w.meta->>'ifc_guid'  = p_guid
    and w.meta->>'functie'   = p_functie
    and w.meta->>'combi_code'= p_combi
  limit 1;
$$;

-- Promotie: één generated_item → werktafelregel (combi-rij). Expliciet, geen bulk.
create or replace function assembly.promote_generated_item(p_item_id uuid, p_calculatie_id uuid)
returns jsonb language plpgsql as $$
declare
  gi assembly.generated_item%rowtype;
  v_combi_id uuid; v_combi_naam text; v_stabu text;
  v_dup uuid; v_row_id uuid; v_meta jsonb; v_vol int;
begin
  -- uitsluitend canonieke laag (generated_item); staged_regel genegeerd
  select * into gi from assembly.generated_item where id = p_item_id;
  if not found then
    return jsonb_build_object('ok',false,'reason','generated_item niet gevonden');
  end if;
  if gi.status <> 'staged' then
    insert into assembly.promotion_log(generated_item_id,calculatie_id,actie,reden)
      values (gi.id,p_calculatie_id,'blocked',format('status=%s (niet staged)',gi.status));
    return jsonb_build_object('ok',false,'reason',format('status=%s — niet promootbaar',gi.status));
  end if;
  if not exists (select 1 from calculaties where id = p_calculatie_id) then
    return jsonb_build_object('ok',false,'reason','calculatie niet gevonden');
  end if;

  select id, naam, stabu_hoofdstuk into v_combi_id, v_combi_naam, v_stabu
    from combis where code = gi.combi_code and coalesce(actief,true) limit 1;
  if v_combi_id is null then
    insert into assembly.promotion_log(generated_item_id,calculatie_id,actie,reden)
      values (gi.id,p_calculatie_id,'blocked',format('combi %s onbekend/inactief',gi.combi_code));
    return jsonb_build_object('ok',false,'reason',format('combi %s onbekend/inactief',gi.combi_code));
  end if;

  -- duplicate-check (ifc_guid + functie + combi_code) → blokkeren
  v_dup := assembly.werktafel_dup(p_calculatie_id, gi.ifc_guid, gi.functie, gi.combi_code);
  if v_dup is not null then
    insert into assembly.promotion_log(generated_item_id,werktafel_row_id,calculatie_id,actie,reden)
      values (gi.id,v_dup,p_calculatie_id,'blocked','duplicate: bestaande werktafelregel ifc_guid+functie+combi');
    return jsonb_build_object('ok',false,'reason','duplicate — bestaande werktafelregel','existing_row_id',v_dup);
  end if;

  select coalesce(max(volgorde),0)+1 into v_vol from werktafel_rows where calculatie_id=p_calculatie_id;

  -- provenance → meta.aannames (geen prijzen; price-kolommen blijven default 0)
  v_meta := jsonb_build_object(
    'bron','assembly.generated_item',
    'generated_item_id',gi.id,'ifc_guid',gi.ifc_guid,'ifc_object_id',gi.ifc_object_id,
    'template_id',gi.template_id,'variant_code',gi.variant_code,'assembly_item_id',gi.assembly_item_id,
    'functie',gi.functie,'combi_code',gi.combi_code,'quantity_source',gi.quantity_source,
    'factor',gi.factor,'rule_id',gi.rule_id,'confidence',gi.confidence,
    'aannames', jsonb_build_array(
      format('Hoeveelheid %s %s afgeleid uit IFC-%s × factor %s (object %s)',
             gi.quantity, coalesce(gi.eenheid,''), gi.quantity_source, gi.factor, gi.ifc_guid),
      format('Variant ''%s'' via assembly-template (rule %s)', gi.variant_code, coalesce(gi.rule_id::text,'default')),
      format('Gepromoot uit assembly.generated_item %s (confidence %s)', gi.id, coalesce(gi.confidence,0))
    ));

  insert into werktafel_rows(calculatie_id, omschrijving, stabu_code, hoeveelheid, eenheid,
    is_combi, combi_id, volgorde, meta)
  values (p_calculatie_id,
    initcap(gi.functie)||' — '||v_combi_naam, v_stabu, gi.quantity, gi.eenheid,
    true, v_combi_id, v_vol, v_meta)
  returning id into v_row_id;

  update assembly.generated_item set status='approved' where id = gi.id;

  insert into assembly.promotion_log(generated_item_id,werktafel_row_id,calculatie_id,actie,reden,snapshot)
    values (gi.id,v_row_id,p_calculatie_id,'promote','expliciete promotie',
            (select to_jsonb(w) from werktafel_rows w where w.id=v_row_id));

  return jsonb_build_object('ok',true,'werktafel_row_id',v_row_id,'combi_id',v_combi_id,
    'hoeveelheid',gi.quantity,'eenheid',gi.eenheid,'status','approved');
end $$;

-- Rollback: verwijder de gepromote werktafelregel (alleen die uit deze promotie) + zet status terug.
create or replace function assembly.rollback_promotion(p_item_id uuid)
returns jsonb language plpgsql as $$
declare v_row werktafel_rows%rowtype; v_calc uuid;
begin
  select w.* into v_row from werktafel_rows w
   where w.meta->>'generated_item_id' = p_item_id::text
     and w.meta->>'bron' = 'assembly.generated_item'
   order by w.created_at desc limit 1;
  if not found then
    return jsonb_build_object('ok',false,'reason','geen gepromote werktafelregel gevonden voor dit item');
  end if;
  v_calc := v_row.calculatie_id;

  insert into assembly.promotion_log(generated_item_id,werktafel_row_id,calculatie_id,actie,reden,snapshot)
    values (p_item_id,v_row.id,v_calc,'rollback','expliciete rollback',to_jsonb(v_row));

  delete from werktafel_rows where id = v_row.id;             -- verwijdert UITSLUITEND de eigen promotie-rij
  update assembly.generated_item set status='staged' where id = p_item_id;

  return jsonb_build_object('ok',true,'verwijderde_row_id',v_row.id,'calculatie_id',v_calc,'status','staged');
end $$;

select 'assembly generated_item promote/rollback (v1.0) toegepast' as status;
