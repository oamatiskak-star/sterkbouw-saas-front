#!/usr/bin/env node
/**
 * SterkCalc — Acquisitie van subtegel-afbeeldingen (review-veilig + vision-QA)
 * ---------------------------------------------------------------------------
 * Per subtegel (backlog status='queued' in de opgegeven categorieën):
 *   1. Zoek stock met een CURATED EN-query (scripts/data/visual_search_queries.js),
 *      anders een generieke fallback-query.
 *   2. Pre-filter (deterministisch): landscape, ≥1200px breed, geen pure grayscale
 *      (Pexels avg_color-saturatie), dedup binnen de run.
 *   3. VISION-QA (OpenAI gpt-4o-mini) per kandidaat in relevantievolgorde — keurt af bij:
 *      zichtbare bedrijfsnaam/voertuigtekst/logo/watermerk, zwart-wit/sepia/historisch,
 *      lage kwaliteit, niet-bouwkundig, of geen exacte match. Neem de eerste die slaagt.
 *   4. Geen kandidaat slaagt → status 'needs_generation' (hybride: AI-stap), GEEN slecht beeld.
 *   5. Upload → asset met review_status='pending_review', active=false (NIET live).
 *
 * Veiligheid: zonder --commit-live blijft subcategory.image_key ongezet (icon-fallback).
 * Zonder vision-key wordt geweigerd te acquireren (geen ongefilterde beelden).
 *
 * Env: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (verplicht),
 *      PEXELS_API_KEY|PIXABAY_API_KEY|UNSPLASH_ACCESS_KEY (stock), OPENAI_API_KEY (vision/AI).
 *
 * Run:
 *   node scripts/acquire_sterkcalc_visual_assets.js --category 02,20 --dry-run
 *   node scripts/acquire_sterkcalc_visual_assets.js --category 02,20            # live (pending_review)
 *   node scripts/acquire_sterkcalc_visual_assets.js --category 02,20 --ai-fallback   # misses via AI
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { queries: QUERY_MAP, alt: ALT_MAP } = require('./data/visual_search_queries.js');

const ROOT = path.resolve(__dirname, '..');
const BUCKET = 'sterkcalc-visual-assets';
const VARIANTS = [{ w: 512, h: 288 }, { w: 768, h: 432 }, { w: 1024, h: 576 }];

function arg(name, def) { const i = process.argv.indexOf(name); return i >= 0 ? (process.argv[i + 1] ?? true) : def; }
const DRY = process.argv.includes('--dry-run');
const USE_VARIANTS = process.argv.includes('--variants');
const COMMIT_LIVE = process.argv.includes('--commit-live');
const AI_FALLBACK = process.argv.includes('--ai-fallback');
const NO_VISION = process.argv.includes('--no-vision');
const LIMIT = parseInt(arg('--limit', '200'), 10);
const CATS = String(arg('--category', '') || '').split(',').map(s => s.trim()).filter(Boolean);

(function loadEnv() {
  const p = path.join(ROOT, '.env');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
})();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) { console.error('✖ SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY vereist.'); process.exit(1); }

if (!globalThis.WebSocket) { try { globalThis.WebSocket = require('ws'); } catch (_) {} }
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

let sharp = null;
if (USE_VARIANTS) { try { sharp = require('sharp'); } catch (_) { console.warn('⚠ sharp ontbreekt → native rendition.'); } }

const PEXELS = process.env.PEXELS_API_KEY;
const PIXABAY = process.env.PIXABAY_API_KEY;
const UNSPLASH = process.env.UNSPLASH_ACCESS_KEY;
const OPENAI = process.env.OPENAI_API_KEY;            // image-generatie (gpt-image-1)
const ANTHROPIC = process.env.ANTHROPIC_API_KEY;     // vision-QA (claude vision)
const VISION_MODEL = process.env.VISION_MODEL || 'claude-haiku-4-5-20251001';
const PROVIDERS = [PEXELS && 'pexels', PIXABAY && 'pixabay', UNSPLASH && 'unsplash'].filter(Boolean);
const HAS_STOCK = PROVIDERS.length > 0;
const VISION = !NO_VISION && !!ANTHROPIC;

// ── helpers ──────────────────────────────────────────────────────────────────
function saturation(hex) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex || '');
  if (!m) return 1;
  const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  return mx === 0 ? 0 : (mx - mn) / mx;
}

// pool kandidaten uit alle beschikbare bronnen × alle queries (primair + alt), gededupliceerd.
async function searchPool(queryList) {
  const out = []; const seen = new Set();
  for (const q of queryList) {
    for (const prov of PROVIDERS) {
      let res = [];
      try { res = await searchOne(prov, q); } catch (e) { console.warn(`⚠ ${prov} "${q}": ${e.message}`); }
      for (const c of res) { const k = `${c.provider}:${c.id}`; if (!seen.has(k)) { seen.add(k); out.push(c); } }
    }
  }
  return out;
}

async function searchOne(STOCK, query) {
  if (STOCK === 'pexels') {
    const r = await fetch(`https://api.pexels.com/v1/search?per_page=10&orientation=landscape&query=${encodeURIComponent(query)}`,
      { headers: { Authorization: PEXELS } });
    if (!r.ok) throw new Error(`pexels ${r.status}`);
    const j = await r.json();
    return (j.photos || []).map(p => ({
      provider: 'pexels', id: String(p.id),
      downloadUrl: p.src.landscape || p.src.large2x || p.src.large,
      visionUrl: p.src.large || p.src.landscape, pageUrl: p.url, previewUrl: p.src.medium,
      width: 1200, height: 627, avg: p.avg_color,
      license_note: `Pexels License — foto: ${p.photographer} (${p.url})`,
    }));
  }
  if (STOCK === 'pixabay') {
    const r = await fetch(`https://pixabay.com/api/?per_page=10&image_type=photo&orientation=horizontal&safesearch=true&key=${PIXABAY}&q=${encodeURIComponent(query)}`);
    if (!r.ok) throw new Error(`pixabay ${r.status}`);
    const j = await r.json();
    return (j.hits || []).map(p => ({
      provider: 'pixabay', id: String(p.id), downloadUrl: p.largeImageURL, visionUrl: p.webformatURL,
      pageUrl: p.pageURL, previewUrl: p.webformatURL, width: p.imageWidth, height: p.imageHeight, avg: null,
      license_note: `Pixabay Content License — ${p.pageURL}`,
    }));
  }
  if (STOCK === 'unsplash') {
    const r = await fetch(`https://api.unsplash.com/search/photos?per_page=10&orientation=landscape&query=${encodeURIComponent(query)}`,
      { headers: { Authorization: `Client-ID ${UNSPLASH}` } });
    if (!r.ok) throw new Error(`unsplash ${r.status}`);
    const j = await r.json();
    return (j.results || []).map(p => ({
      provider: 'unsplash', id: p.id, downloadUrl: `${p.urls.raw}&w=1024&h=576&fit=crop&crop=entropy`,
      visionUrl: p.urls.small, pageUrl: p.links.html, previewUrl: p.urls.small, width: 1024, height: 576, avg: p.color,
      license_note: `Unsplash License — foto: ${p.user && p.user.name} (${p.links.html})`,
    }));
  }
  return [];
}

function preFilter(cands, usedIds) {
  return cands
    .filter(c => c.downloadUrl && c.width >= 1200 && c.width >= c.height)
    .filter(c => !usedIds.has(`${c.provider}:${c.id}`))
    .filter(c => saturation(c.avg) >= 0.05); // drop pure grayscale goedkoop vóór vision
}

// VISION-QA via Claude vision: keurt af op branding/tekst/logo/watermerk, z-w/lage kwaliteit, niet-bouwkundig, geen match.
async function visionCheck(imageUrl, nlTitle, catTitle, enQuery) {
  // download + base64 (betrouwbaar over API-versies; ~940px Pexels-large leest machinetekst)
  const ir = await fetch(imageUrl);
  if (!ir.ok) throw new Error(`img ${ir.status}`);
  const media = (ir.headers.get('content-type') || 'image/jpeg').split(';')[0];
  const b64 = Buffer.from(await ir.arrayBuffer()).toString('base64');
  const prompt =
    `Onderwerp van de tegel: "${nlTitle}" (categorie "${catTitle}"). Bedoeld beeld (EN): "${enQuery}".\n` +
    `Beoordeel de afbeelding en geef UITSLUITEND strict JSON:\n` +
    `{"matches": bool (toont duidelijk dit exacte onderwerp/materiaal/handeling),\n` +
    ` "branding_or_text": bool (ENIGE leesbare merknaam, bedrijfsnaam, voertuigbelettering, gereedschap-/machinemerk, sponsortekst, logo, watermerk of prominente tekst zichtbaar — bij twijfel true),\n` +
    ` "bw_or_lowquality": bool (zwart-wit, sepia, historisch, wazig of lage kwaliteit),\n` +
    ` "is_construction": bool (bouwkundige/renovatie-context)}`;
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': ANTHROPIC, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: VISION_MODEL, max_tokens: 200, temperature: 0,
      system: 'Je bent strenge beeld-QA voor een Nederlandse bouwcalculatie-app. Antwoord uitsluitend met JSON.',
      messages: [{ role: 'user', content: [
        { type: 'image', source: { type: 'base64', media_type: media, data: b64 } },
        { type: 'text', text: prompt },
      ] }],
    }),
  });
  if (!r.ok) throw new Error(`vision ${r.status}`);
  const j = await r.json();
  const text = (j.content && j.content[0] && j.content[0].text) || '';
  let v = {}; const m = text.match(/\{[\s\S]*\}/); try { v = JSON.parse(m ? m[0] : text); } catch (_) { return { ok: false, v: null }; }
  const ok = v.matches === true && v.branding_or_text === false && v.bw_or_lowquality === false && v.is_construction === true;
  return { ok, v };
}

async function downloadBuffer(url) { const r = await fetch(url); if (!r.ok) throw new Error(`download ${r.status}`); return Buffer.from(await r.arrayBuffer()); }

async function generateAI(catTitle, nlTitle, enQuery) {
  if (!OPENAI) return null;
  const prompt = `Professional construction detail photograph, realistic Dutch construction/renovation context. Subject: ${enQuery} (${nlTitle}). Photorealistic, natural light, sharp focus, 16:9. Absolutely no text, no logos, no watermark, no brand names, no people's faces in focus. Clean editorial stock look.`;
  const r = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI}` },
    body: JSON.stringify({ model: 'gpt-image-1', prompt, size: '1536x1024', n: 1 }),
  });
  if (!r.ok) { console.warn(`⚠ AI-gen ${r.status} (${nlTitle})`); return null; }
  const j = await r.json();
  const b64 = j.data && j.data[0] && j.data[0].b64_json;
  return b64 ? Buffer.from(b64, 'base64') : null;
}

function dims(buf, fb) {
  try {
    if (buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    if (buf[0] === 0xff && buf[1] === 0xd8) { let o = 2; while (o < buf.length) { if (buf[o] !== 0xff) { o++; continue; } const m = buf[o + 1]; if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { height: buf.readUInt16BE(o + 5), width: buf.readUInt16BE(o + 7) }; o += 2 + buf.readUInt16BE(o + 2); } }
  } catch (_) {}
  return fb || { width: null, height: null };
}

async function storeImage(imageKey, catCode, buf, providerWH, ext0) {
  if (sharp) {
    let sp = null, ck = null;
    for (const v of VARIANTS) {
      const out = await sharp(buf).resize(v.w, v.h, { fit: 'cover', position: 'attention' }).webp({ quality: 82 }).toBuffer();
      const key = `${catCode}/${imageKey}_${v.w}x${v.h}.webp`;
      if (v.w === 768) { sp = key; ck = crypto.createHash('sha256').update(out).digest('hex'); }
      const up = await supabase.storage.from(BUCKET).upload(key, out, { contentType: 'image/webp', upsert: true });
      if (up.error) throw up.error;
    }
    return { storagePath: sp, checksum: ck, width: 768, height: 432, file_type: 'webp' };
  }
  const wh = dims(buf, providerWH); const ext = ext0 || 'jpg';
  const key = `${catCode}/${imageKey}.${ext}`;
  const up = await supabase.storage.from(BUCKET).upload(key, buf, { contentType: ext === 'png' ? 'image/png' : 'image/jpeg', upsert: true });
  if (up.error) throw up.error;
  return { storagePath: key, checksum: crypto.createHash('sha256').update(buf).digest('hex'), width: wh.width, height: wh.height, file_type: ext };
}

async function ensureBucket() { const { data } = await supabase.storage.listBuckets(); if ((data || []).some(b => b.name === BUCKET)) return; if (!DRY) await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {}); }

async function main() {
  if (!CATS.length) { console.error('✖ Geef --category op, bv. --category 02,20'); process.exit(1); }
  console.log(`Acquire | cats=${CATS.join(',')} stock=${PROVIDERS.join('+') || 'GEEN'} vision=${VISION ? VISION_MODEL : 'UIT'} ai-fallback=${AI_FALLBACK && OPENAI ? 'ja' : 'nee'} ${DRY ? '[DRY]' : COMMIT_LIVE ? '[LIVE]' : '[pending_review]'}`);
  if (!HAS_STOCK && !(AI_FALLBACK && OPENAI)) { console.error('✖ Geen stock-key.'); process.exit(1); }
  if (HAS_STOCK && !VISION && !DRY) { console.error('✖ Vision-QA uit. Zet ANTHROPIC_API_KEY of gebruik --no-vision bewust.'); process.exit(1); }
  await ensureBucket();

  const { data: backlog, error } = await supabase.from('sterkcalc_visual_asset_candidates')
    .select('id, category_code, subcategory_code, search_query, status').eq('status', 'queued')
    .in('category_code', CATS).order('category_code').order('subcategory_code').limit(LIMIT);
  if (error) throw error;
  const { data: subs } = await supabase.from('sterkcalc_visual_subcategories').select('category_code, code, title, image_key').in('category_code', CATS);
  const subIndex = new Map((subs || []).map(s => [`${s.category_code}/${s.code}`, s]));
  const { data: cats } = await supabase.from('sterkcalc_visual_categories').select('code, title').in('code', CATS);
  const catTitle = new Map((cats || []).map(c => [c.code, c.title]));

  const usedIds = new Set();
  let stock = 0, aiN = 0, needGen = 0, fail = 0, visionRej = 0;

  for (const cand of backlog || []) {
    const sub = subIndex.get(`${cand.category_code}/${cand.subcategory_code}`);
    if (!sub) continue;
    const key = `${cand.category_code}/${cand.subcategory_code}`;
    const enQuery = QUERY_MAP[key] || `${sub.title} construction detail building site`;
    const ct = catTitle.get(cand.category_code) || '';

    const queryList = [enQuery, ...(ALT_MAP[key] || [])];
    let results = [];
    try { results = HAS_STOCK ? await searchPool(queryList) : []; } catch (e) { console.warn(`⚠ zoek (${sub.title}): ${e.message}`); }
    const pool = preFilter(results, usedIds);

    if (!DRY && results.length) {
      await supabase.from('sterkcalc_visual_asset_candidates').insert(results.slice(0, 5).map(r => ({
        category_code: cand.category_code, subcategory_code: cand.subcategory_code, search_query: enQuery,
        source_type: r.provider, source_url: r.pageUrl, preview_url: r.previewUrl, license_note: r.license_note, status: 'found',
      })));
    }

    // VISION-QA: kies eerste kandidaat die slaagt
    let chosen = null, visionVerdict = null;
    for (const c of pool.slice(0, 8)) {
      if (!VISION) { chosen = c; break; }
      try {
        const { ok, v } = await visionCheck(c.visionUrl || c.downloadUrl, sub.title, ct, enQuery);
        if (ok) { chosen = c; visionVerdict = v; break; }
        visionRej++;
      } catch (e) { console.warn(`⚠ vision (${sub.title}): ${e.message}`); }
    }

    if (DRY) {
      console.log(`  ${key} ${sub.title.padEnd(26)} → ${chosen ? `${chosen.provider}:${chosen.id}` : (pool.length ? 'ALLE afgekeurd door vision' : 'geen stock')} (${pool.length}/${results.length} na pre-filter)`);
      if (chosen) usedIds.add(`${chosen.provider}:${chosen.id}`);
      continue;
    }

    // download + (optioneel) AI-fallback
    let buf = null, sourceType = null, license = null, sourceUrl = null, licenseNote = null, ext = 'jpg';
    if (chosen) {
      try { buf = await downloadBuffer(chosen.downloadUrl); sourceType = chosen.provider; license = 'rechtenvrij'; sourceUrl = chosen.pageUrl; licenseNote = chosen.license_note; usedIds.add(`${chosen.provider}:${chosen.id}`); }
      catch (e) { console.warn(`⚠ download (${sub.title}): ${e.message}`); }
    }
    if (!buf && AI_FALLBACK && OPENAI) {
      buf = await generateAI(ct, sub.title, enQuery);
      if (buf) { sourceType = 'ai_generated'; license = 'eigen_generatie'; sourceUrl = null; licenseNote = `AI gegenereerd (gpt-image-1): ${enQuery}`; ext = 'png'; aiN++; }
    }

    if (!buf) {
      needGen++;
      // ruim een eventuele eerdere (pending_review) asset op zodat de review klopt: geen beeld → AI nodig
      await supabase.from('sterkcalc_visual_assets').delete().eq('image_key', sub.image_key).eq('review_status', 'pending_review');
      await supabase.from('sterkcalc_visual_asset_candidates').update({ status: 'needs_generation', rejected_reason: 'geen stock-kandidaat door QA goedgekeurd' }).eq('id', cand.id);
      continue;
    }

    try {
      const st = await storeImage(sub.image_key, cand.category_code, buf, chosen ? { width: chosen.width, height: chosen.height } : null, ext);
      const pub = supabase.storage.from(BUCKET).getPublicUrl(st.storagePath).data.publicUrl;
      const { error: upErr } = await supabase.from('sterkcalc_visual_assets').upsert({
        image_key: sub.image_key, title: sub.title, category_code: cand.category_code, subcategory_code: cand.subcategory_code,
        source_type: sourceType, source_url: sourceUrl || pub, license_status: license, description: licenseNote,
        storage_path: st.storagePath, checksum: st.checksum, width: st.width, height: st.height, file_type: st.file_type,
        active: COMMIT_LIVE, review_status: COMMIT_LIVE ? 'approved' : 'pending_review',
      }, { onConflict: 'image_key' });
      if (upErr) throw upErr;
      await supabase.from('sterkcalc_visual_asset_candidates').update({ status: 'acquired', selected: true }).eq('id', cand.id);
      if (COMMIT_LIVE) await supabase.from('sterkcalc_visual_subcategories').update({ image_key: sub.image_key }).eq('category_code', cand.category_code).eq('code', cand.subcategory_code);
      if (sourceType === 'ai_generated') {} else stock++;
      const n = stock + aiN;
      if (n % 5 === 0) console.log(`  …${n} beelden`);
    } catch (e) { console.error(`✖ ${sub.image_key}: ${e.message}`); fail++; }
  }

  console.log(`\nKlaar (${DRY ? 'dry' : 'live'}). stock=${stock} ai=${aiN} needs_generation=${needGen} vision-afkeuringen=${visionRej} mislukt=${fail} verwerkt=${(backlog || []).length}`);
  if (!DRY) console.log(COMMIT_LIVE ? 'LIVE (approved).' : 'pending_review — werktafel toont icon-fallback. Review: node scripts/build_pilot_review.js --category ' + CATS.join(','));
}

main().catch(e => { console.error(e); process.exit(1); });
