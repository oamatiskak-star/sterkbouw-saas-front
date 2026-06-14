#!/usr/bin/env node
/**
 * SterkCalc — Review-rapport voor geacquireerde subtegel-beelden
 * -------------------------------------------------------------
 * Leest sterkcalc_visual_assets (subtegel-beelden) voor de opgegeven categorieën
 * en schrijft:
 *   - public/sterkcalc/visual-assets/_pilot_review.html  (contactvel: beeld + bron + licentie)
 *   - data/pilot_review_<cats>.json                      (machine-leesbaar rapport)
 * Markeert dedup (zelfde source_url voor meerdere subtegels) en ontbrekende dims.
 *
 * Run: node scripts/build_pilot_review.js --category 02,20
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
function arg(n, d) { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : d; }
const CATS = String(arg('--category', '') || '').split(',').map(s => s.trim()).filter(Boolean);

(function loadEnv() {
  const p = path.join(ROOT, '.env');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
})();
const URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) { console.error('✖ SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY vereist.'); process.exit(1); }
if (!globalThis.WebSocket) { try { globalThis.WebSocket = require('ws'); } catch (_) {} }
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(URL, KEY, { auth: { persistSession: false } });

const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

async function main() {
  if (!CATS.length) { console.error('✖ Geef --category op, bv. --category 02,20'); process.exit(1); }
  const { data: cats } = await sb.from('sterkcalc_visual_categories').select('code, title').in('code', CATS);
  const catTitle = new Map((cats || []).map(c => [c.code, c.title]));
  const { data: assets, error } = await sb.from('sterkcalc_visual_assets')
    .select('image_key, title, category_code, subcategory_code, source_type, source_url, license_status, description, storage_path, width, height, file_type, review_status, active')
    .in('category_code', CATS).not('subcategory_code', 'is', null)
    .order('category_code').order('subcategory_code');
  if (error) throw error;

  const pubBase = `${URL}/storage/v1/object/public/sterkcalc-visual-assets/`;
  const seen = new Map();
  const rows = (assets || []).map(a => {
    const dupOf = seen.get(a.source_url);
    if (a.source_url) seen.set(a.source_url, a.image_key);
    return { ...a, public_url: a.storage_path ? pubBase + a.storage_path : null, duplicate_of: dupOf || null };
  });
  const flags = {
    total: rows.length,
    pending_review: rows.filter(r => r.review_status === 'pending_review').length,
    duplicates: rows.filter(r => r.duplicate_of).length,
    missing_dims: rows.filter(r => !r.width || !r.height).length,
    missing_license: rows.filter(r => !r.license_status).length,
  };

  fs.writeFileSync(path.join(ROOT, 'data', `pilot_review_${CATS.join('-')}.json`),
    JSON.stringify({ _meta: { generated: 'pilot', cats: CATS, flags }, assets: rows }, null, 2) + '\n');

  const cards = rows.map(r => `
    <div class="card${r.duplicate_of ? ' dup' : ''}">
      <div class="thumb">${r.public_url ? `<img loading="lazy" src="${esc(r.public_url)}" alt="${esc(r.title)}">` : '<div class=noimg>geen beeld</div>'}</div>
      <div class="meta">
        <b>${esc(r.category_code)}/${esc(r.subcategory_code)} — ${esc(r.title)}</b>
        <span>${esc(r.source_type)} · ${esc(r.license_status || 'GEEN LICENTIE')} · ${r.width || '?'}×${r.height || '?'} ${esc(r.file_type)}</span>
        <span class="rev ${esc(r.review_status)}">${esc(r.review_status)}${r.active ? ' · live' : ''}</span>
        ${r.duplicate_of ? `<span class="warn">DUPLICAAT van ${esc(r.duplicate_of)}</span>` : ''}
        <a href="${esc(r.source_url)}" target="_blank" rel="noopener">bron/attributie</a>
        <code>${esc(r.storage_path)}</code>
      </div>
    </div>`).join('');

  const html = `<!doctype html><html lang=nl><meta charset=utf-8>
<title>SterkCalc pilot-review ${esc(CATS.join(', '))}</title>
<style>
 body{font:14px/1.4 system-ui,sans-serif;margin:24px;background:#0f1115;color:#e7e9ee}
 h1{font-size:18px} .sum{background:#1a1d24;padding:12px 16px;border-radius:8px;margin-bottom:16px}
 .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
 .card{background:#1a1d24;border-radius:8px;overflow:hidden;border:1px solid #262b35}
 .card.dup{border-color:#b9770e}
 .thumb{aspect-ratio:16/9;background:#0b0d11;display:flex;align-items:center;justify-content:center}
 .thumb img{width:100%;height:100%;object-fit:cover;display:block}
 .noimg{color:#666;font-size:12px} .meta{padding:10px;display:flex;flex-direction:column;gap:4px}
 .meta span,.meta code,.meta a{font-size:12px;color:#9aa3b2} .meta b{font-size:13px;color:#e7e9ee}
 .rev.pending_review{color:#e0b341} .rev.approved{color:#54c98a} .warn{color:#e0853b;font-weight:600}
 code{word-break:break-all;color:#6b7280} a{color:#6ea8fe}
</style>
<h1>SterkCalc — pilot-review: ${CATS.map(c => `${esc(c)} ${esc(catTitle.get(c) || '')}`).join(' · ')}</h1>
<div class=sum>totaal <b>${flags.total}</b> · pending_review <b>${flags.pending_review}</b> · duplicaten <b>${flags.duplicates}</b> · zonder dims <b>${flags.missing_dims}</b> · zonder licentie <b>${flags.missing_license}</b><br>
<small>Controleer visueel: kwaliteit, relevantie, geen watermark/tekst/logo. Beelden staan op pending_review en zijn NIET live in de werktafel.</small></div>
<div class=grid>${cards}</div>`;

  fs.writeFileSync(path.join(ROOT, 'public', 'sterkcalc', 'visual-assets', '_pilot_review.html'), html);
  console.log(`Review-rapport: public/sterkcalc/visual-assets/_pilot_review.html`);
  console.log(`Flags:`, flags);
}
main().catch(e => { console.error(e); process.exit(1); });
