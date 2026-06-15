// lib/calc/scenarios.js — P7.5 scenario-vergelijker (Budget / Standaard / Premium).
// Pure rekenlaag: neemt de werktafelregels en rekent per scenario kostprijs/verkoop/winst/marge.
// Budget = goedkopere materialen; Premium = betere materialen + hogere winst. AK/ABK/risico/btw
// erven van de calculatie-instellingen (user-controlled). Geen mutatie hier.
import { computeTotalen } from './werktafelTotals';

// Scenario's als afwijking t.o.v. de huidige calculatie. materiaalFactor schaalt de
// materiaalkosten (kwaliteitsniveau); winstDelta past de winst-opslag aan in procentpunten.
export const SCENARIOS = [
  { key: 'budget', label: 'Budget', materiaalFactor: 0.9, winstDelta: -1 },
  { key: 'standaard', label: 'Standaard', materiaalFactor: 1.0, winstDelta: 0 },
  { key: 'premium', label: 'Premium', materiaalFactor: 1.25, winstDelta: 3 },
];

export function berekenScenario(rows, baseOpslagen, scenario) {
  const base = computeTotalen(rows, baseOpslagen);
  const op = base.opslagen; // genormaliseerd { ak, abk, risico, winst, btw }
  const f = scenario?.materiaalFactor ?? 1;
  const winstPct = Math.max(0, (op.winst || 0) + (scenario?.winstDelta || 0));

  const materiaal = base.materiaal * f;
  const directe = materiaal + base.arbeid + base.materieel;
  const ak = directe * (op.ak / 100);
  const abk = directe * (op.abk / 100);
  const risico = directe * (op.risico / 100);
  const subtotaal = directe + ak + abk + risico;
  const winst = subtotaal * (winstPct / 100);
  const verkoop_excl = subtotaal + winst;
  const btw = verkoop_excl * (op.btw / 100);
  const marge = verkoop_excl - directe;
  return {
    key: scenario?.key,
    label: scenario?.label,
    kostprijs: directe,
    verkoop_excl,
    verkoop_incl: verkoop_excl + btw,
    winst,
    marge,
    margePct: verkoop_excl > 0 ? (marge / verkoop_excl) * 100 : 0,
    materiaal, arbeid: base.arbeid, materieel: base.materieel,
    winstPct,
    opslagen: { ...op, winst: winstPct },
  };
}

// Berekent alle preset-scenario's voor een set regels.
export function alleScenarios(rows, baseOpslagen) {
  return SCENARIOS.map((s) => berekenScenario(rows, baseOpslagen, s));
}
