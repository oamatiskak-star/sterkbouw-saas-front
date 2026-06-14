-- SterkCalc Visions — vision-AI tekening→ruimteherkenning (additief, niet-destructief).
-- Logt elke vision-run (audit/traceability) + storage-bucket voor geüploade tekeningen.
-- AI is uitsluitend adviserend: herkent/meet/stelt voor. Raakt AK/ABK/risico/winst NOOIT.

create table if not exists public.calculatie_vision_analyses (
  id uuid primary key default gen_random_uuid(),
  calculatie_id uuid not null references public.calculaties(id) on delete cascade,
  bestandsnaam text,
  storage_path text,
  media_type text,
  model text,
  status text not null default 'pending',     -- pending | done | error
  ruimtes_gevonden int not null default 0,
  openingen_gevonden int not null default 0,
  gem_confidence numeric(5,2),
  plan_schaal text,
  opmerkingen text,
  raw_response jsonb,
  error text,
  created_at timestamptz not null default now()
);
create index if not exists idx_vision_analyses_calc on public.calculatie_vision_analyses(calculatie_id, created_at desc);

-- Koppel herkende ruimtes aan hun bron-analyse (traceability).
alter table public.calculatie_ruimtes add column if not exists vision_analysis_id uuid references public.calculatie_vision_analyses(id) on delete set null;

-- RLS permissief gespiegeld van bestaande AI-tabellen.
alter table public.calculatie_vision_analyses enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='calculatie_vision_analyses' and policyname='calculatie_vision_analyses_select') then
    create policy calculatie_vision_analyses_select on public.calculatie_vision_analyses for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='calculatie_vision_analyses' and policyname='calculatie_vision_analyses_insert') then
    create policy calculatie_vision_analyses_insert on public.calculatie_vision_analyses for insert with check (auth.uid() is not null or auth.role() = 'service_role');
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='calculatie_vision_analyses' and policyname='calculatie_vision_analyses_update') then
    create policy calculatie_vision_analyses_update on public.calculatie_vision_analyses for update using (auth.uid() is not null or auth.role() = 'service_role');
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='calculatie_vision_analyses' and policyname='calculatie_vision_analyses_delete') then
    create policy calculatie_vision_analyses_delete on public.calculatie_vision_analyses for delete using (auth.uid() is not null or auth.role() = 'service_role');
  end if;
end $$;

-- Private storage-bucket voor geüploade tekeningen (PDF/afbeelding).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('sterkcalc-vision-uploads', 'sterkcalc-vision-uploads', false, 52428800,
        array['application/pdf','image/png','image/jpeg','image/jpg','image/webp'])
on conflict (id) do nothing;

-- Storage-policies: browser (anon/authenticated) mag uploaden/lezen in deze bucket; service_role doet de download server-side.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='sterkcalc_vision_insert') then
    create policy sterkcalc_vision_insert on storage.objects for insert with check (bucket_id = 'sterkcalc-vision-uploads');
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='sterkcalc_vision_select') then
    create policy sterkcalc_vision_select on storage.objects for select using (bucket_id = 'sterkcalc-vision-uploads');
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='sterkcalc_vision_delete') then
    create policy sterkcalc_vision_delete on storage.objects for delete using (bucket_id = 'sterkcalc-vision-uploads');
  end if;
end $$;
