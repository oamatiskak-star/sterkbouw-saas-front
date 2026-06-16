// lib/calc/cascoUitTekening.js
// Increment 3 — Hoeveelheid-uit-tekening voor casco.
// Vertaalt een vision-casco-extract (gebouw als geheel) naar vooringevulde
// rekenmodel-inputs (fundering/gevel/dak), zodat de gebruiker de casco-hoeveelheden
// niet handmatig hoeft in te voeren. De rekenmodel-configurator opent met deze
// `initial`-waarden; bij toepassen worden ze als aannames vastgelegd (increment 4).
// Staal/constructie wordt NIET auto-voorgevuld: dat komt van de constructietekening,
// niet van de architectonische tekening (geen verzonnen hoeveelheden — no-mock).

const num = (v) => (Number.isFinite(parseFloat(v)) ? parseFloat(v) : null);
const r2 = (v) => Math.round(v * 100) / 100;

// dak_type uit vision → rekenmodel-optiecode (pannen/epdm/bitumen).
function dakTypeNaarModel(t) {
  const s = (t || '').toLowerCase();
  if (/plat|epdm|bitumen|flat/.test(s)) return 'epdm';
  if (/hellend|schuin|pannen|kap|zadel/.test(s)) return 'pannen';
  return null;
}

// Geeft de casco-rekenmodellen met vooringevulde waarden + leesbare bron-hoeveelheden.
// → [{ objectKey, label, initial, hoeveelheden:[{label,waarde,eenheid}] }]
export function cascoModellen(casco) {
  if (!casco) return [];
  const omtrek = num(casco.omtrek_m);
  const gevelhoogte = num(casco.gevelhoogte_m);
  const bebouwd = num(casco.bebouwd_oppervlak_m2);
  const dakopp = num(casco.dak_oppervlak_m2);
  const geveloppervlak =
    num(casco.geveloppervlak_m2) ??
    (omtrek != null && gevelhoogte != null ? r2(omtrek * gevelhoogte) : null);

  const out = [];

  // Fundering — strokenfundering uit de buitenomtrek (lengte); type indien bekend.
  if (omtrek != null || bebouwd != null) {
    const initial = {};
    const hoeveelheden = [];
    if (omtrek != null) { initial.lengte = omtrek; hoeveelheden.push({ label: 'Omtrek (fundering-lengte)', waarde: omtrek, eenheid: 'm' }); }
    if (bebouwd != null) hoeveelheden.push({ label: 'Bebouwd oppervlak', waarde: bebouwd, eenheid: 'm²' });
    const t = (casco.fundering_type || '').toLowerCase();
    if (['strook', 'plaat', 'poeren', 'palen'].includes(t)) initial.type = t;
    out.push({ objectKey: 'fundering', label: 'Fundering', initial, hoeveelheden });
  }

  // Gevel — geveloppervlak (direct of omtrek × gevelhoogte).
  if (geveloppervlak != null) {
    out.push({
      objectKey: 'gevel',
      label: 'Gevel',
      initial: { oppervlak: geveloppervlak },
      hoeveelheden: [{ label: 'Geveloppervlak', waarde: geveloppervlak, eenheid: 'm²' }],
    });
  }

  // Dak — dakoppervlak + (gevelhoogte t.b.v. steiger) + randlengte (= omtrek).
  if (dakopp != null) {
    const initial = { oppervlak: dakopp };
    const hoeveelheden = [{ label: 'Dakoppervlak', waarde: dakopp, eenheid: 'm²' }];
    const dt = dakTypeNaarModel(casco.dak_type);
    if (dt) initial.type = dt;
    if (gevelhoogte != null) initial.gevelhoogte = gevelhoogte;
    if (omtrek != null) initial.randlengte = omtrek;
    out.push({ objectKey: 'dak', label: 'Dak', initial, hoeveelheden });
  }

  return out;
}
