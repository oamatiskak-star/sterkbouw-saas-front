// services/opnames.js — CRUD voor opnames (opnameformulier), nu binnen de SterkCalc-dashboard
// i.p.v. het losse Opnameformulier.html-bestand. Create blijft via de bestaande edge function
// (submit-opname) lopen zodat de Telegram/e-mail-notificaties intact blijven; list/get/update
// gaan direct via Supabase (RLS-policies toegevoegd in migratie 20260907_01).
import supabase from '@/lib/supabase';

const SUBMIT_URL = 'https://shaunumewswpxhmgbtvv.supabase.co/functions/v1/submit-opname';
const SUBMIT_KEY = 'sb_publishable_hU81pMxo04uxessWETnS7w_dOAlJNOf';

export const STATUS_OPTIES = ['nieuw', 'in_behandeling', 'omgezet_naar_calculatie', 'afgerond'];

export async function listOpnames() {
  const { data, error } = await supabase
    .from('opnames')
    .select('id, klant_naam, plaats, type_aanvraag, datum_opname, status, opgenomen_door, created_at, updated_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getOpname(id) {
  const { data, error } = await supabase.from('opnames').select('*').eq('id', id).maybeSingle();
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
