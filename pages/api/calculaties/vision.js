// pages/api/calculaties/vision.js
// SterkCalc Visions — echte vision-AI tekening→ruimteherkenning.
// Flow: browser uploadt PDF/afbeelding naar storage → deze route haalt het bestand op
// (service-role), stuurt het naar Claude (vision) met een strikt JSON-schema, en
// schrijft de herkende ruimtes + openingen weg in de bestaande AI-tabellen.
//
// HARDE REGEL: AI is uitsluitend adviserend (herkennen/meten/voorstellen). Het raakt
// NOOIT AK/ABK/risico/winst of prijzen aan. Geen mockdata: zonder API-key/bestand faalt
// de route met een duidelijke fout i.p.v. verzonnen data.

import { createClient } from '@supabase/supabase-js'

export const config = { api: { bodyParser: { sizeLimit: '1mb' } } }

const BUCKET = 'sterkcalc-vision-uploads'
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = process.env.STERKCALC_VISION_MODEL || 'claude-opus-4-8'
const SUPPORTED = {
  'application/pdf': 'document',
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'image/webp': 'image',
}

// Strikt extractieschema — Claude moet exact dit teruggeven via tool-use.
const TOOL = {
  name: 'leg_ruimtes_vast',
  description:
    'Leg de uit de bouwtekening herkende ruimtes, hun maten en openingen vast. ' +
    'Uitsluitend wat zichtbaar/afleidbaar is; verzin geen ruimtes of maten.',
  input_schema: {
    type: 'object',
    properties: {
      plan_schaal: { type: 'string', description: 'Herkende schaal, bv. "1:100", of "onbekend".' },
      opmerkingen: { type: 'string', description: 'Korte toelichting/onzekerheden (NL).' },
      ruimtes: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            naam: { type: 'string', description: 'Label op tekening, bv. "Slaapkamer 1".' },
            klasse: { type: 'string', description: 'Generieke klasse, bv. Woonkamer/Slaapkamer/Badkamer/Keuken/Toilet/Hal/Berging/Kantoor/Overig.' },
            lengte_m: { type: 'number' },
            breedte_m: { type: 'number' },
            hoogte_m: { type: 'number', description: 'Verdiepingshoogte in m; gebruik 2.6 als onbekend.' },
            oppervlakte_m2: { type: 'number' },
            confidence: { type: 'number', description: '0-100, zekerheid over maten/herkenning.' },
            openingen: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', description: 'deur/raam/kozijn/doorgang.' },
                  breedte_m: { type: 'number' },
                  hoogte_m: { type: 'number' },
                  aantal: { type: 'integer' },
                },
                required: ['type'],
              },
            },
          },
          required: ['naam', 'klasse'],
        },
      },
    },
    required: ['ruimtes'],
  },
}

const PROMPT =
  'Je bent een bouwkundig calculator. Analyseer deze Nederlandse bouwtekening/plattegrond. ' +
  'Identificeer elke ruimte, lees of schat de maten in METERS (lengte, breedte, hoogte) en de ' +
  'openingen (deuren, ramen, kozijnen). Gebruik geprinte maatvoering/maatlijnen waar aanwezig; ' +
  'anders schat via schaalbalk/raster en geef een lagere confidence. Hoogte onbekend → 2.6 m. ' +
  'Classificeer ruimtes generiek (Woonkamer/Slaapkamer/Badkamer/Keuken/Toilet/Hal/Berging/Kantoor/Overig). ' +
  'Verzin niets: laat onzekere velden weg of geef lage confidence. Geef ALLEEN het resultaat via ' +
  'de tool leg_ruimtes_vast. Bereken GEEN kosten, prijzen of marges.'

function svc() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service-role env ontbreekt (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).')
  return createClient(url, key, { auth: { persistSession: false } })
}

const num = (v) => (Number.isFinite(parseFloat(v)) ? parseFloat(v) : null)
const clampConf = (v) => {
  const x = num(v)
  if (x == null) return null
  // Model krijgt 0-100; tolereer per ongeluk 0-1 (fractie) en schaal die op.
  const pct = x > 0 && x <= 1 ? x * 100 : x
  return Math.max(0, Math.min(100, pct))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' })

  const { calculatieId, storagePath, bestandsnaam, mediaType } = req.body || {}
  if (!calculatieId || !storagePath || !mediaType) {
    return res.status(400).json({ error: 'calculatieId, storagePath en mediaType zijn verplicht.' })
  }
  const block = SUPPORTED[mediaType]
  if (!block) {
    return res.status(422).json({
      error: `Bestandstype ${mediaType} wordt (nog) niet door vision ondersteund. ` +
        'DWG/IFC: exporteer eerst naar PDF of afbeelding. Ondersteund: PDF, PNG, JPG, WEBP.',
    })
  }
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(503).json({ error: 'ANTHROPIC_API_KEY ontbreekt op de server. Vision is niet beschikbaar.' })

  let supabase, analysisId
  try {
    supabase = svc()
  } catch (e) {
    return res.status(503).json({ error: e.message })
  }

  // 1) Log-rij aanmaken (pending) voor traceability.
  try {
    const { data, error } = await supabase
      .from('calculatie_vision_analyses')
      .insert({ calculatie_id: calculatieId, bestandsnaam, storage_path: storagePath, media_type: mediaType, model: MODEL, status: 'pending' })
      .select('id')
      .single()
    if (error) throw error
    analysisId = data.id
  } catch (e) {
    return res.status(500).json({ error: 'Kon analyse niet starten: ' + e.message })
  }

  const fail = async (status, msg) => {
    try { await supabase.from('calculatie_vision_analyses').update({ status: 'error', error: msg }).eq('id', analysisId) } catch {}
    return res.status(status).json({ error: msg, analysisId })
  }

  try {
    // 2) Bestand ophalen uit storage en naar base64.
    const dl = await supabase.storage.from(BUCKET).download(storagePath)
    if (dl.error || !dl.data) return fail(502, 'Bestand niet gevonden in storage: ' + (dl.error?.message || storagePath))
    const buf = Buffer.from(await dl.data.arrayBuffer())
    const base64 = buf.toString('base64')

    const contentBlock =
      block === 'document'
        ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }
        : { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } }

    // 3) Claude vision-call, geforceerd naar het tool-schema.
    const aiRes = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 8000,
        tools: [TOOL],
        tool_choice: { type: 'tool', name: TOOL.name },
        messages: [{ role: 'user', content: [{ type: 'text', text: PROMPT }, contentBlock] }],
      }),
    })

    if (!aiRes.ok) {
      const t = await aiRes.text().catch(() => '')
      return fail(502, `Vision-model fout (${aiRes.status}): ${t.slice(0, 400)}`)
    }
    const aiJson = await aiRes.json()
    const toolUse = (aiJson.content || []).find((c) => c.type === 'tool_use' && c.name === TOOL.name)
    if (!toolUse?.input) return fail(502, 'Vision-model gaf geen bruikbare structuur terug.')

    const out = toolUse.input
    const ruimtes = Array.isArray(out.ruimtes) ? out.ruimtes : []

    // 4) Ruimtes + openingen wegschrijven (source=ai, gekoppeld aan analyse).
    let openingenTotal = 0
    const confs = []
    const inserted = []
    for (const r of ruimtes) {
      const conf = clampConf(r.confidence)
      if (conf != null) confs.push(conf)
      const { data: row, error: rErr } = await supabase
        .from('calculatie_ruimtes')
        .insert({
          calculatie_id: calculatieId,
          naam: r.naam || r.klasse || 'Ruimte',
          klasse: r.klasse || 'Overig',
          lengte: num(r.lengte_m),
          breedte: num(r.breedte_m),
          hoogte: num(r.hoogte_m) || 2.6,
          confidence: conf,
          source: 'ai',
          vision_analysis_id: analysisId,
        })
        .select('*')
        .single()
      if (rErr) throw rErr
      inserted.push(row)

      const ops = Array.isArray(r.openingen) ? r.openingen : []
      if (ops.length) {
        const payload = ops.map((o) => ({
          ruimte_id: row.id,
          type: o.type || 'opening',
          breedte: num(o.breedte_m),
          hoogte: num(o.hoogte_m),
          aantal: Number.isFinite(parseInt(o.aantal, 10)) ? parseInt(o.aantal, 10) : 1,
        }))
        const { error: oErr } = await supabase.from('calculatie_openingen').insert(payload)
        if (!oErr) openingenTotal += payload.reduce((s, p) => s + (p.aantal || 1), 0)
      }
    }

    const gemConf = confs.length ? Math.round((confs.reduce((s, v) => s + v, 0) / confs.length) * 100) / 100 : null

    // 5) Analyse afronden.
    await supabase
      .from('calculatie_vision_analyses')
      .update({
        status: 'done',
        ruimtes_gevonden: inserted.length,
        openingen_gevonden: openingenTotal,
        gem_confidence: gemConf,
        plan_schaal: out.plan_schaal || null,
        opmerkingen: out.opmerkingen || null,
        raw_response: out,
      })
      .eq('id', analysisId)

    return res.status(200).json({
      analysisId,
      ruimtes: inserted,
      meta: {
        ruimtes_gevonden: inserted.length,
        openingen_gevonden: openingenTotal,
        gem_confidence: gemConf,
        plan_schaal: out.plan_schaal || null,
        opmerkingen: out.opmerkingen || null,
        model: MODEL,
      },
    })
  } catch (e) {
    return fail(500, 'Vision-analyse mislukt: ' + (e.message || String(e)))
  }
}
