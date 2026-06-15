-- Sprint 6 Offerte Excellence: premium offerte + klantportaal + digitale ondertekening + conversie.
-- Additief op bestaande sterkcalc_offertes. Geen nieuwe AI/IFC/combi/STABU-logica.
-- Reeds toegepast op pmovaz-prod.

alter table public.sterkcalc_offertes add column if not exists versie int not null default 1;
alter table public.sterkcalc_offertes add column if not exists locatie text;
alter table public.sterkcalc_offertes add column if not exists cover jsonb not null default '{}'::jsonb;
alter table public.sterkcalc_offertes add column if not exists kpi jsonb not null default '{}'::jsonb;
alter table public.sterkcalc_offertes add column if not exists opties jsonb not null default '[]'::jsonb;
alter table public.sterkcalc_offertes add column if not exists termijnen jsonb not null default '[]'::jsonb;
alter table public.sterkcalc_offertes add column if not exists planning jsonb not null default '[]'::jsonb;
alter table public.sterkcalc_offertes add column if not exists ondertekening jsonb;
alter table public.sterkcalc_offertes add column if not exists bekeken_at timestamptz;
alter table public.sterkcalc_offertes add column if not exists portal_token text;

update public.sterkcalc_offertes set portal_token = replace(gen_random_uuid()::text,'-','') where portal_token is null;
create unique index if not exists idx_offertes_portal_token on public.sterkcalc_offertes(portal_token);

update public.sterkcalc_offertes set termijnen =
  '[{"label":"Bij opdracht","pct":10},{"label":"Start ruwbouw","pct":25},{"label":"Wind- en waterdicht","pct":25},{"label":"Start afbouw","pct":25},{"label":"Oplevering","pct":15}]'::jsonb
  where termijnen = '[]'::jsonb;
update public.sterkcalc_offertes set planning =
  '[{"fase":"Voorbereiding","weken":2},{"fase":"Ruwbouw","weken":6},{"fase":"Installaties","weken":3},{"fase":"Afbouw","weken":4},{"fase":"Oplevering","weken":1}]'::jsonb
  where planning = '[]'::jsonb;

create table if not exists public.sterkcalc_offerte_events (
  id uuid primary key default gen_random_uuid(),
  offerte_id uuid not null references public.sterkcalc_offertes(id) on delete cascade,
  type text not null,            -- verzonden | bekeken | vraag | alternatief | meerwerk | afspraak | akkoord | getekend
  bericht text,
  ip text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_offerte_events_offerte on public.sterkcalc_offerte_events(offerte_id, created_at);

-- Trigger: ingevoerd event werkt offerte-status bij (publiek portaal heeft geen UPDATE-recht nodig;
-- security definer omzeilt RLS veilig + gericht).
create or replace function public.sterkcalc_apply_offerte_event() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.type = 'bekeken' then
    update public.sterkcalc_offertes
      set bekeken_at = coalesce(bekeken_at, now()),
          status = case when status in ('concept','verzonden') then 'bekeken' else status end
      where id = new.offerte_id;
  elsif new.type = 'vraag' then
    update public.sterkcalc_offertes set status = 'vraag' where id = new.offerte_id and status not in ('akkoord','getekend');
  elsif new.type = 'akkoord' then
    update public.sterkcalc_offertes set status = 'akkoord' where id = new.offerte_id and status <> 'getekend';
  elsif new.type = 'getekend' then
    update public.sterkcalc_offertes
      set status = 'getekend', getekend_at = now(), ondertekening = new.meta
      where id = new.offerte_id;
  end if;
  return new;
end $$;

drop trigger if exists trg_apply_offerte_event on public.sterkcalc_offerte_events;
create trigger trg_apply_offerte_event after insert on public.sterkcalc_offerte_events
  for each row execute function public.sterkcalc_apply_offerte_event();

alter table public.sterkcalc_offerte_events enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='sterkcalc_offerte_events' and policyname='offerte_events_select') then
    create policy offerte_events_select on public.sterkcalc_offerte_events for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='sterkcalc_offerte_events' and policyname='offerte_events_insert') then
    create policy offerte_events_insert on public.sterkcalc_offerte_events for insert with check (true);
  end if;
end $$;
