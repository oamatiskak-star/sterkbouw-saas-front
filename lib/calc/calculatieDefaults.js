// lib/calc/calculatieDefaults.js
// Volledige calculatie-instellingen PER CALCULATIE (gekopieerd uit globale
// defaults bij nieuwe calculatie; daarna per calculatie/versie opgeslagen).
// AI mag deze waarden NOOIT wijzigen — alleen de gebruiker.
import { DEFAULT_OPSLAGEN } from './fixedPriceRules';

export const DEFAULT_INSTELLINGEN = {
  ak: DEFAULT_OPSLAGEN.ak,
  abk: DEFAULT_OPSLAGEN.abk,
  risico: DEFAULT_OPSLAGEN.risico,
  winst: DEFAULT_OPSLAGEN.winst,
  btw: DEFAULT_OPSLAGEN.btw,
  regiofactor: 1.0,
  prijspeildatum: null, // ISO datum-string; null = actueel
  afronding: 2, // decimalen
  calculatietype: 'nieuwbouw',
  fixed_price: false,
};

const num = (v, d) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : d;
};

export function normalizeInstellingen(raw) {
  const o = raw && typeof raw === 'object' ? raw : {};
  return {
    ak: num(o.ak, DEFAULT_INSTELLINGEN.ak),
    abk: num(o.abk, DEFAULT_INSTELLINGEN.abk),
    risico: num(o.risico, DEFAULT_INSTELLINGEN.risico),
    winst: num(o.winst, DEFAULT_INSTELLINGEN.winst),
    btw: num(o.btw, DEFAULT_INSTELLINGEN.btw),
    regiofactor: num(o.regiofactor, DEFAULT_INSTELLINGEN.regiofactor),
    prijspeildatum: o.prijspeildatum ?? DEFAULT_INSTELLINGEN.prijspeildatum,
    afronding: num(o.afronding, DEFAULT_INSTELLINGEN.afronding),
    calculatietype: o.calculatietype || DEFAULT_INSTELLINGEN.calculatietype,
    fixed_price: typeof o.fixed_price === 'boolean' ? o.fixed_price : DEFAULT_INSTELLINGEN.fixed_price,
  };
}
