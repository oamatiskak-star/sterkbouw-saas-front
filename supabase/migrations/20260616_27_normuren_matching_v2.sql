-- Normuren-matching Fase 2 — betrouwbare combi/component-koppeling (pg_trgm + STABU-crosswalk
-- + werksoort-classifier als negatieve-token-blokkade). GEEN auto-approval, GEEN core/prijs/werktafel-mutatie.
-- Behoudt alle bestaande staged regels; schrijft NIEUWE suggested_*-velden, status blijft 'staged'.
-- Prioriteit: 1) exacte STABU (stabu_hoofdstuk) 2) STABU-categorie-crosswalk 3) omschrijving fuzzy (trgm).
-- Eenheid moet overeenkomen/converteerbaar; werksoort-ongelijkheid = harde blokkade (isover≠zandbed enz.).
-- regelcode-prefix wordt NIET meer als (harde) match gebruikt.
create extension if not exists pg_trgm;

alter table normuren.staging_regel
  add column if not exists match_score numeric,
  add column if not exists match_reason text,
  add column if not exists suggested_combi_code text,
  add column if not exists suggested_component_id uuid,
  add column if not exists suggest_high_confidence boolean default false;

create table if not exists normuren.stabu_combi_map (
  stabu_hoofdstuk text not null,
  category_code text not null,
  primary key (stabu_hoofdstuk, category_code)
);
insert into normuren.stabu_combi_map (stabu_hoofdstuk, category_code) values
 ('05','00'),
 ('10','02'),
 ('12','03'),
 ('22','08'),('22','09'),('22','10'),('22','23'),
 ('23','04'),('23','05'),('23','06'),
 ('24','11'),('24','17'),('24','23'),
 ('25','07'),
 ('30','13'),('30','14'),('30','15'),
 ('33','12'),
 ('35','20'),
 ('41','20'),
 ('42','19'),
 ('44','17'),('44','18'),
 ('45','14'),
 ('50','12'),('50','32'),
 ('51','24'),('51','32'),
 ('52','24'),
 ('60','28'),
 ('61','26'),
 ('70','25'),
 ('90','24'),('90','25'),('90','27'),('90','28')
on conflict do nothing;

-- werksoort-classifier: canonieke werksoort uit vrije tekst (controlled vocab, specifiek eerst).
-- Ongelijke werksoorten = harde blokkade (isover≠zandbed, folie≠bovenregel, steiger≠isolatie).
create or replace function normuren.werksoort(p text)
returns text language sql immutable as $$
  select case
    when lower(coalesce(p,'')) ~ 'steiger' then 'steiger'
    when lower(coalesce(p,'')) ~ 'isover|rockwool|rocksono|isolatie|minerale|\meps\M|\mpir\M|isolatieplaat|isolatieclip|e-board|isoboard|mupan' then 'isolatie'
    when lower(coalesce(p,'')) ~ 'folie|\mdpc\M|damprem|dampopen|dampremmende|waterkeren|intello' then 'folie'
    when lower(coalesce(p,'')) ~ 'kalkzandsteen|gevelsteen|metsel|baksteen|voegwerk|spouwanker|stootvoeg|lijmwerk|speciemortel' then 'metselwerk'
    when lower(coalesce(p,'')) ~ 'gipskarton|gipsplaat|gips karton|metalstud|underlayment|\mosb\M|spaanplaat|multiplex|beplating|gipsplafond' then 'plaatwerk'
    when lower(coalesce(p,'')) ~ 'vuren|regelwerk|onderregel|bovenregel|koppelregel|stijlen|slaper|raveling|stelregel|cls/sls|\mhsb\M' then 'houtskelet'
    when lower(coalesce(p,'')) ~ 'beton|bekisting|wapening|bouwstaalmat|randkist|stort|druklaag' then 'beton'
    when lower(coalesce(p,'')) ~ '\mhea\M|staalprofiel|staalcon|stalen|staalwerk|\mheb\M|\mipe\M' then 'staal'
    when lower(coalesce(p,'')) ~ 'tegel|kitvoeg|kimband|tegelprofiel|wandtegel|vloertegel' then 'tegelwerk'
    when lower(coalesce(p,'')) ~ 'egalis|dekvloer|cementdek|anhydriet|egalisatie' then 'dekvloer'
    when lower(coalesce(p,'')) ~ 'dakbedekking|bitumen|\mepdm\M|dakrand|noodoverstort|plakstuk|afdekkap|dakpan' then 'dakbedekking'
    when lower(coalesce(p,'')) ~ 'fakro|dakraam|tuimelvenster|dakkapel|gootstuk' then 'dakraam'
    when lower(coalesce(p,'')) ~ 'kozijn|binnendeur|\mdeur|hang- en sluit|beslag|afhangen' then 'kozijn'
    when lower(coalesce(p,'')) ~ 'plint|aftimmer|koplat|vensterbank|\mkoof|betimmer' then 'timmerwerk'
    when lower(coalesce(p,'')) ~ 'natuursteen' then 'natuursteen'
    when lower(coalesce(p,'')) ~ 'riool|riolering|\mhwa\M|\mgoot|hemelwater' then 'riolering'
    when lower(coalesce(p,'')) ~ 'waterinstall|waterleiding|leidingwerk' then 'water'
    when lower(coalesce(p,'')) ~ 'warmtepomp|\mcv\M|radiator|verwarming' then 'verwarming'
    when lower(coalesce(p,'')) ~ 'ventilat|\mwtw\M' then 'ventilatie'
    when lower(coalesce(p,'')) ~ 'wcd|lichtpunt|schakelaar|meterkast|elektra|\mutp\M|aarde|aarding|rookmelder|zonnepaneel|omvormer|perilex|belinstallatie|thermostaat' then 'elektra'
    when lower(coalesce(p,'')) ~ 'toilet|wastafel|fontein|douche|sanitair|vloerput' then 'sanitair'
    else null end;
$$;

-- eenheid moet overeenkomen of expliciet converteerbaar zijn (stuk/post/pst onderling).
create or replace function normuren.eenheid_match(p_combi text, p_staging text)
returns boolean language sql immutable as $$
  select case
    when p_combi is null or p_staging is null then false
    when lower(p_combi)=lower(p_staging) then true
    when lower(p_combi) in ('pst','st','stuk','post') and lower(p_staging) in ('pst','st','stuk','post') then true
    else false end;
$$;

-- v2-matcher: eenheid-filter + werksoort-blokkade (hard) → trgm + crosswalk + exacte stabu (score).
create or replace function normuren.match_combi_v2(p_stabu_code text, p_omschrijving text, p_eenheid_norm text)
returns table(combi_code text, component_id uuid, score numeric, reason text)
language sql stable as $$
  with s as (
    select normuren.werksoort(p_omschrijving) ws,
           left(coalesce(p_stabu_code,''),2) hfd,
           lower(coalesce(p_omschrijving,'')) oms
  ),
  cand as (
    select b.id, b.code, b.category_code, b.stabu_hoofdstuk,
           normuren.werksoort(coalesce(b.naam,'')||' '||coalesce(b.omschrijving,'')) ws_c,
           similarity((select oms from s), lower(coalesce(b.naam,'')||' '||coalesce(b.omschrijving,'')))::numeric sim
    from combis b, s
    where coalesce(b.actief,true)
      and normuren.eenheid_match(b.eenheid, p_eenheid_norm)
      and ( (select ws from s) is null
            or normuren.werksoort(coalesce(b.naam,'')||' '||coalesce(b.omschrijving,'')) = (select ws from s) )
  ),
  scored as (
    select c.*, least(0.99::numeric,
        c.sim
        + case when exists(select 1 from normuren.stabu_combi_map m
                 where m.stabu_hoofdstuk=(select hfd from s) and m.category_code=c.category_code) then 0.15 else 0 end
        + case when c.stabu_hoofdstuk=(select hfd from s) then 0.20 else 0 end
        + case when (select ws from s) is not null and c.ws_c=(select ws from s) then 0.10 else 0 end
      ) final_score
    from cand c
  )
  select sc.code,
    (select cc.id from combi_components cc
       where cc.combi_id = sc.id
       order by (cc.type::text ilike '%arbeid%') desc,
                similarity(lower(coalesce(cc.omschrijving,'')), (select oms from s)) desc nulls last
       limit 1),
    round(sc.final_score,3),
    concat_ws('; ',
      'trgm='||round(sc.sim,2),
      case when (select ws from s) is not null then 'werksoort='||(select ws from s) end,
      case when exists(select 1 from normuren.stabu_combi_map m
             where m.stabu_hoofdstuk=(select hfd from s) and m.category_code=sc.category_code)
           then 'stabu_cat='||sc.category_code end,
      case when sc.stabu_hoofdstuk=(select hfd from s) then 'stabu_exact' end
    )
  from scored sc
  order by sc.final_score desc, sc.code
  limit 1;
$$;

-- batch-runner: vult suggested_*; status blijft 'staged'; >=0.85 → suggest_high_confidence (geen approval).
create or replace function normuren.run_matching_v2(p_batch uuid)
returns table(matched int, high int) language plpgsql as $$
declare r record; m record; n_match int:=0; n_high int:=0;
begin
  for r in select id, stabu_code, omschrijving, eenheid_norm from normuren.staging_regel where batch_id=p_batch loop
    select * into m from normuren.match_combi_v2(r.stabu_code, r.omschrijving, r.eenheid_norm);
    if m.combi_code is not null and m.score >= 0.20 then
      update normuren.staging_regel set
        suggested_combi_code = m.combi_code,
        suggested_component_id = m.component_id,
        match_score = m.score,
        match_reason = m.reason,
        suggest_high_confidence = (m.score >= 0.85)
      where id = r.id;
      n_match := n_match+1;
      if m.score >= 0.85 then n_high := n_high+1; end if;
    else
      update normuren.staging_regel set
        suggested_combi_code = null, suggested_component_id = null,
        match_score = coalesce(m.score,0),
        match_reason = coalesce(nullif(m.reason,''),'geen kandidaat (eenheid/werksoort-blokkade)'),
        suggest_high_confidence = false
      where id = r.id;
    end if;
  end loop;
  return query select n_match, n_high;
end $$;

select 'normuren matching v2 toegepast' as status;
