-- Opnameformulier verhuist van een lokaal file://-bestand naar de SterkCalc-dashboard
-- (/calculaties/opnames). De tabel public.opnames bestond al (gevuld via de edge function
-- submit-opname, insert-only). Deze migratie voegt toe wat nodig is om opnames binnen de
-- dashboard te LEZEN en TE BEWERKEN, wat voorheen niet mogelijk was.

alter table public.opnames add column if not exists updated_at timestamptz not null default now();

create or replace function public.opnames_set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_opnames_updated_at on public.opnames;
create trigger trg_opnames_updated_at before update on public.opnames
  for each row execute function public.opnames_set_updated_at();

-- RLS staat al aan zonder policies (dus tot nu toe alleen bereikbaar via de service-role
-- key in de edge function). De dashboard gebruikt de anon/publishable key met app-level
-- login (RequireAuth) i.p.v. per-rij Supabase Auth — zelfde patroon als sterkcalc_offerte_events.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='opnames' and policyname='opnames_select') then
    create policy opnames_select on public.opnames for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='opnames' and policyname='opnames_insert') then
    create policy opnames_insert on public.opnames for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='opnames' and policyname='opnames_update') then
    create policy opnames_update on public.opnames for update using (true) with check (true);
  end if;
end $$;
