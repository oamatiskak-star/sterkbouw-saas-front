// services/opnames.js — CRUD voor opnames (opnameformulier), nu binnen de SterkCalc-dashboard
// i.p.v. het losse Opnameformulier.html-bestand. Create loopt via de submit-opname edge
// function (service-role): maakt meteen een gekoppelde project+calculatie aan en geeft het
// calc-nummer terug. List/get/update gaan direct via Supabase (RLS-policies + calculatie_id
// FK toegevoegd in migratie opnames_tabel_met_calculatie_koppeling, pmovazftwoxjopqkuuhp).
import supabase from '@/lib/supabase';

const SUBMIT_URL = 'https://pmovazftwoxjopqkuuhp.supabase.co/functions/v1/submit-opname';
const SUBMIT_KEY = 'sb_publishable_78EeIVVPKyGgpQH_bNbwaw_QKfSuGaZ';

export const STATUS_OPTIES = ['nieuw', 'in_behandeling', 'omgezet_naar_calculatie', 'afgerond'];

export async function listOpnames() {
  const { data, error } = await supabase
    .from('opnames')
    .select('id, klant_naam, plaats, type_aanvraag, datum_opname, status, opgenomen_door, created_at, updated_at, calculatie_id, calculaties(projectnummer)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getOpname(id) {
  const { data, error } = await supabase
    .from('opnames')
    .select('*, calculaties(id, projectnummer, naam)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateOpname(id, patch) {
  const { error } = await supabase.from('opnames').update(patch).eq('id', id);
  if (error) throw error;
}

export async function createOpname(payload) {
  const res = await fetch(SUBMIT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUBMIT_KEY },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) throw new Error('Opslaan mislukt — controleer de internetverbinding.');
  return json;
}
