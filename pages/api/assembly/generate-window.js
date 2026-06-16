// pages/api/assembly/generate-window.js — IFcWindow rekenmodel-route → canonieke generated_items.
// Draait het BESTAANDE kozijn-rekenmodel met IFC-afgeleide inputs en stage't de output als
// canonieke generated_items (review/promote via dezelfde Workbench). Geen prijzen, geen promote.
import KozijnModel from '@/lib/calc/rekenmodellen/kozijn';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// rekenmodel-combi → review-functie (uniek per object i.v.m. UNIQUE(ifc_object_id,functie))
const FUNCTIE = {
  'CB-KOZHR': 'kozijn', 'CUR-1403': 'kozijn', 'CUR-1402': 'kozijn',
  'C3-1502': 'beglazing', 'CUR-1408': 'hang- en sluitwerk', 'CUR-1409': 'vensterbank',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Alleen POST' });
  const { ifc_object_id } = req.body || {};
  if (!ifc_object_id) return res.status(400).json({ error: 'ifc_object_id verplicht' });
  try {
    const admin = supabaseAdmin();
    const { data: ctx, error } = await admin.rpc('ifc_rekenmodel_context', { p_object_id: ifc_object_id });
    if (error) throw error;
    if (!ctx || ctx.ok !== true) return res.status(400).json({ error: ctx?.reason || 'geen context' });
    if (ctx.rekenmodel_object !== 'kozijn') return res.status(400).json({ error: `rekenmodel '${ctx.rekenmodel_object}' niet ondersteund` });

    const q = ctx.quantities || {};
    const ps = ctx.propertyset || {};
    // ThermalTransmittance uit (geneste) propertyset halen
    let tt = ps.ThermalTransmittance ?? null;
    for (const k of Object.keys(ps)) {
      const v = ps[k];
      if (v && typeof v === 'object' && v.ThermalTransmittance != null) tt = v.ThermalTransmittance;
    }
    // variant → beglazing-input van het kozijn-rekenmodel (opties: hr | triple)
    const beglazing = ctx.variant === 'triple' ? 'triple' : 'hr';
    const inputs = {
      aantal: 1, breedte: Number(q.Width) || 1.2, hoogte: Number(q.Height) || 1.4,
      materiaal: 'kunststof', beglazing, hangsluit: 'ja', vensterbank: 'ja', verlies: 5,
    };
    const out = KozijnModel.bereken(inputs);
    const items = (out.regels || []).map((r) => ({
      functie: FUNCTIE[r.combiCode] || String(r.omschrijving || r.combiCode).toLowerCase().slice(0, 30),
      combi_code: r.combiCode,
      hoeveelheid: r.hoeveelheid,
    }));
    const meta = {
      rekenmodel_object: 'kozijn', thermal_transmittance: tt, variant: ctx.variant,
      rekenmodel_values: ctx.rekenmodel_values, rekenmodel_inputs: inputs,
    };
    const { data, error: e2 } = await admin.rpc('ifc_stage_rekenmodel_items', {
      p_object_id: ifc_object_id, p_items: items, p_meta: meta,
    });
    if (e2) throw e2;
    if (data?.ok === false) return res.status(400).json({ error: data.reason });
    res.status(200).json({ ok: true, ...data, items });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
