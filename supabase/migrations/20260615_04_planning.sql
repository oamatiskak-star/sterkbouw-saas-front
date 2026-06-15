-- Sprint 7 Planning Engine: planning ontstaat uit de werktafel; versies als snapshot.
-- Werktafel blijft bron van waarheid. Geen calculatiemotor-wijziging. Reeds toegepast op pmovaz-prod.
create table if not exists public.sterkcalc_planningen (
  id uuid primary key default gen_random_uuid(),
  calculatie_id uuid not null references public.calculaties(id) on delete cascade,
  versie int not null default 1,
  naam text,
  config jsonb not null default '{}'::jsonb,     -- {projecttype, uurtarief, monteurs, uren_per_dag, start_datum, oplevering_dagen}
  snapshot jsonb not null default '{}'::jsonb,    -- berekende fases + samenvatting (reproduceerbaar)
  is_actief boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_planningen_calc on public.sterkcalc_planningen(calculatie_id, versie desc);

alter table public.sterkcalc_planningen enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='sterkcalc_planningen' and policyname='planningen_select') then
    create policy planningen_select on public.sterkcalc_planningen for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='sterkcalc_planningen' and policyname='planningen_insert') then
    create policy planningen_insert on public.sterkcalc_planningen for insert with check (auth.uid() is not null or auth.role() = 'service_role');
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='sterkcalc_planningen' and policyname='planningen_update') then
    create policy planningen_update on public.sterkcalc_planningen for update using (auth.uid() is not null or auth.role() = 'service_role');
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='sterkcalc_planningen' and policyname='planningen_delete') then
    create policy planningen_delete on public.sterkcalc_planningen for delete using (auth.uid() is not null or auth.role() = 'service_role');
  end if;
end $$;
