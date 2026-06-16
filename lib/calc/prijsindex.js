// lib/calc/prijsindex.js
// Increment 1b — prijspeil-indexering met ECHTE CBS-data (no-mock).
// Bron: CBS StatLine tabel 85728NED "Nieuwbouwwoningen; inputprijsindex bouwkosten 2021=100",
// component "Bouwkosten totaal" (T001363) = gewogen prijsontwikkeling van loon + materiaal
// (kostprijs-input; materieel, algemene kosten en winst/risico zitten er bewust NIET in —
// die zijn user-controlled). Maandcijfers. Opgehaald via CBS OpenData op 2026-06-16.
// Verversen: heronttrek deze reeks periodiek uit dezelfde tabel.
export const PRIJSINDEX_BRON = {
  tabel: '85728NED',
  component: 'T001363',
  basisjaar: '2021=100',
  opgehaald: '2026-06-16',
  url: 'https://opendata.cbs.nl/ODataApi/odata/85728NED/TypedDataSet',
};

// 'YYYY-MM' -> indexcijfer (2021=100).
export const PRIJSINDEX = {
  '2018-01': 90.1,
  '2018-02': 90.2,
  '2018-03': 89.9,
  '2018-04': 90.1,
  '2018-05': 90.3,
  '2018-06': 90.5,
  '2018-07': 91.0,
  '2018-08': 91.5,
  '2018-09': 91.8,
  '2018-10': 91.7,
  '2018-11': 91.6,
  '2018-12': 91.8,
  '2019-01': 92.7,
  '2019-02': 92.7,
  '2019-03': 92.8,
  '2019-04': 92.8,
  '2019-05': 92.8,
  '2019-06': 92.9,
  '2019-07': 94.0,
  '2019-08': 93.7,
  '2019-09': 93.8,
  '2019-10': 93.7,
  '2019-11': 93.7,
  '2019-12': 94.4,
  '2020-01': 95.7,
  '2020-02': 95.6,
  '2020-03': 95.6,
  '2020-04': 95.2,
  '2020-05': 95.1,
  '2020-06': 95.1,
  '2020-07': 96.0,
  '2020-08': 96.2,
  '2020-09': 96.1,
  '2020-10': 96.0,
  '2020-11': 96.1,
  '2020-12': 96.9,
  '2021-01': 97.5,
  '2021-02': 97.6,
  '2021-03': 97.8,
  '2021-04': 98.6,
  '2021-05': 99.2,
  '2021-06': 100.0,
  '2021-07': 101.2,
  '2021-08': 100.9,
  '2021-09': 101.1,
  '2021-10': 101.9,
  '2021-11': 102.0,
  '2021-12': 102.2,
  '2022-01': 104.8,
  '2022-02': 105.4,
  '2022-03': 107.0,
  '2022-04': 108.9,
  '2022-05': 109.5,
  '2022-06': 109.1,
  '2022-07': 110.2,
  '2022-08': 110.3,
  '2022-09': 111.0,
  '2022-10': 111.6,
  '2022-11': 111.4,
  '2022-12': 111.2,
  '2023-01': 114.1,
  '2023-02': 114.5,
  '2023-03': 115.3,
  '2023-04': 115.7,
  '2023-05': 115.8,
  '2023-06': 115.7,
  '2023-07': 115.9,
  '2023-08': 115.6,
  '2023-09': 115.6,
  '2023-10': 115.6,
  '2023-11': 115.4,
  '2023-12': 115.5,
  '2024-01': 117.3,
  '2024-02': 117.2,
  '2024-03': 117.2,
  '2024-04': 117.0,
  '2024-05': 116.7,
  '2024-06': 116.9,
  '2024-07': 120.0,
  '2024-08': 120.0,
  '2024-09': 119.9,
  '2024-10': 119.7,
  '2024-11': 119.8,
  '2024-12': 119.8,
  '2025-01': 120.4,
  '2025-02': 120.8,
  '2025-03': 121.5,
  '2025-04': 121.9,
  '2025-05': 122.9,
  '2025-06': 123.0,
  '2025-07': 123.3,
  '2025-08': 123.3,
  '2025-09': 123.3,
  '2025-10': 124.3,
  '2025-11': 124.6,
  '2025-12': 124.3,
  '2026-01': 127.1,
  '2026-02': 127.3,
  '2026-03': 127.8,
  '2026-04': 128.8
};

// Prijspeil waarop de curated kostprijs-kengetallen zijn geijkt: de laatst
// beschikbare maand bij het ophalen. prijspeildatum == dit -> factor 1,0.
export const BASIS_PRIJSPEIL = '2026-04';

const KEYS = Object.keys(PRIJSINDEX).sort();

// Indexwaarde voor 'YYYY-MM'; buiten bereik -> dichtstbijzijnde rand,
// ontbrekende maand binnen bereik -> laatst bekende eerdere maand.
function indexVoor(ym) {
  if (PRIJSINDEX[ym] != null) return PRIJSINDEX[ym];
  if (ym < KEYS[0]) return PRIJSINDEX[KEYS[0]];
  if (ym > KEYS[KEYS.length - 1]) return PRIJSINDEX[KEYS[KEYS.length - 1]];
  let last = PRIJSINDEX[KEYS[0]];
  for (const k of KEYS) { if (k > ym) break; last = PRIJSINDEX[k]; }
  return last;
}

// Prijspeilfactor t.o.v. het basis-prijspeil. null/ongeldig -> 1 (actueel/geen correctie).
export function prijspeilFactor(prijspeildatum) {
  if (!prijspeildatum) return 1;
  const ym = String(prijspeildatum).slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(ym)) return 1;
  const basis = PRIJSINDEX[BASIS_PRIJSPEIL];
  const waarde = indexVoor(ym);
  if (!basis || !waarde) return 1;
  return Math.round((waarde / basis) * 10000) / 10000;
}
