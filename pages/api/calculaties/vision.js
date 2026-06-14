// pages/api/calculaties/vision.js
// SterkCalc Visions — thin vision-AI proxy.
// Input : { fileUrl (signed storage-URL), mediaType }
// Output: { ruimtes:[{naam,klasse,lengte,breedte,hoogte,confidence,openingen[]}], plan_schaal, opmerkingen, model }
//
// Bewust GEEN DB-writes en GEEN service-role hier: de DB-schrijfacties gebeuren
// client-side via de pmovaz anon-client (zelfde pad als de rest van de app), zodat
// deze route niet afhangt van server-env (SUPABASE_SERVICE_ROLE_KEY wijst naar het
// verkeerde project en is malformed). Deze route heeft enkel ANTHROPIC_API_KEY nodig.
//
// HARDE REGEL: AI is uitsluitend adviserend (herkennen/meten/voorstellen). Het raakt
// NOOIT AK/ABK/risico/winst of prijzen aan. Geen mockdata: zonder key/bestand → fout.

export const config = { api: { bodyParser: { sizeLimit: '1mb' } } }

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = process.env.STERKCALC_VISION_MODEL || 'claude-opus-4-8'
const SUPPORTED = {
  'application/pdf': 'document',
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'image/webp': 'image',
}

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

const num = (v) => (Number.isFinite(parseFloat(v)) ? parseFloat(v) : null)
const clampConf = (v) => {
  const x = num(v)
  if (x == null) return null
  const pct = x > 0 && x <= 1 ? x * 100 : x
  return Math.max(0, Math.min(100, pct))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' })

  const { fileUrl, mediaType } = req.body || {}
  if (!fileUrl || !mediaType) return res.status(400).json({ error: 'fileUrl en mediaType zijn verplicht.' })

  const block = SUPPORTED[mediaType]
  if (!block) {
    return res.status(422).json({
      error: `Bestandstype ${mediaType} wordt (nog) niet door vision ondersteund. ` +
        'DWG/IFC: exporteer eerst naar PDF of afbeelding. Ondersteund: PDF, PNG, JPG, WEBP.',
    })
  }
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(503).json({ error: 'ANTHROPIC_API_KEY ontbreekt op de server. Vision is niet beschikbaar.' })

  try {
    // 1) Bestand ophalen via de signed storage-URL → base64.
    const fileRes = await fetch(fileUrl)
    if (!fileRes.ok) return res.status(502).json({ error: `Kon bestand niet ophalen uit storage (${fileRes.status}).` })
    const buf = Buffer.from(await fileRes.arrayBuffer())
    const base64 = buf.toString('base64')

    const contentBlock =
      block === 'document'
        ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }
        : { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } }

    // 2) Claude vision-call, geforceerd naar het tool-schema.
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
      return res.status(502).json({ error: `Vision-model fout (${aiRes.status}): ${t.slice(0, 400)}` })
    }
    const aiJson = await aiRes.json()
    const toolUse = (aiJson.content || []).find((c) => c.type === 'tool_use' && c.name === TOOL.name)
    if (!toolUse?.input) return res.status(502).json({ error: 'Vision-model gaf geen bruikbare structuur terug.' })

    // 3) Normaliseren naar het DB-formaat (m_-suffix → kolomnamen); geen DB-write hier.
    const out = toolUse.input
    const ruimtes = (Array.isArray(out.ruimtes) ? out.ruimtes : []).map((r) => ({
      naam: r.naam || r.klasse || 'Ruimte',
      klasse: r.klasse || 'Overig',
      lengte: num(r.lengte_m),
      breedte: num(r.breedte_m),
      hoogte: num(r.hoogte_m) || 2.6,
      confidence: clampConf(r.confidence),
      openingen: (Array.isArray(r.openingen) ? r.openingen : []).map((o) => ({
        type: o.type || 'opening',
        breedte: num(o.breedte_m),
        hoogte: num(o.hoogte_m),
        aantal: Number.isFinite(parseInt(o.aantal, 10)) ? parseInt(o.aantal, 10) : 1,
      })),
    }))

    return res.status(200).json({
      ruimtes,
      plan_schaal: out.plan_schaal || null,
      opmerkingen: out.opmerkingen || null,
      model: MODEL,
    })
  } catch (e) {
    return res.status(500).json({ error: 'Vision-analyse mislukt: ' + (e.message || String(e)) })
  }
}
