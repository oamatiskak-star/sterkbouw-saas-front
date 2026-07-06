-- 20260706_01_calculatie_aanvraag_projecttype.sql
-- Calculatie-aanvraag funnel: projecttype vastleggen op de lead. Additief.
alter table public.quickscan_leads
  add column if not exists projecttype text;
