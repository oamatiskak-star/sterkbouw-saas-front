-- SterkCalc Next-Gen — offerte-laag + globale instellingen (additief, niet-destructief).
-- 'offertes' bestond al (legacy) → nieuwe tabel heet sterkcalc_offertes.
create table if not exists public.sterkcalc_offertes (
  id uuid primary key default gen_random_uuid(),
  calculatie_id uuid references public.calculaties(id) on delete cascade,
  project_id uuid,
  nummer text,
  status text not null default 'concept',
  klant_naam text, klant_email text,
  totaal_excl numeric(14,2), totaal_incl numeric(14,2),
  modules jsonb not null default '{}'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  pdf_url text,
  verzonden_at timestamptz, getekend_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists idx_sterkcalc_offertes_calc on public.sterkcalc_offertes(calculatie_id);

create table if not exists public.sterkcalc_settings (
  id int primary key default 1,
  bedrijf jsonb not null default '{}'::jsonb,
  branding jsonb not null default '{}'::jsonb,
  calculatie_defaults jsonb not null default '{"ak":6,"abk":4,"risico":3,"winst":5,"btw":21,"regiofactor":1.0,"afronding":2,"calculatietype":"nieuwbouw","fixed_price":false}'::jsonb,
  ai jsonb not null default '{"mag_voorstellen":true,"mag_ak_wijzigen":false,"mag_abk_wijzigen":false,"mag_winst_wijzigen":false}'::jsonb,
  werktafel jsonb not null default '{"autosave":true,"autosave_interval":30,"versies_bewaren":100}'::jsonb,
  combi jsonb not null default '{"auto_componenten":true,"auto_uitklappen":true,"relatie_engine":true}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint sterkcalc_settings_singleton check (id = 1)
);
insert into public.sterkcalc_settings (id) values (1) on conflict (id) do nothing;
-- RLS permissief gespiegeld (select true; write authenticated/service_role) op beide tabellen.
