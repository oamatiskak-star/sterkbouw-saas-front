-- IFC-importer pilot — staging van ingelezen IFC-objecten + hoeveelheden + combi-voorstellen.
-- Uitsluitend staged voorstel; geen werktafel-/core-mutatie. Volledige provenance per object.
-- Toegepast op pmovaz-prod 2026-06-16 (mirror van apply_migration 20260616_18).
create table if not exists harvest.ifc_object (
  id uuid primary key default gen_random_uuid(),
  source_file text not null,
  ifc_guid text not null,
  ifc_entity text not null,
  naam text,
  propertyset jsonb default '{}'::jsonb,
  quantities jsonb default '{}'::jsonb,
  nlsfb_code text,
  combi_kandidaten jsonb default '[]'::jsonb,
  confidence numeric default 0,
  status text not null default 'staged',
  content_hash text not null,
  created_at timestamptz not null default now(),
  unique (source_file, ifc_guid)
);
create index if not exists idx_ifc_object_entity on harvest.ifc_object(ifc_entity);
