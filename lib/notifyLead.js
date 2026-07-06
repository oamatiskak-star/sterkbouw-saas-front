// lib/notifyLead.js
// Stuurt een lead-notificatie naar het STRKBOUW-postvak via Resend (HTTP API).
// Env-gated: zonder RESEND_API_KEY geen verzending (de lead is al opgeslagen).
const ENDPOINT = 'https://api.resend.com/emails';
const esc = (s) => String(s ?? '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

export async function notifyLead(lead = {}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: 'no_api_key' };
  const to = process.env.LEADS_NOTIFY_EMAIL || 'info@strkbouw.nl';
  const from = process.env.LEADS_FROM_EMAIL || 'STRKBOUW Leads <noreply@strkbouw.nl>';

  const rows = [
    ['Projecttype', lead.projecttype], ['Naam', lead.naam], ['E-mail', lead.email],
    ['Telefoon', lead.telefoon], ['Projectadres', lead.projectadres], ['Funda/URL', lead.funda_url],
    ['Bron', lead.bron], ['Aantal bestanden', lead.files], ['Bericht', lead.bericht],
  ].filter(([, v]) => v !== null && v !== undefined && v !== '');

  const html = `<h2 style="font-family:Arial,sans-serif">Nieuwe calculatie-aanvraag</h2>
    <table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">
    ${rows.map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#5a6b7a;vertical-align:top"><strong>${esc(k)}</strong></td><td style="padding:4px 0">${esc(v)}</td></tr>`).join('')}
    </table>
    ${lead.utm && Object.keys(lead.utm).length ? `<p style="font-family:Arial,sans-serif;font-size:12px;color:#90a0ad">UTM: ${esc(JSON.stringify(lead.utm))}</p>` : ''}`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');

  try {
    const r = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from, to: [to],
        reply_to: lead.email || undefined,
        subject: `Nieuwe calculatie-aanvraag${lead.projecttype ? ` — ${lead.projecttype}` : ''}${lead.naam ? ` (${lead.naam})` : ''}`,
        html, text,
      }),
    });
    return { sent: r.ok, status: r.status };
  } catch (e) {
    return { sent: false, reason: String(e?.message || e).slice(0, 120) };
  }
}
