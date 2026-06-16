-- Normuren Fase 4 — review/approve RPC-laag (service-role-only) over de privileged normuren-laag.
-- Geen auto-approval (per-regel expliciet); approved → normuren.build_normuren() vult consensuslaag.

create or replace function public.normuren_review_state(p_batch uuid default null, p_status text default null, p_limit int default 200)
returns jsonb language sql stable security definer set search_path=public,normuren as $$
  with keyc as (
    select stabu_code, regelcode, eenheid_norm, count(*) c
    from normuren.staging_regel group by stabu_code, regelcode, eenheid_norm
  ),
  base as (
    select s.*, b.naam as suggested_naam,
      (select c from keyc k where k.stabu_code is not distinct from s.stabu_code
        and k.regelcode is not distinct from s.regelcode and k.eenheid_norm is not distinct from s.eenheid_norm) as n_waarnemingen
    from normuren.staging_regel s
    left join combis b on b.code = s.suggested_combi_code
    where (p_batch is null or s.batch_id=p_batch) and (p_status is null or s.status=p_status)
  )
  select jsonb_build_object(
    'kpis', jsonb_build_object(
      'staged',(select count(*) from normuren.staging_regel where status='staged'),
      'approved',(select count(*) from normuren.staging_regel where status='approved'),
      'rejected',(select count(*) from normuren.staging_regel where status='rejected'),
      'met_suggestie',(select count(*) from normuren.staging_regel where suggested_combi_code is not null),
      'high_confidence',(select count(*) from normuren.staging_regel where suggest_high_confidence),
      'conflicten',(select count(*) from normuren.staging_regel where review_note ilike '%conflict%'),
      'normuren_approved',(select count(*) from normuren.normuur)),
    'batches',(select coalesce(jsonb_agg(jsonb_build_object('id',ib.id,'source_file',ib.source_file,
        'arbeidregels',ib.arbeidregels,
        'staged',(select count(*) from normuren.staging_regel s where s.batch_id=ib.id and s.status='staged'),
        'approved',(select count(*) from normuren.staging_regel s where s.batch_id=ib.id and s.status='approved'),
        'rejected',(select count(*) from normuren.staging_regel s where s.batch_id=ib.id and s.status='rejected'))
        order by ib.created_at desc),'[]'::jsonb) from normuren.import_batch ib),
    'totaal_filter',(select count(*) from base),
    'regels',(select coalesce(jsonb_agg(r),'[]'::jsonb) from (
        select jsonb_build_object('id',id,'source_row',source_row,'regelcode',regelcode,'omschrijving',omschrijving,
          'stabu_code',stabu_code,'eenheid',eenheid_norm,'uren_per_eenheid',uren_per_eenheid,'uren_bron',uren_bron,
          'is_correctie',is_correctie,'confidence',confidence,'status',status,'review_note',review_note,
          'suggested_combi_code',suggested_combi_code,'suggested_naam',suggested_naam,'match_score',match_score,
          'match_reason',match_reason,'high_confidence',suggest_high_confidence,'n_waarnemingen',n_waarnemingen,
          'combi_code',combi_code) r
        from base order by source_row limit greatest(1,least(p_limit,1000))) q));
$$;

create or replace function public.normuren_set_status(p_item uuid, p_status text, p_accept_combi boolean default false)
returns jsonb language plpgsql security definer set search_path=public,normuren as $$
declare s normuren.staging_regel%rowtype;
begin
  if p_status not in ('staged','approved','rejected') then return jsonb_build_object('ok',false,'reason','ongeldige status'); end if;
  select * into s from normuren.staging_regel where id=p_item;
  if not found then return jsonb_build_object('ok',false,'reason','regel niet gevonden'); end if;
  update normuren.staging_regel set
    status=p_status,
    combi_code = case when p_status='approved' and p_accept_combi and s.suggested_combi_code is not null then s.suggested_combi_code else combi_code end,
    component_id = case when p_status='approved' and p_accept_combi and s.suggested_component_id is not null then s.suggested_component_id else component_id end
  where id=p_item;
  return jsonb_build_object('ok',true,'item',p_item,'status',p_status,
    'combi_code',(select combi_code from normuren.staging_regel where id=p_item));
end $$;

create or replace function public.normuren_build()
returns jsonb language plpgsql security definer set search_path=public,normuren as $$
declare n int;
begin
  n := normuren.build_normuren();
  return jsonb_build_object('ok',true,'verwerkt',n,'normuren_totaal',(select count(*) from normuren.normuur));
end $$;

revoke all on function public.normuren_review_state(uuid,text,int) from public, anon, authenticated;
revoke all on function public.normuren_set_status(uuid,text,boolean) from public, anon, authenticated;
revoke all on function public.normuren_build() from public, anon, authenticated;
grant execute on function public.normuren_review_state(uuid,text,int) to service_role;
grant execute on function public.normuren_set_status(uuid,text,boolean) to service_role;
grant execute on function public.normuren_build() to service_role;

select 'normuren review api (fase 4) toegepast' as status;
