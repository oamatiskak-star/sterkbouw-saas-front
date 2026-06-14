-- ============================================================
-- SterkCalc Calculatie Werktafel — datamodel (additief, niet-destructief)
-- Doel-DB: pmovazftwoxjopqkuuhp (sterkbouww). Raakt bestaande tabellen
-- (calculatie_regels, v_calculatie_2jours) NIET aan. RLS-model gespiegeld
-- van bestaande tabellen: SELECT permissief, write voor authenticated +
-- service_role. De werktafel_*-tabellen zijn de PRIMAIRE calculatiebron.
-- ============================================================

-- ── ENUMS ──────────────────────────────────────────────────
do $$ begin
  create type calc_row_type as enum ('arbeid','materiaal','materieel','combi','stelpost');
exception when duplicate_object then null; end $$;
do $$ begin
  create type calc_row_status as enum ('concept','definitief','vervallen','optie');
exception when duplicate_object then null; end $$;

-- ── COMBI-BIBLIOTHEEK ──────────────────────────────────────
create table if not exists public.combi_categories (
  id uuid primary key default gen_random_uuid(),
  naam text not null,
  icoon text,
  volgorde int not null default 0,
  user_id uuid,                                  -- null = gedeeld/systeem
  created_at timestamptz not null default now()
);

create table if not exists public.combis (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.combi_categories(id) on delete set null,
  code text,
  naam text not null,
  omschrijving text,
  stabu_hoofdstuk text,
  eenheid text not null default 'm²',
  is_parametrisch boolean not null default false,
  parameters jsonb not null default '{}'::jsonb,
  actief boolean not null default true,
  user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.combi_components (
  id uuid primary key default gen_random_uuid(),
  combi_id uuid not null references public.combis(id) on delete cascade,
  type calc_row_type not null,
  stabu_code text,
  omschrijving text,
  hoeveelheid_per_eenheid numeric(14,4) not null default 0,
  eenheid text,
  norm numeric(14,4),
  materiaalprijs numeric(14,4) not null default 0,
  arbeidsprijs numeric(14,4) not null default 0,
  materieelprijs numeric(14,4) not null default 0,
  formule text,
  volgorde int not null default 0
);
create index if not exists idx_combi_components_combi on public.combi_components(combi_id, volgorde);

-- ── WERKTAFEL-KERN (primaire calculatiebron) ───────────────
create table if not exists public.werktafel_chapters (
  id uuid primary key default gen_random_uuid(),
  calculatie_id uuid not null references public.calculaties(id) on delete cascade,
  parent_id uuid references public.werktafel_chapters(id) on delete cascade,
  stabu_hoofdstuk text,
  code text,
  naam text not null,
  volgorde int not null default 0,
  collapsed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_wt_chapters_calc on public.werktafel_chapters(calculatie_id, parent_id, volgorde);

create table if not exists public.werktafel_rows (
  id uuid primary key default gen_random_uuid(),
  calculatie_id uuid not null references public.calculaties(id) on delete cascade,
  chapter_id uuid references public.werktafel_chapters(id) on delete set null,
  regelnr int,
  stabu_code text,
  omschrijving text,
  type calc_row_type not null default 'arbeid',
  hoeveelheid numeric(14,3) not null default 0,
  eenheid text,
  norm numeric(14,4),
  uren numeric(14,3),
  materiaalprijs numeric(14,4) not null default 0,
  arbeidsprijs numeric(14,4) not null default 0,
  materieelprijs numeric(14,4) not null default 0,
  kostprijs numeric(14,2),
  opslag_perc numeric(7,4) not null default 0,
  verkoopprijs numeric(14,2),
  status calc_row_status not null default 'concept',
  is_combi boolean not null default false,
  combi_id uuid references public.combis(id) on delete set null,
  volgorde int not null default 0,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_wt_rows_calc on public.werktafel_rows(calculatie_id, chapter_id, volgorde);

create table if not exists public.werktafel_row_components (
  id uuid primary key default gen_random_uuid(),
  row_id uuid not null references public.werktafel_rows(id) on delete cascade,
  type calc_row_type not null,
  stabu_code text,
  omschrijving text,
  hoeveelheid numeric(14,4) not null default 0,    -- per 1 eenheid van de combi-regel
  eenheid text,
  norm numeric(14,4),
  materiaalprijs numeric(14,4) not null default 0,
  arbeidsprijs numeric(14,4) not null default 0,
  materieelprijs numeric(14,4) not null default 0,
  volgorde int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_wt_row_comp_row on public.werktafel_row_components(row_id, volgorde);

-- ── BOUWDELEN-BIBLIOTHEEK (Fase 3) ─────────────────────────
create table if not exists public.bouwdelen (
  id uuid primary key default gen_random_uuid(),
  code text,
  naam text not null,
  omschrijving text,
  afbeelding_url text,
  categorie text,
  user_id uuid,
  created_at timestamptz not null default now()
);
create table if not exists public.bouwdeel_combis (
  id uuid primary key default gen_random_uuid(),
  bouwdeel_id uuid not null references public.bouwdelen(id) on delete cascade,
  combi_id uuid not null references public.combis(id) on delete cascade,
  standaard_hoeveelheid numeric(14,3),
  volgorde int not null default 0,
  unique (bouwdeel_id, combi_id)
);

-- ── PLANNING / BESTELLEN / VERSIES / RAPPORTAGES (Fase 4-6) ─
create table if not exists public.planning_tasks (
  id uuid primary key default gen_random_uuid(),
  calculatie_id uuid not null references public.calculaties(id) on delete cascade,
  fase_key text,
  naam text not null,
  start_dag int,
  duur_dagen numeric(8,2),
  uren numeric(12,2),
  afhankelijk_van uuid references public.planning_tasks(id) on delete set null,
  volgorde int not null default 0,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_planning_calc on public.planning_tasks(calculatie_id, volgorde);

create table if not exists public.material_orders (
  id uuid primary key default gen_random_uuid(),
  calculatie_id uuid not null references public.calculaties(id) on delete cascade,
  leverancier text,
  status text not null default 'concept',
  regels jsonb not null default '[]'::jsonb,
  totaal numeric(14,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.calculation_versions (
  id uuid primary key default gen_random_uuid(),
  calculatie_id uuid not null references public.calculaties(id) on delete cascade,
  version_no int not null,
  label text,
  snapshot jsonb not null,
  created_by uuid,
  created_at timestamptz not null default now(),
  unique (calculatie_id, version_no)
);

create table if not exists public.calculation_reports (
  id uuid primary key default gen_random_uuid(),
  calculatie_id uuid not null references public.calculaties(id) on delete cascade,
  type text not null,
  version_id uuid references public.calculation_versions(id) on delete set null,
  file_url text,
  payload jsonb,
  status text not null default 'generated',
  created_at timestamptz not null default now()
);

-- ── RLS (gespiegeld van bestaand model: SELECT permissief, ──
--     write voor authenticated + service_role) ──────────────
do $$
declare t text;
begin
  foreach t in array array[
    'combi_categories','combis','combi_components',
    'werktafel_chapters','werktafel_rows','werktafel_row_components',
    'bouwdelen','bouwdeel_combis','planning_tasks','material_orders',
    'calculation_versions','calculation_reports'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format($p$create policy %I on public.%I for select using (true);$p$, t||'_select', t);
    execute format($p$create policy %I on public.%I for insert with check (auth.uid() is not null or auth.role() = 'service_role');$p$, t||'_insert', t);
    execute format($p$create policy %I on public.%I for update using (auth.uid() is not null or auth.role() = 'service_role');$p$, t||'_update', t);
    execute format($p$create policy %I on public.%I for delete using (auth.uid() is not null or auth.role() = 'service_role');$p$, t||'_delete', t);
  end loop;
end $$;
