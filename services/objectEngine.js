// services/objectEngine.js — apply-laag van de Object Engine.
// Vertaalt resolve-instructies (combiCode + hoeveelheid) naar werktafelregels via voegCombiToe,
// die elke combi naar het juiste subhoofdstuk routeert (→ component → STABU). Geen STABU-zoekactie
// door de gebruiker; geen losse regels.
import { loadCombisByCodes, voegCombiToe } from '@/services/combis';
import { objectenVoorType, resolveObject, ruimteMaten, defaultKeuzes } from '@/lib/calc/objectEngine';

// Bouwt voor één ruimte (type + keuzes) de volledige set combi-instructies.
// keuzesPerObject: { [objectKey]: { [keuzeKey]: value } } — ontbrekende vallen terug op default.
export function instructiesVoorRuimte(type, ruimte, keuzesPerObject = {}, actieveKeys = null) {
  const maten = ruimteMaten(ruimte);
  const objecten = objectenVoorType(type);
  const out = [];
  for (const objDef of objecten) {
    if (actieveKeys && !actieveKeys.includes(objDef.key)) continue; // object uitgevinkt
    const vals = { ...defaultKeuzes(objDef), ...(keuzesPerObject[objDef.key] || {}) };
    for (const instr of resolveObject(objDef, vals, maten)) {
      out.push({ ...instr, objectKey: objDef.key, objectNaam: objDef.naam });
    }
  }
  return out;
}

// Past een lijst combi-instructies toe op de werktafel. Combineert dubbele combi-codes niet
// (elke instructie = eigen regel met eigen omschrijving), maar routeert ze wél naar hun
// subhoofdstuk. Geeft {toegevoegd, ontbrekend} terug.
export async function pasInstructiesToe(calculatieId, instructies, ruimteLabel = '') {
  const codes = instructies.map((i) => i.combiCode);
  const map = await loadCombisByCodes(codes);
  let toegevoegd = 0;
  const ontbrekend = [];
  for (const instr of instructies) {
    const basis = map[instr.combiCode];
    if (!basis) { ontbrekend.push(instr.combiCode); continue; }
    // Eenheids-gebonden afronding: stuk-achtige eenheden minimaal 1 en heel getal.
    const stukEenheid = /^(st|stuk|stuks|pst|set)$/i.test(basis.eenheid || '');
    let hv = Number(instr.hoeveelheid) || 0;
    if (stukEenheid) hv = Math.max(1, Math.round(hv));
    else hv = Math.round(hv * 100) / 100;
    const combi = { ...basis, naam: ruimteLabel ? `${ruimteLabel} — ${instr.omschrijving || basis.naam}` : (instr.omschrijving || basis.naam) };
    const row = await voegCombiToe({ calculatieId, chapterId: null, combi, hoeveelheid: hv }).catch(() => null);
    if (row) toegevoegd += 1;
  }
  return { toegevoegd, ontbrekend };
}

// Past alle gekozen ruimtes in één keer toe. ruimtesConfig: [{ type, ruimte, label, keuzes }]
export async function pasRuimtesToe(calculatieId, ruimtesConfig = []) {
  let toegevoegd = 0;
  const ontbrekend = new Set();
  for (const rc of ruimtesConfig) {
    const instr = instructiesVoorRuimte(rc.type, rc.ruimte, rc.keuzes, rc.actieveKeys || null);
    const res = await pasInstructiesToe(calculatieId, instr, rc.label || '');
    toegevoegd += res.toegevoegd;
    res.ontbrekend.forEach((c) => ontbrekend.add(c));
  }
  return { toegevoegd, ontbrekend: [...ontbrekend] };
}
