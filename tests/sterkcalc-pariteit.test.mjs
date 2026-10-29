// tests/sterkcalc-pariteit.test.mjs — bewijst dat de JS-uitvoering exact gelijk rekent aan de centrale Python-planner
// (zelfde invoer + kennisversie → zelfde canonieke uitkomst) en dat de gesynchroniseerde kennis niet afwijkt van de bron.
// Draaien: node --test tests/sterkcalc-pariteit.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { conceptUitInvoer, plan, act, canoniek } from '../lib/calc/sterkcalc/planner.mjs';

const pad = (f) => new URL(`../lib/sterkcalc-kennis/${f}`, import.meta.url);
const lees = (f) => JSON.parse(readFileSync(pad(f), 'utf8'));
const kennis = lees('kennisregels.json');
const tc = lees('testcases.json');
const bron = lees('BRON.json');
const sha = (f) => createHash('sha256').update(readFileSync(pad(f))).digest('hex');

test('kennis is ongewijzigd t.o.v. de centrale bron (BRON.json) en hoort bij de testcases', () => {
  for (const [f, b] of Object.entries(bron.bestanden)) assert.equal(sha(f), b.sha256, `${f} wijkt af van de centrale bron`);
  // testcases.json noemt de kennis-hash met bestandsnaam-prefix (Python sha()); controleer via herberekening
  const h = createHash('sha256').update(Buffer.concat([Buffer.from('kennisregels.json\0'), readFileSync(pad('kennisregels.json')), Buffer.from('\0')])).digest('hex');
  assert.equal(h, tc.kennis_sha256, 'testcases horen niet bij deze kennisversie');
});

test('geen kandidaat-regel actief in normale verwerking', () => {
  const actief = kennis.regels.filter((r) => ['goedgekeurd', 'vastgesteld'].includes(r.status) && r.relatie);
  const res = conceptUitInvoer({ ploeg: '2', capaciteit: '3', hoofdstukken: [{ code: '40' }, { code: '42' }],
    regels: [{ code: '40.01', hoofdstuk: '40', uren: '8' }, { code: '42.01', hoofdstuk: '42', uren: '8' }] }, kennis);
  assert.deepEqual(res.regelsGebruikt, actief.map((r) => r.id).sort());
});

for (const c of tc.cases) {
  test(`pariteit: ${c.naam}`, () => {
    let uit;
    if (c.type === 'planner') {
      const k = structuredClone(kennis);
      for (const r of k.regels) if (c.kennis_goedgekeurd_test.includes(r.id)) r.status = 'goedgekeurd';   // alleen in deze test
      uit = canoniek(conceptUitInvoer(c.invoer, k, { kandidaten: c.kandidaten }));
    } else {
      const acts = c.invoer.acts.map((d) => act({ ...d, voor: d.voor.map(([v, l]) => [v, l, '', '']) }));
      uit = canoniek(plan(acts, c.invoer.uren, c.invoer.cap));
    }
    assert.deepEqual(uit, c.verwacht);
  });
}
