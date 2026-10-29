// lib/calc/sterkcalc/planner.mjs — JavaScript-UITVOERING van de centrale SterkCalc-planner (I-6, optie B, schaduwmodus).
// Bron van waarheid blijft de centrale kennisbasis (repo strkbouw-nl-web, sterkcalc-kennis/: planning_engine.py +
// stabu_planner.py + kennisregels.json). Dit bestand bevat GEEN eigen planningsregels: volgorde, wachttijden en terugkommomenten
// komen uitsluitend uit de meegegeven kennisregels. Pariteit wordt bewezen met tests/sterkcalc-pariteit.test.mjs op de centrale
// testcases (zelfde invoer + kennisversie → exact dezelfde canonieke uitkomst). Rekent alleen met uren; geen tarieven/opslagen.
// Exacte rekenkunde: uren/ploeg/capaciteit als BigInt × 10.000; tijd in eenheden van een halve werkdag (4 uur).

const SCHAAL = 10000n;
const PER_DAG = 2n;                 // eenheden per werkdag (8 u / 4 u)
const PLOEG_GRENS_E4 = 160000n;     // 16 u: ploeg automatisch 1 (< 16 u) of 2

export const ACTIEF = new Set(['goedgekeurd', 'vastgesteld']);
export const VOORBEELD = new Set(['kandidaat', 'in_qa']);

// Decimale tekst/getal → BigInt × 10.000 (exact; max. 4 decimalen, zoals de Python-referentie).
export function e4(x) {
  if (typeof x === 'bigint') return x * SCHAAL;
  const s = String(x).trim();
  const m = /^(-?)(\d*)(?:\.(\d*))?$/.exec(s);
  if (!m || (m[2] === '' && (m[3] ?? '') === '')) throw new Error(`geen getal: ${x}`);
  const frac = (m[3] || '');
  if (frac.replace(/0+$/, '').length > 4) throw new Error(`meer dan 4 decimalen: ${x}`);
  const v = BigInt(m[2] || '0') * SCHAAL + BigInt((frac + '0000').slice(0, 4));
  return m[1] ? -v : v;
}
const ceilDiv = (a, b) => (a <= 0n ? -((-a) / b) : (a + b - 1n) / b);   // b > 0
const halveDagen = (wdE4) => ceilDiv(wdE4 * PER_DAG, SCHAAL);          // werkdagen (×10⁴) → eenheden, naar boven
const maxBig = (arr, d = 0n) => arr.reduce((m, x) => (x > m ? x : m), arr.length ? arr[0] : d);

// Act-velden zoals planning_engine.Act. voor: [[id, wachttijdWd(string), status, bron]].
export function act(d) {
  return { onderdeel: 'G', codes: [], ploeg: null, duur: null, duur_status: '', duur_bron: '', voor: [], capaciteit: true,
    soort: 'werk', discipline: '', noot: '', ...d };
}

// Port van planning_engine.plan(); retourneert {fout:[...]} of het volledige resultaat (velden als in Python).
export function plan(acts, urenPerCode, dagcapaciteit) {
  const cap = e4(dagcapaciteit);
  const A = new Map();
  for (const a of acts) A.set(a.id, a);
  const fout = [];
  if (A.size !== acts.length) fout.push({ code: 'id_dubbel' });
  const gezien = new Map();
  for (const a of acts) for (const c of a.codes) { if (!gezien.has(c)) gezien.set(c, []); gezien.get(c).push(a.id); }
  const uren = new Map(Object.entries(urenPerCode).map(([c, u]) => [c, e4(u)]));
  for (const [c, u] of uren) if (u !== 0n && !gezien.has(c)) fout.push({ code: `regel_niet_gepland:${c}` });
  for (const [c, ids] of gezien) {
    if (ids.length > 1) fout.push({ code: `regel_dubbel:${c}` });
    if (!uren.has(c)) fout.push({ code: `regel_onbekend:${c}` });
  }
  for (const a of acts) {
    for (const [v, lag] of a.voor) {
      if (!A.has(v)) fout.push({ code: `voorganger_onbekend:${a.id}>${v}` });
      if (e4(lag) < 0n) fout.push({ code: `wachttijd_negatief:${a.id}>${v}` });
    }
    a._uren = a.codes.reduce((s, c) => s + (uren.get(c) ?? 0n), 0n);
    a._ploeg = a.ploeg === null || a.ploeg === undefined ? (a._uren < PLOEG_GRENS_E4 ? SCHAAL : 2n * SCHAAL) : e4(a.ploeg);
    if (a.capaciteit && a._uren !== 0n && a._ploeg > cap) fout.push({ code: `ploeg_boven_capaciteit:${a.id}` });
    if (a.duur !== null && a.duur !== undefined) {
      const d = e4(a.duur);
      if (d < 0n) fout.push({ code: `duur_negatief:${a.id}` });
      a.u = halveDagen(d);
    } else {
      a.u = a._uren !== 0n ? ceilDiv(a._uren, a._ploeg * 4n) : 0n;   // uren / (ploeg × 4 u)
    }
  }
  // topologische volgorde (zelfde DFS als Python: acts-volgorde, voorgangersvolgorde)
  const volg = [], tijdelijk = new Set(), klaar = new Set();
  const bezoek = (i) => {
    if (klaar.has(i) || !A.has(i)) return;
    if (tijdelijk.has(i)) { fout.push({ code: `kring:${i}` }); return; }
    tijdelijk.add(i);
    for (const [v] of A.get(i).voor) bezoek(v);
    tijdelijk.delete(i); klaar.add(i); volg.push(i);
  };
  for (const a of acts) bezoek(a.id);
  if (fout.length) return { fout: fout.map((f) => f.code) };
  const lagu = (lag) => halveDagen(e4(lag));
  for (const i of volg) {
    const a = A.get(i);
    a.es = maxBig(a.voor.map(([v, lag]) => A.get(v).ef + lagu(lag)), 0n); a.ef = a.es + a.u;
  }
  const eind = maxBig(acts.map((a) => a.ef));
  const opv = new Map(acts.map((a) => [a.id, []]));
  for (const a of acts) for (const [v, lag] of a.voor) opv.get(v).push([a.id, lagu(lag)]);
  for (const i of [...volg].reverse()) {
    const a = A.get(i);
    const o = opv.get(i);
    a.lf = o.length ? o.reduce((m, [x, lag]) => { const w = A.get(x).ls - lag; return w < m ? w : m; }, A.get(o[0][0]).ls - o[0][1]) : eind;
    a.ls = a.lf - a.u; a.spel = a.ls - a.es; a.kritiek = a.spel === 0n; a.opvolgers = o.map(([x]) => x);
  }
  const bezet = new Map();
  const open = [...volg];
  const index = new Map(volg.map((x, k) => [x, k]));
  while (open.length) {
    const kand = open.filter((i) => A.get(i).voor.every(([v]) => A.has(v) && A.get(v).cf !== undefined));
    let i = kand[0];
    for (const x of kand) {
      const a = A.get(x), b = A.get(i);
      if (a.ls < b.ls || (a.ls === b.ls && index.get(x) < index.get(i))) i = x;
    }
    const a = A.get(i);
    let t = maxBig(a.voor.map(([v, lag]) => A.get(v).cf + lagu(lag)), 0n);
    const last = a.capaciteit && a.u !== 0n ? a._ploeg : 0n;
    const vol = (tt) => { for (let k = 0n; k < a.u; k++) if ((bezet.get(tt + k) ?? 0n) + last > cap) return true; return false; };
    while (last !== 0n && vol(t)) t += 1n;
    for (let k = 0n; k < a.u; k++) bezet.set(t + k, (bezet.get(t + k) ?? 0n) + last);
    a.cs = t; a.cf = t + a.u;
    open.splice(open.indexOf(i), 1);
  }
  return {
    fout: [], acts, volg, eindCpm: eind, eindCap: maxBig(acts.map((a) => a.cf)),
    kritiek: volg.filter((i) => A.get(i).kritiek && A.get(i).u > 0n),
    urenE4: acts.reduce((s, a) => s + a._uren, 0n), piekE4: maxBig([...bezet.values()], 0n),
  };
}

// Port van stabu_planner.concept_uit_invoer(). kennis = inhoud van kennisregels.json (centraal, gesynchroniseerd).
export function conceptUitInvoer(invoer, kennis, { kandidaten = false } = {}) {
  const toegestaan = new Set([...ACTIEF, ...(kandidaten ? VOORBEELD : [])]);
  const rel = kennis.regels.filter((r) => r.relatie && toegestaan.has(r.status));
  const disc = kennis.stabu_discipline || {};
  const ploeg = String(invoer.ploeg ?? '2'), cap = String(invoer.capaciteit ?? '3');
  const uren = {}, perH = new Map(), oms = {};
  for (const r of invoer.regels) {
    if (e4(r.uren) !== 0n) {
      uren[r.code] = String(r.uren);
      if (!perH.has(r.hoofdstuk)) perH.set(r.hoofdstuk, []);
      perH.get(r.hoofdstuk).push(r.code); oms[r.code] = r.omschrijving ?? '';
    }
  }
  const namen = Object.fromEntries(invoer.hoofdstukken.map((h) => [h.code, h.naam ?? '']));
  const acts = [act({ id: 'START', naam: 'START BOUW', duur: '0', soort: 'mijlpaal', capaciteit: false })];
  const ids = new Map();
  for (const { code: h } of invoer.hoofdstukken) {
    if (!perH.has(h)) continue;
    const a = act({ id: `H${h}`, naam: `STABU ${h} ${namen[h] ?? ''} — ${disc[h] ?? 'discipline n.t.b.'}`, codes: [...perH.get(h)],
      ploeg, discipline: disc[h] ?? '', voor: [['START', '0', '', '']] });
    acts.push(a); ids.set(h, a);
  }
  const toegepast = [];
  for (const r of rel) {
    const x = r.relatie;
    if (x.type === 'volgorde') {
      for (const na of x.na) for (const vo of x.voor) {
        if (ids.has(na) && ids.has(vo) && na !== vo) { ids.get(na).voor.push([ids.get(vo).id, '0', '', r.id]); toegepast.push(`${r.id}: ${vo}→${na}`); }
      }
    }
    if (x.type === 'wachttijd' && ids.has(x.na_hoofdstuk)) {
      const h = x.na_hoofdstuk;
      acts.push(act({ id: `W${h}`, naam: `Wachttijd na STABU ${h} (${r.titel}) — INVOER VEREIST: duur uit bestek/fabrikant`,
        duur: x.duur ?? '0', duur_status: x.duur === null || x.duur === undefined ? 'INVOER VEREIST' : 'F', soort: 'wacht', capaciteit: false,
        voor: [[ids.get(h).id, '0', '', r.id]] }));
      toegepast.push(`${r.id}: wachttijd na ${h} (duur ontbreekt → invoer vereist)`);
    }
  }
  const plint = (perH.get('45') || []).filter((c) => oms[c].toLowerCase().includes('plint'));
  if (plint.length && ids.has('45') && acts.some((a) => a.id === 'W42') && rel.some((r) => r.id === 'PL-006')) {
    ids.get('45').codes = ids.get('45').codes.filter((c) => !plint.includes(c));
    acts.push(act({ id: 'T45', naam: 'Terugkommoment: plinten na vloerafwerking door derden (PL-006)', codes: plint, voor: [['W42', '0', '', 'PL-006']] }));
    toegepast.push('PL-006: terugkommoment plinten ' + plint.join(', '));
  }
  acts.push(act({ id: 'EINDE', naam: 'EINDE HOOFDUITVOERING (concept)', duur: '0', soort: 'mijlpaal', capaciteit: false,
    voor: acts.filter((a) => a.id !== 'START' && a.id !== 'T45' && !a.id.startsWith('W')).map((a) => [a.id, '0', '', '']) }));
  const res = plan(acts, uren, cap);
  if (res.fout.length) return res;
  return { ...res, toegepast, urenCalcE4: Object.values(uren).reduce((s, u) => s + e4(u), 0n),
    modus: kandidaten ? 'VOORBEELD met kandidaat-regels (niet voor klantdocumenten)' : 'actieve regels (goedgekeurd/vastgesteld)',
    regelsGebruikt: [...new Set(rel.map((r) => r.id))].sort() };
}

// Canonieke uitkomst — identiek aan sterkcalc-kennis/planning/canoniek.py (getallen als Number; veilig binnen 2^53).
export function canoniek(res, { urenCalcE4 } = {}) {
  if (res.fout.length) return { fout: [...res.fout].sort() };
  const N = (b) => Number(b);
  const A = res.acts;
  return {
    fout: [],
    regels_gebruikt: res.regelsGebruikt ?? [],
    toegepast: res.toegepast ?? [],
    kritiek: res.kritiek,
    eind_cpm_u: N(res.eindCpm), eind_cap_u: N(res.eindCap),
    piek_e4: N(res.piekE4),
    mandagen_x_halvedag_e4: N(A.filter((a) => a.capaciteit && a._uren !== 0n).reduce((s, a) => s + a._ploeg * a.u, 0n)),
    uren_e4: N(res.urenE4), uren_calc_e4: N(res.urenCalcE4 ?? urenCalcE4 ?? res.urenE4),
    invoer_vereist: A.filter((a) => a.duur_status === 'INVOER VEREIST').map((a) => a.id),
    activiteiten: A.map((a) => ({
      id: a.id, naam: a.naam, codes: a.codes, uren_e4: N(a._uren), ploeg_e4: N(a._ploeg), u: N(a.u),
      es: N(a.es), ef: N(a.ef), ls: N(a.ls), lf: N(a.lf), cs: N(a.cs), cf: N(a.cf), kritiek: Boolean(a.kritiek),
      voor: a.voor.map(([v, lag]) => [v, String(lag)]), opvolgers: a.opvolgers, soort: a.soort, duur_status: a.duur_status,
    })),
  };
}
