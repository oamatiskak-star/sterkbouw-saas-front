-- Seed 3 assembly-templates (WALL_SPOUW, ROOF_OPBOUW, WINDOW_KOZIJN). Soft-ref naar bestaande combis.
-- Self-guard: rolt terug als een combi_code ontbreekt/inactief is.
insert into assembly.template (code,naam,ifc_entity,bouwdeel,route,rekenmodel_object,nlsfb_code,default_variant_code) values
('WALL_SPOUW','Spouwmuur (buitenwand)','IfcWallStandardCase','Gevel','combi_set',null,'21','spouw'),
('ROOF_OPBOUW','Dakopbouw','IfcRoof','Dak','combi_set',null,'27','hellend'),
('WINDOW_KOZIJN','Kozijn (venster)','IfcWindow','Kozijn','rekenmodel','kozijn','31','hr++')
on conflict (code) do nothing;

insert into assembly.variant (template_id,code,naam,rekenmodel_values)
select t.id, v.code, v.naam, v.vals::jsonb from assembly.template t, lateral (values
  ('WALL_SPOUW','spouw','Spouwmuur','{}'),('WALL_SPOUW','massief','Massieve wand','{}'),
  ('ROOF_OPBOUW','hellend','Hellend dak','{}'),('ROOF_OPBOUW','plat','Plat dak','{}'),
  ('WINDOW_KOZIJN','dubbel','Dubbel glas','{"beglazing":"dubbel"}'),
  ('WINDOW_KOZIJN','hr++','HR++ beglazing','{"beglazing":"HR++"}'),
  ('WINDOW_KOZIJN','triple','Triple glas','{"beglazing":"triple"}')
) v(tcode,code,naam,vals) where t.code=v.tcode
on conflict (template_id,code) do nothing;

insert into assembly.template_item (template_id,variant_code,volgorde,functie,combi_code,base_quantity,factor,eenheid)
select t.id, x.var, x.vol, x.fn, x.combi, x.bq, 1.0, x.eh from assembly.template t, lateral (values
  ('WALL_SPOUW','spouw',1,'binnenspouwblad','CUR-0803','NetSideArea','m²'),
  ('WALL_SPOUW','spouw',2,'isolatie','C3-2304','NetSideArea','m²'),
  ('WALL_SPOUW','spouw',3,'spouwankers','C3-0811','NetSideArea','m²'),
  ('WALL_SPOUW','spouw',4,'buitenspouwblad','CUR-0802','NetSideArea','m²'),
  ('WALL_SPOUW','spouw',5,'afwerking','CUR-0904','NetSideArea','m²'),
  ('WALL_SPOUW','massief',1,'buitenmetselwerk','CUR-0901','NetSideArea','m²'),
  ('WALL_SPOUW','massief',2,'isolatie','C3-2304','NetSideArea','m²'),
  ('ROOF_OPBOUW','hellend',1,'constructie','CUR-1101','NetArea','m²'),
  ('ROOF_OPBOUW','hellend',2,'dakbeschot','CUR-1104','NetArea','m²'),
  ('ROOF_OPBOUW','hellend',3,'isolatie','C3-2302','NetArea','m²'),
  ('ROOF_OPBOUW','hellend',4,'dakbedekking','CB-DAKPAN','NetArea','m²'),
  ('ROOF_OPBOUW','hellend',5,'randafwerking','C3-1209','Perimeter','m¹'),
  ('ROOF_OPBOUW','plat',1,'constructie','CUR-1106','NetArea','m²'),
  ('ROOF_OPBOUW','plat',2,'isolatie','C3-2302','NetArea','m²'),
  ('ROOF_OPBOUW','plat',3,'dakbedekking','CUR-1202','NetArea','m²'),
  ('ROOF_OPBOUW','plat',4,'randafwerking','C3-1209','Perimeter','m¹')
) x(tcode,var,vol,fn,combi,bq,eh) where t.code=x.tcode
on conflict (template_id,variant_code,functie) do nothing;

insert into assembly.rule (template_id,conditie,kies_variant_code,prioriteit)
select t.id, r.cond::jsonb, r.var, r.prio from assembly.template t, lateral (values
  ('WALL_SPOUW','{"property":"IsExternal","op":"=","value":"false"}','massief',10),
  ('ROOF_OPBOUW','{"property":"PredefinedType","op":"in","value":["FLAT_ROOF","FLAT"]}','plat',10),
  ('WINDOW_KOZIJN','{"property":"ThermalTransmittance","op":"<","value":1.0}','triple',10),
  ('WINDOW_KOZIJN','{"property":"ThermalTransmittance","op":"<","value":1.4}','hr++',20)
) r(tcode,cond,var,prio) where t.code=r.tcode;

-- self-guard: ontbrekende/inactieve combi → rollback
do $$ declare m text; begin
  select string_agg(distinct combi_code,', ') into m from assembly.template_item ti
   where not exists (select 1 from combis b where b.code=ti.combi_code and b.actief=true);
  if m is not null then raise exception 'STOP — ontbrekende combi-codes: %', m; end if;
end $$;

select 'assembly seed toegepast' as status;
