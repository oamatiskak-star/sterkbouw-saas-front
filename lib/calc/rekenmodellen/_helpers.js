// lib/calc/rekenmodellen/_helpers.js — gedeelde reken-helpers (geen circulaire import).
export const num = (v, d = 0) => { const x = parseFloat(v); return Number.isFinite(x) ? x : d; };
export const round = (v, d = 2) => { const f = Math.pow(10, d); return Math.round(num(v) * f) / f; };
export const ja = (v) => v === true || v === 'ja' || v === 'true';
