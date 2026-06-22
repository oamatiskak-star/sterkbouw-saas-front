-- 20260622_01_quickscan_leadmachine.sql
-- STRKBOUW Bouwkosten Quickscan leadmachine: leads, funnel-events, ad-spend, KPI-view.
-- Additief. RLS aan zonder public-policy → alleen service-role (API) schrijft/leest.

create extension if not exists pgcrypto;

-- ── Leads ────────────────────────────────────────────────────────────────
create table if not exists public.quickscan_leads (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  naam          text not null,
  email         text not null,
  telefoon      text,
  projectadres  text,
  funda_url     text,
  bericht       text,
  bestanden     jsonb not null default '[]'::jsonb,  -- [{path,name,size,type}]
  bron          text not null default 'landing',
  utm           jsonb not null default '{}'::jsonb,
  -- funnel-status: new → quickscan_sent → call → quote → won/lost
  status        text not null default 'new'
                check (status in ('new','quickscan_sent','call','quote','won','lost')),
  waarde_eur    numeric(10,2),                       -- omzet bij won-opdracht
  ip            text,
  user_agent    text
);
create index if not exists idx_quickscan_leads_created on public.quickscan_leads(created_at desc);
create index if not exists idx_quickscan_leads_status  on public.quickscan_leads(status);

-- ── Funnel-events (visits + transities, voor KPI) ────────────────────────
create table if not exists public.quickscan_events (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  lead_id     uuid references public.quickscan_leads(id) on delete set null,
  event_type  text not null
              check (event_type in ('visit','lead','quickscan_sent','call','quote','order')),
  waarde_eur  numeric(10,2),
  meta        jsonb not null default '{}'::jsonb
);
create index if not exists idx_quickscan_events_type on public.quickscan_events(event_type, created_at desc);

-- ── Advertentie-uitgaven (voor cost-per-lead) ────────────────────────────
create table if not exists public.quickscan_spend (
  id          uuid primary key default gen_random_uuid(),
  dag         date not null,
  kanaal      text not null default 'google_ads',
  bedrag_eur  numeric(10,2) not null default 0,
  created_at  timestamptz not null default now(),
  unique (dag, kanaal)
);

-- ── updated_at trigger ───────────────────────────────────────────────────
create or replace function public.quickscan_touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_quickscan_leads_touch on public.quickscan_leads;
create trigger trg_quickscan_leads_touch before update on public.quickscan_leads
  for each row execute function public.quickscan_touch_updated_at();

-- ── KPI-view (all-time + laatste 30 dagen) ───────────────────────────────
create or replace view public.v_quickscan_kpi as
with ev as (
  select
    count(*) filter (where event_type = 'visit')                                as visitors,
    count(*) filter (where event_type = 'visit' and created_at >= now()-interval '30 days') as visitors_30d
  from public.quickscan_events
),
ld as (
  select
    count(*)                                                       as leads,
    count(*) filter (where created_at >= now()-interval '30 days') as leads_30d,
    count(*) filter (where status in ('quickscan_sent','call','quote','won')) as quickscans,
    count(*) filter (where status in ('call','quote','won'))       as gesprekken,
    count(*) filter (where status in ('quote','won'))              as offertes,
    count(*) filter (where status = 'won')                         as opdrachten,
    coalesce(sum(waarde_eur) filter (where status = 'won'), 0)     as omzet_eur
  from public.quickscan_leads
),
sp as (
  select coalesce(sum(bedrag_eur),0) as spend_eur,
         coalesce(sum(bedrag_eur) filter (where dag >= current_date-30),0) as spend_30d_eur
  from public.quickscan_spend
)
select
  ev.visitors, ev.visitors_30d,
  ld.leads, ld.leads_30d, ld.quickscans, ld.gesprekken, ld.offertes, ld.opdrachten, ld.omzet_eur,
  sp.spend_eur, sp.spend_30d_eur,
  case when ld.leads      > 0 then round(sp.spend_eur     / ld.leads,     2) end as cost_per_lead_eur,
  case when ld.leads_30d  > 0 then round(sp.spend_30d_eur / ld.leads_30d, 2) end as cost_per_lead_30d_eur,
  case when ev.visitors   > 0 then round(100.0 * ld.leads      / ev.visitors, 1) end as visitor_naar_lead_pct,
  case when ld.leads      > 0 then round(100.0 * ld.opdrachten / ld.leads,    1) end as lead_naar_opdracht_pct
from ev, ld, sp;

-- ── RLS (alleen service-role) ────────────────────────────────────────────
alter table public.quickscan_leads  enable row level security;
alter table public.quickscan_events enable row level security;
alter table public.quickscan_spend  enable row level security;

-- ── Private storage-bucket voor uploads ──────────────────────────────────
insert into storage.buckets (id, name, public)
values ('quickscan-uploads', 'quickscan-uploads', false)
on conflict (id) do nothing;
