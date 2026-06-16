-- Open Data Harvest pijplijn — geïsoleerd `harvest`-schema (raakt core NIET aan).
-- SOURCE → STAGING → DEDUP → MAPPING → CORE. Werktafel blijft enige bron van waarheid.
-- Toegepast op pmovaz-prod 2026-06-16 (mirror van apply_migration 20260616_10).
create schema if not exists harvest;

-- 1) Bronregistratie
create table if not exists harvest.sources (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  naam text not null,
  eigenaar text,
  url text,
  licentie text,
  versie text,
  status text not null default 'registered',   -- registered | harvested | pending | reference | not_applicable
  record_count integer default 0,
  storage_object text,                          -- ruwe payload in bucket sterkcalc-harvest (provenance)
  harvested_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

-- 2) Staging — ruwe records per bron (verplichte provenance op elk record)
create table if not exists harvest.staging (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references harvest.sources(id),
  source_record_id text not null,
  source_url text,
  licentie text,
  harvested_at timestamptz not null default now(),
  content_hash text not null,
  record_type text,                             -- classification | property | object | price | mapping
  code text,
  naam text,
  classification text,                          -- etim | nlsfb | ifc | stabu
  raw jsonb not null default '{}'::jsonb,
  status text not null default 'new',           -- new | duplicate | conflict | linked | mapped
  matched_ref text,
  created_at timestamptz not null default now(),
  unique (source_id, content_hash)              -- harde dedup-gate binnen een bron
);
create index if not exists idx_staging_code on harvest.staging(code);
create index if not exists idx_staging_class on harvest.staging(classification);

-- 3) Review queue — conflicten, nooit auto-overschrijven
create table if not exists harvest.review_queue (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references harvest.sources(id),
  staging_id uuid references harvest.staging(id),
  reden text not null,                          -- conflict | ambiguous_mapping | price_divergence
  details jsonb default '{}'::jsonb,
  status text not null default 'open',          -- open | resolved | rejected
  created_at timestamptz not null default now()
);

-- 4) Links — staging-record gekoppeld aan bestaande core-referentie (i.p.v. dupliceren)
create table if not exists harvest.links (
  id uuid primary key default gen_random_uuid(),
  staging_id uuid not null references harvest.staging(id),
  core_type text not null,                      -- combi | component | prijsartikel | category
  core_ref text not null,
  relatie text default 'maps_to',
  created_at timestamptz not null default now(),
  unique (staging_id, core_type, core_ref)
);

-- 5) Mapping-crosswalk — één canonieke rij per koppeling (geen dubbele classificaties)
create table if not exists harvest.map_classificatie (
  id uuid primary key default gen_random_uuid(),
  etim_class text,
  nlsfb_code text,
  ifc_entity text,
  stabu_cat text,
  stabu_sub text,
  combi_code text,
  confidence numeric default 1.0,
  bron text,
  status text not null default 'active',        -- active | review
  created_at timestamptz not null default now(),
  unique (etim_class, nlsfb_code, ifc_entity, stabu_cat, stabu_sub, combi_code)
);
