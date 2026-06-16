-- Assembly Engine Fase 1 — geïsoleerd `assembly`-schema (routering/recepten, GEEN waarden/prijzen).
-- Eén IFC-object → meerdere bestaande combi's/rekenmodellen. Geen core-/werktafel-mutatie. Additief.
create schema if not exists assembly;
do $$ begin
  if not exists (select 1 from pg_type where typname='route_type' and typnamespace='assembly'::regnamespace) then
    create type assembly.route_type as enum ('rekenmodel','combi_set');
  end if;
end $$;

create table if not exists assembly.template (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  naam text not null,
  ifc_entity text not null,
  bouwdeel text not null,
  route assembly.route_type not null,
  rekenmodel_object text,
  nlsfb_code text,
  default_variant_code text,
  is_default boolean not null default true,
  bron text default 'design-seed',
  status text not null default 'active',
  created_at timestamptz default now()
);
create unique index if not exists uq_template_default on assembly.template(ifc_entity) where is_default;

create table if not exists assembly.variant (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references assembly.template(id) on delete cascade,
  code text not null,
  naam text not null,
  beschrijving text,
  rekenmodel_values jsonb default '{}'::jsonb,
  status text not null default 'active',
  unique (template_id, code)
);

create table if not exists assembly.template_item (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references assembly.template(id) on delete cascade,
  variant_code text,
  volgorde int not null,
  functie text not null,
  combi_code text not null,                 -- soft-ref naar combis.code (geen FK → geen core-koppeling)
  base_quantity text not null,
  factor numeric not null default 1.0,
  eenheid text,
  default_attribuut jsonb default '{}'::jsonb,
  status text not null default 'active',
  unique (template_id, variant_code, functie)
);

create table if not exists assembly.rule (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references assembly.template(id) on delete cascade,
  conditie jsonb not null,
  kies_variant_code text not null,
  prioriteit int not null default 100,
  status text not null default 'active'
);
select 'assembly-schema toegepast' as status;
