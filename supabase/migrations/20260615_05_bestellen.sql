-- Sprint 8 Bestellen & Inkoop: leveranciers + bestellingen. Afgeleid uit werktafel + planning.
-- Werktafel/planning blijven leidend; geen handmatige dubbele invoer. AI alleen signaleren/voorstellen.
-- Reeds toegepast op pmovaz-prod.

create table if not exists public.sterkcalc_leveranciers (
  id uuid primary key default gen_random_uuid(),
  naam text not null,
  categorieen text[] not null default '{}',   -- categoriecodes die deze leverancier dekt (of {algemeen})
  contactpersoon text, telefoon text, email text,
  levertijd_dagen int not null default 7,
  actief boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.sterkcalc_bestellingen (
  id uuid primary key default gen_random_uuid(),
  calculatie_id uuid not null references public.calculaties(id) on delete cascade,
  leverancier_id uuid references public.sterkcalc_leveranciers(id) on delete set null,
  leverancier_naam text,
  fase_key text,
  nummer text,
  status text not null default 'concept',   -- concept | geplaatst | geleverd
  regels jsonb not null default '[]'::jsonb,
  totaal numeric(14,2) not null default 0,
  gewenste_leverdatum date,
  besteld_at timestamptz, verwacht_at date, geleverd_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists idx_bestellingen_calc on public.sterkcalc_bestellingen(calculatie_id, status);

do $$
declare t text;
begin
  foreach t in array array['sterkcalc_leveranciers','sterkcalc_bestellingen'] loop
    execute format('alter table public.%I enable row level security;', t);
    if not exists (select 1 from pg_policies where schemaname='public' and tablename=t and policyname=t||'_select') then
      execute format('create policy %I on public.%I for select using (true);', t||'_select', t); end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename=t and policyname=t||'_insert') then
      execute format($p$create policy %I on public.%I for insert with check (auth.uid() is not null or auth.role()='service_role');$p$, t||'_insert', t); end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename=t and policyname=t||'_update') then
      execute format($p$create policy %I on public.%I for update using (auth.uid() is not null or auth.role()='service_role');$p$, t||'_update', t); end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename=t and policyname=t||'_delete') then
      execute format($p$create policy %I on public.%I for delete using (auth.uid() is not null or auth.role()='service_role');$p$, t||'_delete', t); end if;
  end loop;
end $$;

insert into public.sterkcalc_leveranciers (naam, categorieen, levertijd_dagen) values
  ('BMN Bouwmaterialen', array['04','05','06','07','08','09','11','17','19'], 10),
  ('Kozijnenfabriek', array['14','15'], 21),
  ('Dakgroothandel', array['12','13'], 7),
  ('Technische Unie (elektra)', array['25'], 5),
  ('Wasco (installatie/verwarming/ventilatie)', array['24','26','28'], 7),
  ('Sanitair- & tegelgroothandel', array['20','27'], 7),
  ('Afbouwgroothandel', array['16','18','21','22','23'], 5),
  ('Sloop & containerservice', array['02','03'], 3),
  ('Tuin & terrein', array['30','31','32'], 7),
  ('Algemene groothandel', array['algemeen'], 10)
on conflict do nothing;
