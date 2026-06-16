-- Storage-bucket voor ruwe harvest-payloads (provenance). Privaat + alleen anon-SELECT.
-- Schrijven gebeurt alleen door de operator (service-role / tijdelijke policy tijdens harvest).
-- Toegepast op pmovaz-prod 2026-06-16 (mirror van de execute_sql infra-stap).
insert into storage.buckets (id, name, public)
values ('sterkcalc-harvest','sterkcalc-harvest', false)
on conflict (id) do nothing;

drop policy if exists "harvest anon read" on storage.objects;
create policy "harvest anon read" on storage.objects
  for select to anon using (bucket_id = 'sterkcalc-harvest');
