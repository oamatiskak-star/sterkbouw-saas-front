// lib/calc/fixedPriceRules.js
// Calculatie-niveau opslagen. UITSLUITEND user-controlled — AI/optimalisatie
// mag deze waarden NOOIT wijzigen (harde regel). Gespiegeld van de backend
// pricing/fixed_price/calculator.js zodat client- en serverberekening gelijk lopen.

export const DEFAULT_OPSLAGEN = {
  ak: 6, // Algemene kosten %
  abk: 4, // Algemene bouwplaatskosten %
  risico: 3, // Risico %
  winst: 5, // Winst %
  btw: 21, // BTW %
};

// Velden die AI/optimalisatie NOOIT mag aanraken.
export const AI_LOCKED_OPSLAG_FIELDS = ['ak', 'abk', 'risico', 'winst'];

export function normalizeOpslagen(raw) {
  const o = raw && typeof raw === 'object' ? raw : {};
  return {
    ak: num(o.ak, DEFAULT_OPSLAGEN.ak),
    abk: num(o.abk, DEFAULT_OPSLAGEN.abk),
    risico: num(o.risico, DEFAULT_OPSLAGEN.risico),
    winst: num(o.winst, DEFAULT_OPSLAGEN.winst),
    btw: num(o.btw, DEFAULT_OPSLAGEN.btw),
  };
}

function num(v, d) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : d;
}
