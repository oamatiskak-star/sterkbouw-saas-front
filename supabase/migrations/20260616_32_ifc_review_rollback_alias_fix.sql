-- Fix: alias-botsing tussen loop-record 'gi' en tabel-alias 'gi' in ifc_review_rollback_object.
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
revoke all on function public.ifc_review_rollback_object(uuid) from public, anon, authenticated;
grant execute on function public.ifc_review_rollback_object(uuid) to service_role;
select 'rollback alias fix toegepast' as status;
