// lib/calc/rekenmodellen/index.js — REKENMODEL-LAAG (P7.2).
// De formele laag onder de Object Engine: een object → keuzes → FORMULES → hoeveelheden →
// combi/component/STABU → werktafel. De gebruiker ziet alleen het object en de keuzes;
// STABU/combi/component blijven interne output.
//
// Interface (verplicht):
//   RekenModel = {
//     object,            // sleutel, bv. 'badkamer'
//     label,             // weergavenaam
//     inputs,            // BASIS: maatvoering + max 3 zichtbare keuzes  [{key,label,type,opties?,default,eenheid?,groep:'maat'|'basis'}]
//     advancedInputs,    // AFWIJKINGEN/GEAVANCEERD (verborgen tot uitgeklapt)
//     defaults,          // complete standaard (ISO-uitgangspunten); gebruiker vult alleen afwijkingen
//     output,            // beschrijvende lijst van wat het model produceert
//     bereken(values),   // → { hoeveelheden, regels, samenvatting }
//   }
//
// bereken() retourneert:
//   hoeveelheden : { <naam>: getal }                  — afgeleide engineering-hoeveelheden (m³, kg, m², uur)
//   regels       : [ {combiCode, hoeveelheid, omschrijving} ]  — wat in de werktafel landt (bestaande combi's)
//   samenvatting : [ {label, waarde, eenheid} ]        — leesbare uitkomst voor de gebruiker

import badkamer from './badkamer';
import fundering from './fundering';
import keuken from './keuken';
import toilet from './toilet';
import kozijn from './kozijn';
import dak from './dak';
import binnenwand from './binnenwand';
import gevel from './gevel';
import metselwerk from './metselwerk';
import vloer from './vloer';
import schilderwerk from './schilderwerk';
import trap from './trap';
export { num, round, ja } from './_helpers';

// Volgorde = weergavevolgorde in de Rekenmodellen-sectie.
export const REKENMODELLEN = { badkamer, keuken, toilet, fundering, gevel, metselwerk, kozijn, dak, vloer, binnenwand, trap, schilderwerk };

export function getModel(objectKey) {
  return REKENMODELLEN[objectKey] || null;
}

export function alleModellen() {
  return Object.values(REKENMODELLEN);
}

// Voegt de defaults samen met de ingevoerde waarden (gebruiker vult alleen afwijkingen).
export function metDefaults(model, values = {}) {
  const basis = {};
  for (const i of [...(model.inputs || []), ...(model.advancedInputs || [])]) basis[i.key] = i.default;
  return { ...model.defaults, ...basis, ...values };
}

// Voert een model veilig uit met defaults toegepast.
export function berekenModel(model, values = {}) {
  const v = metDefaults(model, values);
  const r = model.bereken(v) || {};
  return {
    hoeveelheden: r.hoeveelheden || {},
    regels: (r.regels || []).filter((x) => x && x.combiCode && Number(x.hoeveelheid) > 0),
    samenvatting: r.samenvatting || [],
  };
}

