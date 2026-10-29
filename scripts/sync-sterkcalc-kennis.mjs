// scripts/sync-sterkcalc-kennis.mjs — haalt de CENTRALE SterkCalc-kennis (repo strkbouw-nl-web, map sterkcalc-kennis/) op in
// lib/sterkcalc-kennis/ met herkomst (commit) en sha256 per bestand in BRON.json. Deze bestanden worden in het portaal NOOIT
// met de hand bewerkt; wijzigen gebeurt centraal (kandidaat → QA → goedkeuring Orlando) en daarna opnieuw synchroniseren.
// Gebruik: STERKCALC_KENNIS_REPO=<pad naar strkbouw-nl-web checkout> node scripts/sync-sterkcalc-kennis.mjs
import { createHash } from 'node:crypto';
import { copyFileSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const REPO = process.env.STERKCALC_KENNIS_REPO || join(homedir(), 'Code/strkbouw-kennisbank');
const DOEL = join(dirname(fileURLToPath(import.meta.url)), '..', 'lib', 'sterkcalc-kennis');
const BESTANDEN = {
  'kennisregels.json': 'sterkcalc-kennis/kennisregels.json',
  'testcases.json': 'sterkcalc-kennis/planning/pariteit/testcases.json',
  'portaal_categorie_stabu.json': 'sterkcalc-kennis/mapping/portaal_categorie_stabu.json',
};
// QA8 C-L5: alleen synchroniseren uit een schone werkboom (vastgelegde commit = exact wat gekopieerd wordt)
const vuil = execFileSync('git', ['-C', REPO, 'status', '--porcelain', '--', 'sterkcalc-kennis']).toString().trim();
if (vuil) { console.error(`sync geweigerd: niet-vastgelegde wijzigingen in ${REPO}/sterkcalc-kennis:\n${vuil}`); process.exit(1); }
mkdirSync(DOEL, { recursive: true });
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const bron = {
  repo: 'oamatiskak-star/strkbouw-nl-web',
  commit: execFileSync('git', ['-C', REPO, 'rev-parse', 'HEAD']).toString().trim(),
  branch: execFileSync('git', ['-C', REPO, 'rev-parse', '--abbrev-ref', 'HEAD']).toString().trim(),
  gesynchroniseerd_op: new Date().toISOString().slice(0, 19),
  bestanden: {},
};
for (const [naam, rel] of Object.entries(BESTANDEN)) {
  copyFileSync(join(REPO, rel), join(DOEL, naam));
  bron.bestanden[naam] = { bron: rel, sha256: sha(join(DOEL, naam)) };
}
writeFileSync(join(DOEL, 'BRON.json'), JSON.stringify(bron, null, 1) + '\n');
if (bron.branch !== 'main') console.warn(`LET OP: bron is branch '${bron.branch}', niet main — alleen voor schaduw/QA, niet voor activatie`);
console.log(`gesynchroniseerd uit ${bron.repo}@${bron.commit.slice(0, 7)} (${bron.branch}) → lib/sterkcalc-kennis/`);
