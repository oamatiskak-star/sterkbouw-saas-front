-- Promotie: staged IFC-object → werktafelregel (alleen op expliciete aanroep, geen auto).
-- Plaatst de gekozen combi als combi-regel met hoeveelheid = IFC-area-quantity en
-- meta.aannames = IFC-properties + IFC-provenance. Geen prijswijziging (componenten 1:1 uit de combi).
-- Toegepast op pmovaz-prod 2026-06-16 (mirror van apply_migration 20260616_20).
create or replace function harvest.promote_ifc_object(p_calc uuid, p_ifc uuid, p_combi text)
returns uuid language plpgsql as $$
declare
  v_obj harvest.ifc_object%rowtype; v_combi combis%rowtype;
  v_chapter uuid; v_hoofd uuid; v_row uuid; v_area numeric; v_hv numeric;
  v_aannames jsonb; v_meta jsonb;
begin
  select * into v_obj from harvest.ifc_object where id = p_ifc;
  select * into v_combi from combis where code = p_combi and actief = true;
  if v_obj.id is null then raise exception 'ifc_object niet gevonden'; end if;
  if v_combi.id is null then raise exception 'combi % niet gevonden/actief', p_combi; end if;
  if v_combi.category_code is not null and v_combi.subcategory_code is not null then
    select id into v_chapter from werktafel_chapters
      where calculatie_id=p_calc and code=v_combi.category_code and sub_code=v_combi.subcategory_code limit 1;
    if v_chapter is null then
      select id into v_hoofd from werktafel_chapters
        where calculatie_id=p_calc and code=v_combi.category_code and parent_id is null limit 1;
      if v_hoofd is null then
        insert into werktafel_chapters(calculatie_id,code,naam,volgorde,is_structuur)
          values(p_calc,v_combi.category_code,
                 coalesce((select title from sterkcalc_visual_categories where code=v_combi.category_code),'Hoofdstuk '||v_combi.category_code),999,true)
          returning id into v_hoofd;
      end if;
      insert into werktafel_chapters(calculatie_id,parent_id,code,sub_code,naam,volgorde,is_structuur)
        values(p_calc,v_hoofd,v_combi.category_code,v_combi.subcategory_code,
               coalesce((select title from sterkcalc_visual_subcategories where category_code=v_combi.category_code and code=v_combi.subcategory_code),
                        v_combi.category_code||'.'||v_combi.subcategory_code),999,true)
        returning id into v_chapter;
    end if;
  end if;
  select max(value::numeric) into v_area from jsonb_each_text(v_obj.quantities) q(key,value) where key ~* 'area';
  v_hv := case when v_combi.eenheid in ('m²','m2') then coalesce(v_area,1) else 1 end;
  select coalesce(jsonb_agg(jsonb_build_object('key',prop.key,'waarde',prop.value,'bron','IFC '||ps.key)),'[]'::jsonb)
    into v_aannames from jsonb_each(v_obj.propertyset) ps(key,val), jsonb_each_text(ps.val) prop(key,value);
  v_meta := jsonb_build_object('bron', jsonb_build_object('type','ifc','source_file',v_obj.source_file,'ifc_guid',v_obj.ifc_guid,'ifc_entity',v_obj.ifc_entity),'aannames', v_aannames);
  insert into werktafel_rows(calculatie_id,chapter_id,stabu_code,omschrijving,type,is_combi,combi_id,hoeveelheid,eenheid,status,volgorde,meta)
    values(p_calc,v_chapter,v_combi.code, v_obj.ifc_entity||' — '||v_combi.naam,'combi',true,v_combi.id,v_hv,coalesce(v_combi.eenheid,'st'),'concept',0,v_meta)
    returning id into v_row;
  insert into werktafel_row_components(row_id,type,stabu_code,omschrijving,hoeveelheid,eenheid,norm,materiaalprijs,arbeidsprijs,materieelprijs,volgorde)
    select v_row,k.type,k.stabu_code,k.omschrijving,k.hoeveelheid_per_eenheid,k.eenheid,k.norm,k.materiaalprijs,k.arbeidsprijs,k.materieelprijs,k.volgorde
    from combi_components k where k.combi_id=v_combi.id;
  update harvest.ifc_object set status='promoted' where id=p_ifc;
  return v_row;
end $$;
