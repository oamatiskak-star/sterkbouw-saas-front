// lib/calc/ruimteGroepering.js
// GENERIEKE groeperings-/afwijkings-/herhalingsengine voor SterkCalc.
// Werkt voor ELKE ruimte-klasse (badkamer/toilet/keuken/hotelkamer/woonunit/…)
// én voor bouwdeel-/object-types (kozijn/deur/radiator/…). Nergens klasse-specifiek.
// "1 configureren × N toepassen": clustert vergelijkbare items tot types met
// aantal, gemiddelde maten, afwijking% en gelijkheid%.

const n = (v) => {
  const x = parseFloat(v);
  return Number.isFinite(x) ? x : 0;
};
const r1 = (v) => Math.round(n(v) * 10) / 10;
const r0 = (v) => Math.round(n(v));

// Clustert items binnen dezelfde klasse op basis van numerieke dims.
// items: [{ id, klasse, dims: {l,b,h,...} }]
// tolerantie: max relatieve afwijking per dim om in hetzelfde type te vallen (default 5%).
export function groepeer(items, dimKeys, tolerantie = 0.05) {
  const perKlasse = {};
  for (const it of items || []) {
    const k = it.klasse || 'overig';
    (perKlasse[k] = perKlasse[k] || []).push(it);
  }
  const types = [];
  let letterBase = 0;
  for (const [klasse, lijst] of Object.entries(perKlasse)) {
    const clusters = [];
    for (const it of lijst) {
      let plek = clusters.find((c) => dimKeys.every((dk) => binnenTolerantie(c.centroid[dk], n(it.dims?.[dk]), tolerantie)));
      if (!plek) {
        plek = { leden: [], centroid: {} };
        dimKeys.forEach((dk) => (plek.centroid[dk] = n(it.dims?.[dk])));
        clusters.push(plek);
      }
      plek.leden.push(it);
      // hercentreren (lopend gemiddelde)
      dimKeys.forEach((dk) => {
        const vals = plek.leden.map((m) => n(m.dims?.[dk]));
        plek.centroid[dk] = vals.reduce((s, v) => s + v, 0) / vals.length;
      });
    }
    clusters.forEach((c, i) => {
      const gem = {};
      const maxAfw = {};
      dimKeys.forEach((dk) => {
        const vals = c.leden.map((m) => n(m.dims?.[dk]));
        const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
        gem[dk] = avg;
        maxAfw[dk] = avg > 0 ? Math.max(...vals.map((v) => Math.abs(v - avg) / avg)) : 0;
      });
      const afwijkingPct = r1(Math.max(0, ...Object.values(maxAfw)) * 100);
      types.push({
        key: `${klasse}-${String.fromCharCode(65 + i)}`,
        klasse,
        naam: `${klasse} type ${String.fromCharCode(65 + i)}`,
        aantal: c.leden.length,
        gem: Object.fromEntries(dimKeys.map((dk) => [dk, r1(gem[dk])])),
        afwijkingPct,
        gelijkheidPct: r1(Math.max(0, 100 - afwijkingPct)),
        leden: c.leden.map((m) => ({ id: m.id, naam: m.naam, dims: m.dims })),
      });
    });
    letterBase += clusters.length;
  }
  // grootste herhaling eerst
  return types.sort((a, b) => b.aantal - a.aantal);
}

function binnenTolerantie(a, b, tol) {
  if (a === 0 && b === 0) return true;
  const basis = Math.max(Math.abs(a), Math.abs(b)) || 1;
  return Math.abs(a - b) / basis <= tol;
}

// Convenience voor ruimtes.
export function groepeerRuimtes(ruimtes, tolerantie = 0.05) {
  const items = (ruimtes || []).map((r) => ({
    id: r.id,
    naam: r.naam,
    klasse: r.klasse || r.naam?.replace(/\s*\d+$/, '').trim() || 'Ruimte',
    dims: { lengte: n(r.lengte), breedte: n(r.breedte), hoogte: n(r.hoogte) },
  }));
  return groepeer(items, ['lengte', 'breedte', 'hoogte'], tolerantie);
}

// Convenience voor losse objecten/bouwdelen (kozijn/deur/radiator/…). Zelfde generieke engine.
// Telt het reeds-gegroepeerde `aantal` mee zodat herhaling klopt (object met aantal 8 → type ×8).
export function groepeerObjecten(objecten, tolerantie = 0.05) {
  const items = (objecten || []).map((o) => ({
    id: o.id,
    naam: o.naam,
    klasse: o.klasse || o.naam?.replace(/\s*\d+$/, '').trim() || 'Object',
    aantal: Math.max(1, Math.round(n(o.aantal)) || 1),
    dims: { lengte: n(o.lengte), breedte: n(o.breedte), hoogte: n(o.hoogte) },
  }));
  const types = groepeer(items, ['lengte', 'breedte', 'hoogte'], tolerantie);
  // herijk aantal op som van leden-aantallen (i.p.v. aantal clusters)
  return types
    .map((t) => {
      const som = t.leden.reduce((s, m) => {
        const orig = items.find((it) => it.id === m.id);
        return s + (orig?.aantal || 1);
      }, 0);
      return { ...t, aantal: som };
    })
    .sort((a, b) => b.aantal - a.aantal);
}
