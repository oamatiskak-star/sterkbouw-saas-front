-- IFC Review Workbench V1.0 — public RPC-laag (service-role-only) bovenop de canonieke
-- assembly.generated_item / v_assembly_staged. Geen prijsmutatie, geen auto-promote, geen bulk
-- zonder review, geen wijziging aan werktafelarchitectuur. generated_item blijft canoniek.

-- 1) Lifecycle afstemmen op review-flow: promote acteert op 'approved' (reviewer-akkoord),
--    rollback zet terug naar 'approved' (review-beslissing blijft, promotie verdwijnt).
create or replace function assembly.promote_generated_item(p_item_id uuid, p_calculatie_id uuid)
returns jsonb language plpgsql as $$
declare
  gi assembly.generated_item%rowtype;
  v_combi_id uuid; v_combi_naam text; v_stabu text;
  v_dup uuid; v_row_id uuid; v_meta jsonb; v_vol int;
begin
  select * into gi from assembly.generated_item where id = p_item_id;
  if not found then return jsonb_build_object('ok',false,'reason','generated_item niet gevonden'); end if;
  if gi.status <> 'approved' then
    insert into assembly.promotion_log(generated_item_id,calculatie_id,actie,reden)
      values (gi.id,p_calculatie_id,'blocked',format('status=%s (alleen approved promootbaar)',gi.status));
    return jsonb_build_object('ok',false,'reason',format('status=%s — alleen approved items promootbaar',gi.status));
  end if;
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

create or replace function assembly.rollback_promotion(p_item_id uuid)
returns jsonb language plpgsql as $$
declare v_row werktafel_rows%rowtype; v_calc uuid;
begin
  select w.* into v_row from werktafel_rows w
   where w.meta->>'generated_item_id' = p_item_id::text and w.meta->>'bron'='assembly.generated_item'
   order by w.created_at desc limit 1;
  if not found then return jsonb_build_object('ok',false,'reason','geen gepromote werktafelregel gevonden'); end if;
  v_calc := v_row.calculatie_id;
  insert into assembly.promotion_log(generated_item_id,werktafel_row_id,calculatie_id,actie,reden,snapshot)
    values (p_item_id,v_row.id,v_calc,'rollback','expliciete rollback',to_jsonb(v_row));
  delete from werktafel_rows where id = v_row.id;
  -- review-beslissing blijft 'approved' (promotie verwijderd, item opnieuw promootbaar)
  update assembly.generated_item set status='approved' where id = p_item_id;
  return jsonb_build_object('ok',true,'verwijderde_row_id',v_row.id,'calculatie_id',v_calc);
end $$;

-- 2) Workbench-state: per IFC-object gegroepeerd + items + KPI's (read-only).
create or replace function public.ifc_review_state()
returns jsonb language sql stable security definer set search_path=public,assembly,harvest as $$
  with it as (
    select gi.*, o.ifc_entity, o.nlsfb_code, o.ranking_confidence, o.match_reason, o.top_candidate,
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
           count(*) n_items,
           count(*) filter (where status='staged') n_staged,
           count(*) filter (where status='approved') n_approved,
           count(*) filter (where status='rejected') n_rejected,
           count(*) filter (where promoted) n_promoted,
           count(*) filter (where duplicate) n_dup,
           jsonb_agg(jsonb_build_object('id',id,'functie',functie,'combi_code',combi_code,
             'omschrijving',combi_naam,'hoeveelheid',quantity,'eenheid',eenheid,'confidence',confidence,
             'status',status,'duplicate',duplicate,'promoted',promoted) order by functie) items
    from it group by ifc_object_id, ifc_guid
  ),
  objx as (
    select obj.*,
      case when n_promoted>0 then 'promoted'
           when n_staged=0 and n_approved>0 then 'approved'
           when n_staged>0 and n_staged<n_items then 'in_review'
           when n_staged=0 and n_approved=0 then 'rejected'
           else 'staged' end as object_state,
      (n_staged=0 and (n_approved - n_promoted) > 0) as promotable
    from obj
  )
  select jsonb_build_object(
    'kpis', jsonb_build_object(
      'objecten_staged',   (select count(*) from objx where object_state='staged'),
      'objecten_in_review',(select count(*) from objx where object_state='in_review'),
      'objecten_approved', (select count(*) from objx where object_state='approved'),
      'objecten_promoted', (select count(*) from objx where object_state='promoted'),
      'duplicate_warnings',(select coalesce(sum(n_dup),0) from objx),
      'rejected_items',    (select coalesce(sum(n_rejected),0) from objx)),
    'objecten', coalesce((select jsonb_agg(to_jsonb(objx) order by ifc_entity, ifc_guid) from objx),'[]'::jsonb));
$$;

-- 3) Item approve/reject (geen promote). Geblokkeerd zolang item gepromoot is (eerst rollback).
create or replace function public.ifc_review_item_status(p_item uuid, p_status text)
returns jsonb language plpgsql security definer set search_path=public,assembly as $$
begin
  if p_status not in ('staged','approved','rejected') then
    return jsonb_build_object('ok',false,'reason','ongeldige status'); end if;
  if exists(select 1 from werktafel_rows w where w.meta->>'generated_item_id'=p_item::text
              and w.meta->>'bron'='assembly.generated_item') then
    return jsonb_build_object('ok',false,'reason','item is gepromoot — eerst rollback'); end if;
  update assembly.generated_item set status=p_status where id=p_item;
  if not found then return jsonb_build_object('ok',false,'reason','item niet gevonden'); end if;
  return jsonb_build_object('ok',true,'item',p_item,'status',p_status);
end $$;

-- 4) Promote heel IFC-object: alleen approved items, via bestaande promote_generated_item(). Geen bulk-auto.
create or replace function public.ifc_review_promote_object(p_object_id uuid, p_calculatie_id uuid)
returns jsonb language plpgsql security definer set search_path=public,assembly as $$
declare gi record; res jsonb; arr jsonb := '[]'::jsonb; n_ok int:=0; n_block int:=0; n_open int;
begin
  select count(*) into n_open from assembly.generated_item where ifc_object_id=p_object_id and status='staged';
  if n_open > 0 then
    return jsonb_build_object('ok',false,'reason',format('%s item(s) nog niet beoordeeld — promote geblokkeerd',n_open));
  end if;
  for gi in select id from assembly.generated_item where ifc_object_id=p_object_id and status='approved' loop
    res := assembly.promote_generated_item(gi.id, p_calculatie_id);
    arr := arr || jsonb_build_array(res);
    if (res->>'ok')='true' then n_ok:=n_ok+1; else n_block:=n_block+1; end if;
  end loop;
  return jsonb_build_object('ok',true,'gepromoot',n_ok,'geblokkeerd',n_block,'resultaten',arr);
end $$;

-- 5) Rollback heel IFC-object: alle actieve promoties uit dit object terugdraaien.
--    (NB: alias-fix t.o.v. eerste versie zit in migratie 20260616_32.)
create or replace function public.ifc_review_rollback_object(p_object_id uuid)
returns jsonb language plpgsql security definer set search_path=public,assembly as $$
declare rec record; res jsonb; n int:=0;
begin
  for rec in
    select distinct g.id from assembly.generated_item g
    join werktafel_rows w on w.meta->>'generated_item_id'=g.id::text and w.meta->>'bron'='assembly.generated_item'
    where g.ifc_object_id=p_object_id loop
    res := assembly.rollback_promotion(rec.id);
    if (res->>'ok')='true' then n:=n+1; end if;
  end loop;
  return jsonb_build_object('ok',true,'teruggedraaid',n);
end $$;

-- service-role-only (workbench draait via server-side API-routes; anon/authenticated geen directe toegang)
revoke all on function public.ifc_review_state() from public, anon, authenticated;
revoke all on function public.ifc_review_item_status(uuid,text) from public, anon, authenticated;
revoke all on function public.ifc_review_promote_object(uuid,uuid) from public, anon, authenticated;
revoke all on function public.ifc_review_rollback_object(uuid) from public, anon, authenticated;
grant execute on function public.ifc_review_state() to service_role;
grant execute on function public.ifc_review_item_status(uuid,text) to service_role;
grant execute on function public.ifc_review_promote_object(uuid,uuid) to service_role;
grant execute on function public.ifc_review_rollback_object(uuid) to service_role;

select 'ifc review workbench api (v1.0) toegepast' as status;
