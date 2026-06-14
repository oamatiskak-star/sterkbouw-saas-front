-- SterkCalc Visions+ — individuele objectherkenning (additief, niet-destructief).
-- Spiegelt ruimtes→ruimte_types: individuele objecten → groepering in bouwdeel-types.
-- Generiek: kozijn/deur/raam/radiator/sanitair/keuken/trap/dakraam/… (niet object-specifiek).
-- AI uitsluitend adviserend: herkent/meet/classificeert; raakt AK/ABK/risico/winst NOOIT.

create table if not exists public.calculatie_objecten (
  id uuid primary key default gen_random_uuid(),
  calculatie_id uuid not null references public.calculaties(id) on delete cascade,
  ruimte_id uuid references public.calculatie_ruimtes(id) on delete set null,
  type_id uuid references public.calculatie_bouwdeel_types(id) on delete set null,
  vision_analysis_id uuid references public.calculatie_vision_analyses(id) on delete set null,
  naam text,
  klasse text,                 -- generieke objectklasse (Kozijn/Deur/Raam/Radiator/Sanitair/Keuken/…)
  lengte numeric(10,1), breedte numeric(10,1), hoogte numeric(10,1),
  aantal int not null default 1,
  materiaal text,
  confidence numeric(5,2),
  source text not null default 'ai',
  created_at timestamptz not null default now()
);
create index if not exists idx_objecten_calc on public.calculatie_objecten(calculatie_id, type_id);

alter table public.calculatie_objecten enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='calculatie_objecten' and policyname='calculatie_objecten_select') then
    create policy calculatie_objecten_select on public.calculatie_objecten for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='calculatie_objecten' and policyname='calculatie_objecten_insert') then
    create policy calculatie_objecten_insert on public.calculatie_objecten for insert with check (auth.uid() is not null or auth.role() = 'service_role');
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='calculatie_objecten' and policyname='calculatie_objecten_update') then
    create policy calculatie_objecten_update on public.calculatie_objecten for update using (auth.uid() is not null or auth.role() = 'service_role');
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='calculatie_objecten' and policyname='calculatie_objecten_delete') then
    create policy calculatie_objecten_delete on public.calculatie_objecten for delete using (auth.uid() is not null or auth.role() = 'service_role');
  end if;
end $$;
