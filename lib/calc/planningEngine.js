// lib/calc/planningEngine.js
// Sprint 7 — Planning Engine. Leidt fasering + duur + gantt + materiaal + kritiek pad af uit de
// werktafel (bron van waarheid). Geen nieuwe calculatiemotor; raakt AK/ABK/risico/winst NOOIT aan.
// Uren komen uit norm×hoeveelheid; ontbreekt de norm (bv. curated combi's) dan afgeleid uit
// arbeidskosten ÷ uurtarief, zodat planning altijd uit bestaande data ontstaat.
import { computeRow } from '@/lib/calc/werktafelTotals';

export const STANDAARD_CONFIG = { projecttype: 'nieuwbouw', uurtarief: 45, monteurs: 2, uren_per_dag: 8, oplevering_dagen: 5, start_datum: null };

// Categoriecode → fase.
const CATEGORIE_FASE = {
  '00': 'voorbereiding', '01': 'voorbereiding', '33': 'voorbereiding', '35': 'voorbereiding', '36': 'voorbereiding',
  '37': 'voorbereiding', '38': 'voorbereiding', '39': 'voorbereiding', '40': 'voorbereiding', '41': 'voorbereiding', '42': 'voorbereiding', 'A0': 'voorbereiding',
  '02': 'sloop',
  '03': 'fundering', '04': 'fundering', '05': 'fundering', '06': 'fundering', '07': 'fundering',
  '08': 'ruwbouw', '09': 'ruwbouw', '17': 'ruwbouw', '19': 'ruwbouw',
  '11': 'dak', '12': 'dak', '13': 'dak',
  '10': 'gevel', '14': 'gevel', '15': 'gevel',
  '24': 'installaties', '25': 'installaties', '26': 'installaties', '27': 'installaties', '28': 'installaties', '29': 'installaties',
  '16': 'afbouw', '18': 'afbouw', '20': 'afbouw', '21': 'afbouw', '22': 'afbouw', '23': 'afbouw',
  '30': 'terrein', '31': 'terrein', '32': 'terrein',
};
export const FASE_LABEL = {
  voorbereiding: 'Voorbereiding', sloop: 'Sloop', fundering: 'Fundering & grondwerk', ruwbouw: 'Ruwbouw',
  dak: 'Dak', gevel: 'Gevel & kozijnen', installaties: 'Installaties', afbouw: 'Afbouw', terrein: 'Terrein', oplevering: 'Oplevering',
};
export const PROJECTTYPE_TEMPLATES = {
  nieuwbouw: ['voorbereiding', 'fundering', 'ruwbouw', 'dak', 'gevel', 'installaties', 'afbouw', 'terrein', 'oplevering'],
  renovatie: ['voorbereiding', 'sloop', 'ruwbouw', 'installaties', 'afbouw', 'oplevering'],
  transformatie: ['voorbereiding', 'sloop', 'fundering', 'ruwbouw', 'dak', 'gevel', 'installaties', 'afbouw', 'terrein', 'oplevering'],
  verduurzaming: ['voorbereiding', 'gevel', 'dak', 'installaties', 'afbouw', 'oplevering'],
  uitbreiding: ['voorbereiding', 'fundering', 'ruwbouw', 'dak', 'gevel', 'installaties', 'afbouw', 'oplevering'],
};

const n = (v) => (Number.isFinite(parseFloat(v)) ? parseFloat(v) : 0);
// Categoriecode → fase (gedeeld met de bestel-engine).
export const faseVanCategorie = (code) => CATEGORIE_FASE[(code || '').toString().padStart(2, '0')] || CATEGORIE_FASE[code] || 'afbouw';
const faseVanChapter = (ch) => faseVanCategorie(ch?.code);

// Uren per regel: norm-gebaseerd, anders afgeleid uit arbeidskosten ÷ uurtarief.
export function urenVanRow(row, uurtarief = 45) {
  const cr = computeRow(row);
  if (cr.uren > 0) return cr.uren;
  return uurtarief > 0 ? cr.arbeid / uurtarief : 0;
}

// Werkdag-rekenen (ma–vr). dag 0 = startdatum (eerstvolgende werkdag).
function eersteWerkdag(d) {
  const x = new Date(d);
  while (x.getDay() === 0 || x.getDay() === 6) x.setDate(x.getDate() + 1);
  return x;
}
function plusWerkdagen(start, dagen) {
  const x = new Date(start);
  let rest = Math.max(0, Math.round(dagen));
  while (rest > 0) { x.setDate(x.getDate() + 1); if (x.getDay() !== 0 && x.getDay() !== 6) rest--; }
  return x;
}
const isoDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : null);

// Hoofdberekening: chapters + rows + config → fases met duur/datum/materiaal/kritiek.
export function berekenPlanning(chapters, rows, configRaw = {}) {
  const cfg = { ...STANDAARD_CONFIG, ...configRaw };
  const capPerDag = Math.max(1, n(cfg.monteurs) * n(cfg.uren_per_dag));
  const template = PROJECTTYPE_TEMPLATES[cfg.projecttype] || PROJECTTYPE_TEMPLATES.nieuwbouw;

  // chapters → fase-buckets
  const buckets = {};
  for (const ch of chapters || []) {
    const fkey = faseVanChapter(ch);
    const chRows = (rows || []).filter((r) => r.chapter_id === ch.id);
    const uren = chRows.reduce((s, r) => s + urenVanRow(r, cfg.uurtarief), 0);
    const materialen = aggregeerMateriaal(chRows);
    if (!buckets[fkey]) buckets[fkey] = { uren: 0, chapters: [], materialen: {} };
    buckets[fkey].uren += uren;
    if (uren > 0) buckets[fkey].chapters.push({ naam: ch.naam || ch.code, uren: Math.round(uren) });
    for (const m of materialen) {
      const k = m.key;
      if (!buckets[fkey].materialen[k]) buckets[fkey].materialen[k] = { omschrijving: m.omschrijving, eenheid: m.eenheid, hoeveelheid: 0 };
      buckets[fkey].materialen[k].hoeveelheid += m.hoeveelheid;
    }
  }

  // fase-volgorde: template eerst, daarna eventuele extra fases met uren
  const volgorde = [...template, ...Object.keys(buckets).filter((k) => !template.includes(k))];

  const start = eersteWerkdag(cfg.start_datum || new Date());
  let cursor = 0; // werkdag-offset
  const fases = [];
  for (const fkey of volgorde) {
    const b = buckets[fkey];
    const isOplevering = fkey === 'oplevering';
    const uren = b ? b.uren : 0;
    if (!isOplevering && (!b || uren <= 0)) continue; // lege fase overslaan (behalve oplevering-buffer)
    const duur = isOplevering ? n(cfg.oplevering_dagen) : Math.max(1, Math.ceil(uren / capPerDag));
    const startDatum = plusWerkdagen(start, cursor);
    const eindDatum = plusWerkdagen(startDatum, Math.max(0, duur - 1));
    fases.push({
      key: fkey,
      label: FASE_LABEL[fkey] || fkey,
      uren: Math.round(uren),
      duur_dagen: duur,
      start_dag: cursor,
      eind_dag: cursor + duur,
      start_datum: isoDate(startDatum),
      eind_datum: isoDate(eindDatum),
      chapters: b ? b.chapters : [],
      materialen: b ? Object.values(b.materialen).map((m) => ({ ...m, hoeveelheid: Math.round(m.hoeveelheid * 100) / 100, leverdatum: isoDate(startDatum) })) : [],
      kritiek: true, // lineaire keten: elke fase ligt op het kritieke pad
    });
    cursor += duur;
  }

  const totaalDagen = cursor;
  const totaalUren = fases.reduce((s, f) => s + f.uren, 0);
  const eindDatum = fases.length ? fases[fases.length - 1].eind_datum : isoDate(start);
  const langste = fases.reduce((m, f) => (f.duur_dagen > (m?.duur_dagen || 0) ? f : m), null);

  return {
    config: cfg,
    fases,
    samenvatting: {
      totaal_dagen: totaalDagen,
      totaal_weken: Math.ceil(totaalDagen / 5),
      totaal_uren: totaalUren,
      start_datum: isoDate(start),
      eind_datum: eindDatum,
      capaciteit_per_dag: capPerDag,
      bottleneck: langste ? langste.label : null,
    },
    waarschuwingen: bouwWaarschuwingen(fases, cfg),
    ai_signalen: aiSignalen(fases, totaalDagen),
  };
}

function aggregeerMateriaal(chRows) {
  const out = [];
  for (const r of chRows) {
    const isCombi = r.type === 'combi' || r.is_combi;
    const items = isCombi
      ? (r._components || []).map((c) => ({ ...c, hoeveelheid: n(c.hoeveelheid) * n(r.hoeveelheid) }))
      : [{ ...r, hoeveelheid: n(r.hoeveelheid) }];
    for (const it of items) {
      if (n(it.materiaalprijs) <= 0) continue;
      out.push({ key: it.stabu_code || it.omschrijving || 'materiaal', omschrijving: it.omschrijving || it.stabu_code || 'Materiaal', eenheid: it.eenheid || '', hoeveelheid: n(it.hoeveelheid) });
    }
  }
  return out;
}

function bouwWaarschuwingen(fases, cfg) {
  const w = [];
  if (n(cfg.monteurs) <= 0) w.push({ niveau: 'fout', tekst: 'Geen monteurs ingesteld — duur kan niet berekend worden.' });
  for (const f of fases) {
    if (f.duur_dagen > 25) w.push({ niveau: 'risico', tekst: `${f.label}: lange fase (${f.duur_dagen} werkdagen) — overweeg extra capaciteit.` });
    if (f.uren > 0 && f.materialen.length === 0 && f.key !== 'voorbereiding' && f.key !== 'oplevering') w.push({ niveau: 'info', tekst: `${f.label}: arbeid gepland maar geen materiaal gekoppeld.` });
  }
  if (!fases.length) w.push({ niveau: 'info', tekst: 'Geen werkuren in de werktafel — vul de calculatie aan.' });
  return w;
}

// AI-assist: uitsluitend signaleren/voorstellen (nooit zelf wijzigen).
function aiSignalen(fases, totaalDagen) {
  const s = [];
  if (!fases.length) return s;
  const langste = [...fases].sort((a, b) => b.duur_dagen - a.duur_dagen)[0];
  s.push({ type: 'kritiek_pad', tekst: `Kritiek pad loopt door alle ${fases.length} fases (${totaalDagen} werkdagen). Vertraging in één fase schuift de oplevering op.` });
  if (langste) s.push({ type: 'risico', tekst: `Grootste risico: ${langste.label} (${langste.duur_dagen} dagen). Splits of bemand zwaarder om de doorlooptijd te verkorten.` });
  // ontbrekende afhankelijkheid: installaties zonder voorafgaande ruwbouw
  const keys = fases.map((f) => f.key);
  if (keys.includes('installaties') && !keys.includes('ruwbouw')) s.push({ type: 'afhankelijkheid', tekst: 'Installaties gepland zonder ruwbouwfase — controleer of de ruwbouw elders is belegd.' });
  if (keys.includes('afbouw') && !keys.includes('installaties')) s.push({ type: 'afhankelijkheid', tekst: 'Afbouw gepland zonder installatiefase — controleer de volgorde.' });
  return s;
}
