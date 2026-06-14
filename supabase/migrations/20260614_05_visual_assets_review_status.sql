-- SterkCalc — review-lifecycle voor visuele assets (additief)
-- Doel-DB: pmovazftwoxjopqkuuhp. Voegt review_status toe zodat geacquireerde
-- beelden eerst pending_review zijn en NIET automatisch live in de werktafel
-- verschijnen. Live pas na approval (asset.active=true + subcategory.image_key).
alter table public.sterkcalc_visual_assets
  add column if not exists review_status text not null default 'pending_review';

-- pending_review | approved | rejected
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'scv_assets_review_status_chk') then
    alter table public.sterkcalc_visual_assets
      add constraint scv_assets_review_status_chk
      check (review_status in ('pending_review','approved','rejected'));
  end if;
end $$;

create index if not exists idx_scv_assets_review on public.sterkcalc_visual_assets(review_status, category_code);

-- Bestaande 44 hoofdtegel-foto's zijn al geverifieerd/live → markeer approved.
update public.sterkcalc_visual_assets
  set review_status = 'approved'
  where source_type = 'own_repo' and review_status = 'pending_review';
