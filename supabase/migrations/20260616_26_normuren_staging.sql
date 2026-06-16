-- Normuren-import uit bestaande calculatie V1.0 — geïsoleerd `normuren`-schema.
-- Leidt normuren (uren per eenheid) af uit bestaande calculaties → staged → review → approved.
-- GEEN core-mutatie, GEEN prijzen/marges overschrijven, GEEN werktafel-mutatie. Alles eerst staged.
create schema if not exists normuren;

create table if not exists normuren.import_batch (
  id uuid primary key default gen_random_uuid(),
  source_file text unique not null,
  bron_type text not null default 'pdf-2jours',
  uurloon_aanname numeric not null,
  regels_ingelezen int, arbeidregels int, uren_expliciet int, uren_afgeleid int,
  created_at timestamptz default now()
);

create table if not exists normuren.staging_regel (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references normuren.import_batch(id) on delete cascade,
  source_file text not null,
  source_row int not null,
  regelcode text,
  omschrijving text,
  hoofdstuk text, hoofdstuk_naam text,
  stabu_code text, stabu_naam text,
  eenheid text, eenheid_norm text,
  hoeveelheid numeric,
  arbeid_bedrag numeric,
  uurloon_aanname numeric,
  uren_expliciet numeric,
  m_norm numeric,
  afgeleide_uren numeric,
  uren_per_eenheid numeric,
  uren_bron text,
  is_correctie boolean default false,
  combi_code text,
  component_id uuid,
  match_confidence numeric,
  confidence numeric,
  validatie jsonb default '{}'::jsonb,
  review_note text,
  status text not null default 'staged',
  content_hash text not null,
  created_at timestamptz default now(),
  unique (source_file, source_row)
);
create index if not exists ix_norm_staging_batch on normuren.staging_regel(batch_id);
create index if not exists ix_norm_staging_key on normuren.staging_regel(stabu_code, regelcode, eenheid_norm);

create table if not exists normuren.normuur (
  id uuid primary key default gen_random_uuid(),
  stabu_code text,
  regelcode text,
  combi_code text,
  component_id uuid,
  eenheid text,
  uren_per_eenheid numeric not null,
  n_observaties int not null default 1,
  spreiding numeric,
  bron_files jsonb default '[]'::jsonb,
  confidence numeric,
  status text not null default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create unique index if not exists uq_normuur_key on normuren.normuur
  (coalesce(stabu_code,''), coalesce(regelcode,''), coalesce(combi_code,''), coalesce(eenheid,''));

create or replace function normuren.eenheid_norm(p text)
returns text language sql immutable as $$
  select case lower(coalesce(p,''))
    when 'm1' then 'm¹' when 'm2' then 'm²' when 'm3' then 'm³'
    when 'post' then 'pst' when 'stuk' then 'st' when 'duiz' then 'duiz'
    else nullif(lower(p),'') end;
$$;

create or replace function normuren.match_combi(p_regelcode text, p_omschrijving text, p_eenheid_norm text)
returns table(combi_code text, score numeric) language sql stable as $$
  with toks as (
    select array_agg(distinct lower(t)) arr
    from regexp_split_to_table(coalesce(p_omschrijving,''), '\s+') t
    where length(t) >= 4
  )
  select b.code,
    ( coalesce((select count(*) from unnest((select arr from toks)) tk
        where position(tk in lower(coalesce(b.naam,'')||' '||coalesce(b.omschrijving,''))) > 0),0)::numeric
      + case when b.eenheid = p_eenheid_norm then 2 else 0 end
      + case when b.stabu_hoofdstuk = left(coalesce(p_regelcode,''),2) then 1 else 0 end
    ) as score
  from combis b
  where coalesce(b.actief,true) = true
  order by score desc, b.code
  limit 1;
$$;

create or replace function normuren.run_matching(p_batch uuid)
returns int language plpgsql as $$
declare n int := 0; r record; m record;
begin
  for r in select id, regelcode, omschrijving, eenheid_norm from normuren.staging_regel
            where batch_id = p_batch loop
    select * into m from normuren.match_combi(r.regelcode, r.omschrijving, r.eenheid_norm);
    if m.score >= 3 then
      update normuren.staging_regel
        set combi_code = m.combi_code,
            match_confidence = round(least(0.95, m.score/8.0), 3)
        where id = r.id;
      n := n + 1;
    end if;
  end loop;
  return n;
end $$;

create or replace function normuren.detect_conflicts(p_batch uuid)
returns int language plpgsql as $$
declare n int := 0; g record;
begin
  for g in
    select stabu_code, regelcode, eenheid_norm,
           min(uren_per_eenheid) lo, max(uren_per_eenheid) hi, count(*) c
    from normuren.staging_regel
    where batch_id = p_batch and uren_per_eenheid is not null
    group by stabu_code, regelcode, eenheid_norm
    having count(*) > 1 and (max(uren_per_eenheid) - min(uren_per_eenheid)) > 0.05 * greatest(max(uren_per_eenheid),0.0001)
  loop
    update normuren.staging_regel
      set review_note = concat_ws(' | ', review_note,
            format('conflict: afwijkende normuur %s-%s u/%s voor %s/%s',
                   g.lo, g.hi, g.eenheid_norm, g.stabu_code, g.regelcode))
      where batch_id = p_batch and stabu_code is not distinct from g.stabu_code
        and regelcode is not distinct from g.regelcode
        and eenheid_norm is not distinct from g.eenheid_norm;
    n := n + 1;
  end loop;
  return n;
end $$;

create or replace function normuren.build_normuren()
returns int language plpgsql as $$
declare n int := 0;
begin
  insert into normuren.normuur
    (stabu_code, regelcode, combi_code, component_id, eenheid, uren_per_eenheid,
     n_observaties, spreiding, bron_files, confidence)
  select stabu_code, regelcode, combi_code, component_id, eenheid_norm,
         round(avg(uren_per_eenheid),4), count(*),
         round(max(uren_per_eenheid)-min(uren_per_eenheid),4),
         to_jsonb(array_agg(distinct source_file)), round(avg(confidence),3)
  from normuren.staging_regel
  where status='approved' and uren_per_eenheid is not null
  group by stabu_code, regelcode, combi_code, component_id, eenheid_norm
  on conflict (coalesce(stabu_code,''), coalesce(regelcode,''), coalesce(combi_code,''), coalesce(eenheid,''))
  do update set uren_per_eenheid = excluded.uren_per_eenheid,
                n_observaties = excluded.n_observaties,
                spreiding = excluded.spreiding,
                bron_files = excluded.bron_files,
                confidence = excluded.confidence,
                updated_at = now();
  get diagnostics n = row_count;
  return n;
end $$;

select 'normuren staging-schema toegepast' as status;
