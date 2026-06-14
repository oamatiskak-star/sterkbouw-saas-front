#!/usr/bin/env node
/**
 * SterkCalc — Upload visuele assets naar Supabase Storage
 * -------------------------------------------------------
 * Leest data/sterkcalc_visual_assets.json, uploadt elk asset met een geldig
 * `local_path` (uit /public) naar de bucket `sterkcalc-visual-assets` op het
 * pad `storage_path`, en werkt de rij in public.sterkcalc_visual_assets bij met
 * storage_path, checksum (sha256), width/height en de publieke URL.
 *
 * Env (uit .env of shell):
 *   SUPABASE_URL            (fallback NEXT_PUBLIC_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Run:
 *   node scripts/upload_sterkcalc_visual_assets.js            # upload alles
 *   node scripts/upload_sterkcalc_visual_assets.js --dry-run  # toon plan
 *
 * Niet-destructief: maakt de bucket aan als die ontbreekt, upsert per bestand.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const BUCKET = 'sterkcalc-visual-assets';
const ASSETS_JSON = path.join(ROOT, 'data', 'sterkcalc_visual_assets.json');
const DRY = process.argv.includes('--dry-run');

// ── minimale .env-loader (alleen wanneer var ontbreekt in shell) ─────────────
function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}
loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('✖ Ontbrekende env: SUPABASE_URL en/of SUPABASE_SERVICE_ROLE_KEY.');
  console.error('  Zet ze in .env of de shell en draai opnieuw.');
  process.exit(1);
}

// WebSocket-shim voor Node < 22 (supabase-js realtime vereist een WebSocket-constructor)
if (!globalThis.WebSocket) { try { globalThis.WebSocket = require('ws'); } catch (_) { /* node 22+ heeft native */ } }
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const MIME = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

// PNG/JPEG-dimensies zonder externe libs (best effort; null bij onbekend).
function readDimensions(buf) {
  try {
    if (buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let o = 2;
      while (o < buf.length) {
        if (buf[o] !== 0xff) { o++; continue; }
        const marker = buf[o + 1];
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          return { height: buf.readUInt16BE(o + 5), width: buf.readUInt16BE(o + 7) };
        }
        o += 2 + buf.readUInt16BE(o + 2);
      }
    }
  } catch (_) { /* negeer */ }
  return { width: null, height: null };
}

async function ensureBucket() {
  const { data } = await supabase.storage.listBuckets();
  if ((data || []).some(b => b.name === BUCKET)) return;
  if (DRY) { console.log(`(dry-run) zou bucket '${BUCKET}' (public) aanmaken`); return; }
  const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
  if (error && !/already exists/i.test(error.message)) throw error;
  console.log(`✓ bucket '${BUCKET}' aangemaakt (public)`);
}

async function main() {
  const { assets } = JSON.parse(fs.readFileSync(ASSETS_JSON, 'utf8'));
  await ensureBucket();

  let uploaded = 0, skipped = 0, failed = 0;
  for (const a of assets) {
    if (!a.local_path) { skipped++; continue; }
    const localFile = path.join(ROOT, 'public', a.local_path.replace(/^\//, ''));
    if (!fs.existsSync(localFile)) {
      console.warn(`⚠ bron ontbreekt: ${a.local_path} (${a.image_key})`);
      skipped++; continue;
    }
    const buf = fs.readFileSync(localFile);
    const checksum = crypto.createHash('sha256').update(buf).digest('hex');
    const { width, height } = readDimensions(buf);
    const ext = (a.file_type || path.extname(localFile).slice(1) || 'jpg').toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';

    if (DRY) {
      console.log(`(dry-run) ${a.image_key} -> ${BUCKET}/${a.storage_path} [${width}x${height}]`);
      continue;
    }

    const up = await supabase.storage.from(BUCKET).upload(a.storage_path, buf, { contentType, upsert: true });
    if (up.error) { console.error(`✖ upload ${a.image_key}: ${up.error.message}`); failed++; continue; }

    const pub = supabase.storage.from(BUCKET).getPublicUrl(a.storage_path).data.publicUrl;
    const { error: dbErr } = await supabase.from('sterkcalc_visual_assets')
      .update({ storage_path: a.storage_path, checksum, width, height, source_url: pub })
      .eq('image_key', a.image_key);
    if (dbErr) { console.error(`✖ db-update ${a.image_key}: ${dbErr.message}`); failed++; continue; }

    uploaded++;
    if (uploaded % 10 === 0) console.log(`  …${uploaded} geüpload`);
  }

  console.log(`\nKlaar. geüpload=${uploaded} overgeslagen=${skipped} mislukt=${failed}`);
  if (failed) process.exit(1);
}

main().catch(e => { console.error(e); process.exit(1); });
