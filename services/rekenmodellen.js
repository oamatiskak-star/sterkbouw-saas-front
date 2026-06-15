// services/rekenmodellen.js — apply-laag van de Rekenmodel-laag (P7.2).
// Voert een rekenmodel uit en plaatst de uitkomst (combi-regels) op de werktafel via de
// bestaande Object-Engine-apply (voegCombiToe → subhoofdstuk → component → STABU).
import { getModel, berekenModel } from '@/lib/calc/rekenmodellen';
import { pasInstructiesToe } from '@/services/objectEngine';

// Live voorbeeld (geen DB-schrijfactie): hoeveelheden + regels + samenvatting.
export function berekenVoorbeeld(objectKey, values) {
  const model = getModel(objectKey);
  if (!model) return null;
  return { model, ...berekenModel(model, values) };
}

// Past het model toe op de werktafel. Geeft {toegevoegd, ontbrekend} terug.
export async function pasModelToe(calculatieId, objectKey, values, label = '') {
  const model = getModel(objectKey);
  if (!model) throw new Error('Onbekend rekenmodel: ' + objectKey);
  const { regels } = berekenModel(model, values);
  const instructies = regels.map((r) => ({ combiCode: r.combiCode, hoeveelheid: r.hoeveelheid, omschrijving: r.omschrijving }));
  return pasInstructiesToe(calculatieId, instructies, label || model.label);
}
