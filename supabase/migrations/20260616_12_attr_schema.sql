-- Component Attribute Model — geïsoleerd `attr`-schema (overlay op componenten).
-- Geen core-mutatie, geen bedragen/prijzen. FK's naar harvest.sources + public.combi_components.
-- Toegepast op pmovaz-prod 2026-06-16 (mirror van apply_migration 20260616_12).
create schema if not exists attr;
do $$ begin
  if not exists (select 1 from pg_type where typname='categorie' and typnamespace='attr'::regnamespace) then
    create type attr.categorie as enum ('technisch','calc_driver','hoeveelheid_driver','materiaal','prestatie','validatie');
  end if;
  if not exists (select 1 from pg_type where typname='datatype' and typnamespace='attr'::regnamespace) then
    create type attr.datatype as enum ('number','text','bool','enum');
  end if;
  if not exists (select 1 from pg_type where typname='map_status' and typnamespace='attr'::regnamespace) then
    create type attr.map_status as enum ('auto_match','twijfel','conflict','approved','rejected');
  end if;
  if not exists (select 1 from pg_type where typname='val_status' and typnamespace='attr'::regnamespace) then
    create type attr.val_status as enum ('staged','approved','rejected','rolled_back');
  end if;
end $$;

create table if not exists attr.attribute_definition (
  id uuid primary key default gen_random_uuid(),
  code text unique not null, naam text not null,
  categorie attr.categorie not null, datatype attr.datatype not null,
  unit text, allowed_values jsonb default '[]'::jsonb,
  status text not null default 'active', created_at timestamptz default now());

create table if not exists attr.definition_source (
  id uuid primary key default gen_random_uuid(),
  attribute_id uuid not null references attr.attribute_definition(id),
  source_id uuid not null references harvest.sources(id),
  source_record_id text not null, property_code text, unit text,
  confidence numeric default 1.0, mapping_status attr.map_status not null default 'twijfel',
  reviewed_by text, reviewed_at timestamptz, content_hash text not null,
  created_at timestamptz default now(),
  unique (source_id, source_record_id));

create table if not exists attr.component_attribute_value (
  id uuid primary key default gen_random_uuid(),
  component_id uuid not null references public.combi_components(id) on delete cascade,
  attribute_id uuid not null references attr.attribute_definition(id),
  value_number numeric, value_text text, value_bool boolean, import_batch_id uuid,
  source_id uuid references harvest.sources(id), source_record_id text,
  property_code text, unit text, confidence numeric default 1.0,
  mapping_status attr.map_status not null default 'twijfel',
  reviewed_by text, reviewed_at timestamptz,
  status attr.val_status not null default 'staged',
  superseded_by uuid references attr.component_attribute_value(id),
  content_hash text not null, created_at timestamptz default now(), updated_at timestamptz default now(),
  unique (component_id, attribute_id, source_id));

create table if not exists attr.rekenmodel_input_map (
  id uuid primary key default gen_random_uuid(),
  attribute_id uuid not null references attr.attribute_definition(id),
  rekenmodel_object text not null, input_key text not null,
  relatie text default 'drives', confidence numeric default 1.0,
  status text not null default 'active',
  unique (attribute_id, rekenmodel_object, input_key));

create table if not exists attr.review_queue (
  id uuid primary key default gen_random_uuid(),
  entity text not null, entity_id uuid,
  reden text not null, details jsonb default '{}'::jsonb,
  status text not null default 'open', created_at timestamptz default now());

-- append-only auditlog (geen update/delete-policy)
create table if not exists attr.audit_log (
  id bigint generated always as identity primary key,
  entity text not null, entity_id uuid, actie text not null,
  oude_waarde jsonb, nieuwe_waarde jsonb, actor text, reason text,
  at timestamptz not null default now());
