-- 20260706_01_calculatie_aanvraag_projecttype.sql
-- Calculatie-aanvraag funnel: projecttype vastleggen op de lead. Additief.
alter table public.quickscan_leads
  add column if not exists projecttype text;

-- Per-bron funnel-breakdown (ad-funnel apart volgen).
create or replace view public.v_quickscan_bron as
select
  coalesce(bron, 'onbekend')                                              as bron,
  count(*)                                                                as leads,
  count(*) filter (where created_at >= now() - interval '30 days')        as leads_30d,
  count(*) filter (where status in ('quickscan_sent','call','quote','won')) as quickscans,
  count(*) filter (where status in ('call','quote','won'))                as gesprekken,
  count(*) filter (where status in ('quote','won'))                       as offertes,
  count(*) filter (where status = 'won')                                  as opdrachten,
  coalesce(sum(waarde_eur) filter (where status = 'won'), 0)              as omzet_eur
from public.quickscan_leads
group by 1;

-- Calculatie-aanvraag: verdeling per projecttype.
create or replace view public.v_quickscan_projecttype as
select
  coalesce(projecttype, 'onbekend')                          as projecttype,
  count(*)                                                   as leads,
  count(*) filter (where status = 'won')                     as opdrachten,
  coalesce(sum(waarde_eur) filter (where status = 'won'), 0) as omzet_eur
from public.quickscan_leads
where bron = 'calculatie_aanvraag'
group by 1
order by leads desc;
