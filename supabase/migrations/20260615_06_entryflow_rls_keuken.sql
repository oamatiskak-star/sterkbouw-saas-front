-- Recovery sprint P1: canonieke entry-flow mogelijk maken. calculaties/projects stonden INSERT
-- alleen toe voor admin/service_role → nieuwe calculatie aanmaken vanuit de app was onmogelijk.
-- Spiegel de permissieve pattern van de werktafel-tabellen (authenticated mag schrijven).
-- Reeds toegepast op pmovaz-prod.
do $$
begin
  if not exists (select 1 from pg_policies where tablename='calculaties' and policyname='calculaties_auth_insert') then
    create policy calculaties_auth_insert on public.calculaties for insert with check (auth.uid() is not null or auth.role()='service_role');
  end if;
  if not exists (select 1 from pg_policies where tablename='calculaties' and policyname='calculaties_auth_update') then
    create policy calculaties_auth_update on public.calculaties for update using (auth.uid() is not null or auth.role()='service_role');
  end if;
  if not exists (select 1 from pg_policies where tablename='projects' and policyname='projects_auth_select') then
    create policy projects_auth_select on public.projects for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='projects' and policyname='projects_auth_insert') then
    create policy projects_auth_insert on public.projects for insert with check (auth.uid() is not null or auth.role()='service_role');
  end if;
  if not exists (select 1 from pg_policies where tablename='projects' and policyname='projects_auth_update') then
    create policy projects_auth_update on public.projects for update using (auth.uid() is not null or auth.role()='service_role');
  end if;
end $$;

-- P4: keuken-domein calculeerbaar maken (combis onder bouwdeel 20/05 Keuken tegelwerk).
insert into public.combis (code, naam, eenheid, category_code, subcategory_code, source, status, actief) values
  ('CUR-2051','Keukenblok (basis, 3m)','st','20','05','curated','active',true),
  ('CUR-2052','Keukenblok (luxe, 4m incl. apparatuur)','st','20','05','curated','active',true),
  ('CUR-2053','Keuken installatie-aansluiting (water/elektra/afvoer)','st','20','05','curated','active',true)
on conflict do nothing;

insert into public.combi_components (combi_id, type, omschrijving, eenheid, hoeveelheid_per_eenheid, materiaalprijs, arbeidsprijs, materieelprijs, volgorde)
select c.id, v.type::calc_row_type, v.oms, 'st', 1, v.mat, v.arb, 0, v.vg
from public.combis c join (values
  ('CUR-2051','materiaal','Keukenblok basis + bovenkasten',3200,0,0),('CUR-2051','arbeid','Montage keuken',0,650,1),
  ('CUR-2052','materiaal','Keukenblok luxe + apparatuur',8500,0,0),('CUR-2052','arbeid','Montage + inbouw apparatuur',0,1200,1),
  ('CUR-2053','materiaal','Aansluitmateriaal',180,0,0),('CUR-2053','arbeid','Aansluiten water/elektra/afvoer',0,420,1)
) v(code,type,oms,mat,arb,vg) on c.code=v.code and c.source='curated';

insert into public.bouwdeel_combis (bouwdeel_id, combi_id, volgorde)
select b.id, k.id, 2 from public.combis k
join public.bouwdelen b on b.category_code=k.category_code and b.subcategory_code=k.subcategory_code
where k.code in ('CUR-2051','CUR-2052','CUR-2053')
  and not exists (select 1 from public.bouwdeel_combis bc where bc.bouwdeel_id=b.id and bc.combi_id=k.id);
