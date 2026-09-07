// services/opnames.js — CRUD voor opnames (opnameformulier), nu binnen de SterkCalc-dashboard
// i.p.v. het losse Opnameformulier.html-bestand.
//
// Werkritme (Orlando, iPad zonder toetsenbord bij de klant):
// 1. Afspraak vastleggen — vaak alleen NAW + datum, soms onderweg/telefonisch. Gaat via de
//    submit-opname edge function (service-role): slaat op + stuurt Telegram/e-mail-notificatie.
//    Maakt NOG GEEN calculatie aan (een afspraak die niet doorgaat mag geen calc-nummer kosten).
// 2. Op locatie: opname aanvullen (omschrijving, maten, schetsen, foto's) via de bewerkpagina.
// 3. Opname afronden → voltooiOpname() maakt dan pas het gekoppelde project+calculatie aan
//    (client-side insert, mag van RLS zolang er een ingelogde sessie is) en levert het
//    calc-nummer (calculaties.projectnummer, DB-auto-gegenereerd).
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

// Maakt bij het afronden van een opname op locatie het gekoppelde project + calculatie aan
// en zet calculatie_id op de opname. `opname` moet de actuele (net opgeslagen) rij zijn.
export async function voltooiOpname(opname) {
  const { data: project, error: projectError } = await supabase
    .from('projecten')
    .insert({
      naam: `Opname ${opname.klant_naam}`,
      locatie: opname.plaats || null,
      adres: opname.adres || null,
      postcode: opname.postcode || null,
      plaatsnaam: opname.plaats || null,
      project_type: opname.type_aanvraag || null,
      omschrijving: opname.omschrijving || null,
      telefoon: opname.telefoon || null,
      status: 'concept',
    })
    .select('id')
    .single();
  if (projectError) throw projectError;

  const { data: calc, error: calcError } = await supabase
    .from('calculaties')
    .insert({
      project_id: project.id,
      naam: `Opname ${opname.klant_naam}`,
      status: 'concept',
      opdrachtgever_naam: opname.klant_naam,
      naam_opdrachtgever: opname.klant_naam,
      opdrachtgever_adres: opname.adres || null,
      opdrachtgever_postcode: opname.postcode || null,
      opdrachtgever_plaatsnaam: opname.plaats || null,
      opdrachtgever_telefoon: opname.telefoon || null,
      opdrachtgever_email: opname.email || null,
      project_adres: opname.adres || null,
      project_postcode: opname.postcode || null,
      project_plaatsnaam: opname.plaats || null,
      projecttype: opname.type_aanvraag || null,
      project_type: opname.type_aanvraag || null,
      omschrijving: opname.omschrijving || null,
    })
    .select('id, projectnummer')
    .single();
  if (calcError) throw calcError;

  await updateOpname(opname.id, { calculatie_id: calc.id, status: 'omgezet_naar_calculatie' });
  return { calculatie_id: calc.id, calc_nummer: calc.projectnummer };
}
