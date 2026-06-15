// services/rapportage.js — Sprint 9: verzamelt werktafel/offerte/planning/bestellingen/versies
// en bouwt het managementrapport. Leest alleen (geen mutaties); AI adviserend.
import supabase from '@/lib/supabase';
import { calcData } from '@/services/calcModules';
import { derivePlanning } from '@/services/planning';
import { loadBestellingen } from '@/services/bestellen';
import { bouwRapportage } from '@/lib/calc/rapportageEngine';

async function loadOfferte(calculatieId) {
  const { data } = await supabase.from('sterkcalc_offertes').select('*').eq('calculatie_id', calculatieId).order('created_at', { ascending: false }).limit(1);
  return data?.[0] || null;
}
async function loadVersieSnapshots(calculatieId) {
  const { data } = await supabase.from('calculation_versions').select('version_no, label, snapshot').eq('calculatie_id', calculatieId).order('version_no', { ascending: false }).limit(10);
  return data || [];
}

export async function buildRapportage(calculatieId) {
  const [calc, offerte, bestellingen, versieSnapshots] = await Promise.all([
    calcData(calculatieId),
    loadOfferte(calculatieId),
    loadBestellingen(calculatieId).catch(() => []),
    loadVersieSnapshots(calculatieId).catch(() => []),
  ]);
  const planning = await derivePlanning(calculatieId).catch(() => null);
  const rapport = bouwRapportage({
    totalen: calc.totalen, chapters: calc.chapters, rows: calc.rows,
    offerte, planning, bestellingen, versieSnapshots,
  });
  return { ...rapport, calculatie: calc.calculatie };
}
