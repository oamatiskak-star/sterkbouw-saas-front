#!/usr/bin/env node
/**
 * SterkCalc — Seed visuele bibliotheek naar Supabase (idempotent, JSON-gedreven)
 * -----------------------------------------------------------------------------
 * Vult de 4 sterkcalc_visual_*-tabellen vanuit data/sterkcalc_visual_*.json.
 * Equivalent aan de seed in supabase/migrations/20260614_04_*.sql, maar via de
 * service-role client (token-efficiënt, herhaalbaar). Upsert op natuurlijke sleutels.
 *
 * Env: SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * Run: node scripts/seed_sterkcalc_visual_db.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');

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
// WebSocket-shim voor Node < 22 (supabase-js realtime vereist een WebSocket-constructor)
if (!globalThis.WebSocket) { try { globalThis.WebSocket = require('ws'); } catch (_) { /* node 22+ heeft native */ } }
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(URL, KEY, { auth: { persistSession: false } });

const read = f => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));

async function chunked(rows, fn, size = 200) {
  for (let i = 0; i < rows.length; i += size) {
    const { error } = await fn(rows.slice(i, i + size));
    if (error) throw error;
  }
}

async function main() {
  const cats = read('sterkcalc_visual_categories.json').categories;
  const subs = read('sterkcalc_visual_subcategories.json').subcategories;
  const assets = read('sterkcalc_visual_assets.json').assets;
  const cands = read('sterkcalc_visual_asset_candidates.json').candidates;

  await chunked(cats, b => sb.from('sterkcalc_visual_categories').upsert(b, { onConflict: 'code' }));
  console.log(`✓ categories: ${cats.length}`);

  await chunked(subs, b => sb.from('sterkcalc_visual_subcategories').upsert(b, { onConflict: 'category_code,code' }));
  console.log(`✓ subcategories: ${subs.length}`);

  await chunked(assets, b => sb.from('sterkcalc_visual_assets').upsert(b, { onConflict: 'image_key' }));
  console.log(`✓ assets: ${assets.length}`);

  // candidates: geen natuurlijke unieke sleutel → alleen invoegen wanneer leeg
  const { count } = await sb.from('sterkcalc_visual_asset_candidates').select('*', { count: 'exact', head: true });
  if ((count || 0) === 0) {
    await chunked(cands, b => sb.from('sterkcalc_visual_asset_candidates').insert(b));
    console.log(`✓ candidates: ${cands.length}`);
  } else {
    console.log(`• candidates: overgeslagen (${count} bestaande rijen)`);
  }

  console.log('Seed klaar.');
}
main().catch(e => { console.error(e); process.exit(1); });
