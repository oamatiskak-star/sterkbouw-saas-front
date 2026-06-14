-- ============================================================
-- SterkCalc Next-Gen — additieve architectuur (niet-destructief)
-- Bereidt de volledige eindarchitectuur voor: bouwdelen-laag,
-- hiërarchie Ruimte→Bouwdeel→Combi→Component→STABU, en de AI-laag
-- (ruimte-types/bouwdeel-types/groepering) — UI volgt in latere slices.
-- Raakt L2 (sterkcalc_visual_*) en bestaande data niet aan.
-- ============================================================

-- Browser-keten koppelingen
alter table public.combis     add column if not exists category_code text;
alter table public.combis     add column if not exists subcategory_code text;
alter table public.combis     add column if not exists source text not null default 'manual';
alter table public.combis     add column if not exists status text not null default 'active';
create index if not exists idx_combis_subcat on public.combis(subcategory_code);

alter table public.bouwdelen  add column if not exists category_code text;
alter table public.bouwdelen  add column if not exists subcategory_code text;
create index if not exists idx_bouwdelen_subcat on public.bouwdelen(subcategory_code);

-- AI-laag: ruimte-types (groepering/herhaling)
create table if not exists public.calculatie_ruimte_types (
  id uuid primary key default gen_random_uuid(),
  calculatie_id uuid not null references public.calculaties(id) on delete cascade,
  naam text not null,
  aantal int not null default 1,
  gem_lengte numeric(10,1), gem_breedte numeric(10,1), gem_hoogte numeric(10,1),
  vloer_m2 numeric(12,2), wand_m2 numeric(12,2), plafond_m2 numeric(12,2), netto_wand_m2 numeric(12,2),
  afwijking jsonb not null default '{}'::jsonb,
  confidence numeric(5,2),
  voorgestelde_bouwdelen jsonb not null default '[]'::jsonb,
  voorgestelde_combis jsonb not null default '[]'::jsonb,
  source text not null default 'ai',
  created_at timestamptz not null default now()
);
create index if not exists idx_ruimte_types_calc on public.calculatie_ruimte_types(calculatie_id);

-- AI-laag: individuele ruimtes (gekoppeld aan hun type)
create table if not exists public.calculatie_ruimtes (
  id uuid primary key default gen_random_uuid(),
  calculatie_id uuid not null references public.calculaties(id) on delete cascade,
  type_id uuid references public.calculatie_ruimte_types(id) on delete set null,
  naam text,
  lengte numeric(10,1), breedte numeric(10,1), hoogte numeric(10,1),
  vloer_m2 numeric(12,2), wand_m2 numeric(12,2), plafond_m2 numeric(12,2), netto_wand_m2 numeric(12,2),
  confidence numeric(5,2),
  source text not null default 'ai',
  created_at timestamptz not null default now()
);
create index if not exists idx_ruimtes_calc on public.calculatie_ruimtes(calculatie_id, type_id);

-- AI-laag: openingen per ruimte
create table if not exists public.calculatie_openingen (
  id uuid primary key default gen_random_uuid(),
  ruimte_id uuid not null references public.calculatie_ruimtes(id) on delete cascade,
  type text not null,
  breedte numeric(10,1), hoogte numeric(10,1), aantal int not null default 1,
  created_at timestamptz not null default now()
);
create index if not exists idx_openingen_ruimte on public.calculatie_openingen(ruimte_id);

-- AI-laag: bouwdeel-/object-types (groepering van objecten/constructie/installaties)
create table if not exists public.calculatie_bouwdeel_types (
  id uuid primary key default gen_random_uuid(),
  calculatie_id uuid not null references public.calculaties(id) on delete cascade,
  naam text not null,
  object_klasse text,
  aantal int not null default 1,
  afmetingen jsonb not null default '{}'::jsonb,
  afwijking jsonb not null default '{}'::jsonb,
  materiaaltype text,
  confidence numeric(5,2),
  voorgestelde_combis jsonb not null default '[]'::jsonb,
  source text not null default 'ai',
  created_at timestamptz not null default now()
);
create index if not exists idx_bouwdeel_types_calc on public.calculatie_bouwdeel_types(calculatie_id);

-- Hiërarchie op werktafelregels (Ruimte→Bouwdeel→Combi→Component→STABU)
alter table public.werktafel_rows add column if not exists bouwdeel_id uuid references public.bouwdelen(id) on delete set null;
alter table public.werktafel_rows add column if not exists ruimte_id uuid references public.calculatie_ruimtes(id) on delete set null;

-- RLS (permissief gespiegeld van bestaande tabellen)
do $$
declare t text;
begin
  foreach t in array array['calculatie_ruimte_types','calculatie_ruimtes','calculatie_openingen','calculatie_bouwdeel_types'] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format($p$create policy %I on public.%I for select using (true);$p$, t||'_select', t);
    execute format($p$create policy %I on public.%I for insert with check (auth.uid() is not null or auth.role() = 'service_role');$p$, t||'_insert', t);
    execute format($p$create policy %I on public.%I for update using (auth.uid() is not null or auth.role() = 'service_role');$p$, t||'_update', t);
    execute format($p$create policy %I on public.%I for delete using (auth.uid() is not null or auth.role() = 'service_role');$p$, t||'_delete', t);
  end loop;
end $$;
