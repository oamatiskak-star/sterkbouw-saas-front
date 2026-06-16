// lib/calc/projecttypeRekenmodellen.js
// Increment 2 — Model ↔ projecttype-template-koppeling.
// Stelt per projecttype de RELEVANTE rekenmodellen voor, zodat de gebruiker bij een
// nieuwe calculatie niet door alle 32 modellen hoeft te scannen. De relevantie wordt
// AFGELEID uit dezelfde projecttype-TEMPLATES als de werktafel/volledigheidscheck
// (één bron van waarheid): een rekenmodel is aanbevolen als minstens één van zijn
// hoofdstuk-categorieën in de template van het projecttype zit.
import { alleModellen } from './rekenmodellen';
import { templateVoor } from './projecttypeTemplates';

// Rekenmodel-objectsleutel → categoriecode(s), STABU-aligned (zelfde codes als
// de TEMPLATES in projecttypeTemplates.js). Eén model kan meerdere hoofdstukken
// raken; relevantie = doorsnede met de projecttype-template.
export const MODEL_CATEGORIE = {
  abk: ['00'],
  stelposten: ['00'],
  sloop: ['02'],
  fundering: ['04'],
  staal: ['07'],
  gevel: ['08', '10'],
  metselwerk: ['09'],
  dak: ['11', '12'],
  dakopening: ['13'],
  kozijn: ['14'],
  trap: ['16'],
  lift: ['16', '24'],
  balkon: ['16'],
  galerij: ['16'], // bordes/galerij hoort bij '16' (Trappen & bordessen), net als balkon
  binnenwand: ['17'],
  plafond: ['18'],
  vloer: ['19'],
  verdiepingsvloer: ['19'],
  stucwerk: ['21'],
  schilderwerk: ['22'],
  isolatie: ['23'],
  elektra: ['25'],
  energie: ['25', '28'],
  ventilatie: ['26'],
  sanitair: ['27'],
  verwarming: ['28'],
  brandcompartiment: ['29'],
  terrein: ['30'],
  riolering: ['32'],
  // Ruimte-modellen landen op meerdere hoofdstukken; gekoppeld aan hun kern-categorie.
  badkamer: ['20', '27'],
  toilet: ['20', '27'],
  keuken: ['K0'],
};

// Is dit rekenmodel relevant voor het projecttype?
export function modelRelevantVoor(objectKey, projecttype) {
  const cats = MODEL_CATEGORIE[objectKey];
  if (!cats || !projecttype) return false;
  const tpl = templateVoor(projecttype);
  return cats.some((c) => tpl.includes(c));
}

// Splitst alle rekenmodellen in {aanbevolen, overig} voor een projecttype.
// Zonder (geldig) projecttype → alles als overig (geen valse aanbeveling).
// Registry-volgorde blijft behouden binnen elke groep.
export function rekenmodellenVoorProjecttype(projecttype) {
  const modellen = alleModellen();
  if (!projecttype) return { aanbevolen: [], overig: modellen };
  const aanbevolen = [];
  const overig = [];
  for (const m of modellen) {
    if (modelRelevantVoor(m.object, projecttype)) aanbevolen.push(m);
    else overig.push(m);
  }
  return { aanbevolen, overig };
}
