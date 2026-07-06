// lib/notifyLead.js
// Stuurt een lead-notificatie naar het STRKBOUW-postvak (default info@strkbouw.nl).
// Provider-agnostisch: gebruikt Mailtrap Email Sending als MAILTRAP_API_TOKEN gezet is,
// anders Resend als RESEND_API_KEY gezet is. Zonder beide: no-op (de lead is al opgeslagen).
// Env:
//   MAILTRAP_API_TOKEN   → Mailtrap "Email Sending" API-token (productieverzending)
//   RESEND_API_KEY       → Resend API-key (alternatief)
//   LEADS_NOTIFY_EMAIL   → ontvanger (default 'info@strkbouw.nl')
//   LEADS_FROM_EMAIL     → afzenderadres op een geverifieerd domein (default 'noreply@strkbouw.nl')
//   LEADS_FROM_NAME      → afzendernaam (default 'STRKBOUW Leads')

const MAILTRAP_ENDPOINT = 'https://send.api.mailtrap.io/api/send';
const RESEND_ENDPOINT = 'https://api.resend.com/emails';

const esc = (s) => String(s ?? '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

function buildMessage(lead) {
  const rows = [
    ['Projecttype', lead.projecttype], ['Naam', lead.naam], ['E-mail', lead.email],
    ['Telefoon', lead.telefoon], ['Projectadres', lead.projectadres], ['Funda/URL', lead.funda_url],
    ['Bron', lead.bron], ['Aantal bestanden', lead.files], ['Bericht', lead.bericht],
  ].filter(([, v]) => v !== null && v !== undefined && v !== '');

  const subject = `Nieuwe calculatie-aanvraag${lead.projecttype ? ` — ${lead.projecttype}` : ''}${lead.naam ? ` (${lead.naam})` : ''}`;
  const html = `<h2 style="font-family:Arial,sans-serif">Nieuwe calculatie-aanvraag</h2>
    <table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">
    ${rows.map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#5a6b7a;vertical-align:top"><strong>${esc(k)}</strong></td><td style="padding:4px 0">${esc(v)}</td></tr>`).join('')}
    </table>
    ${lead.utm && Object.keys(lead.utm).length ? `<p style="font-family:Arial,sans-serif;font-size:12px;color:#90a0ad">UTM: ${esc(JSON.stringify(lead.utm))}</p>` : ''}`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');
  return { subject, html, text };
}

async function sendViaMailtrap(token, { to, fromEmail, fromName, replyTo, subject, html, text }) {
  const r = await fetch(MAILTRAP_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: { email: fromEmail, name: fromName },
      to: [{ email: to }],
      subject, html, text,
      ...(replyTo ? { headers: { 'Reply-To': replyTo } } : {}),
    }),
  });
  return { sent: r.ok, status: r.status, provider: 'mailtrap' };
}

async function sendViaResend(apiKey, { to, fromEmail, fromName, replyTo, subject, html, text }) {
  const r = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      reply_to: replyTo || undefined,
      subject, html, text,
    }),
  });
  return { sent: r.ok, status: r.status, provider: 'resend' };
}

export async function notifyLead(lead = {}) {
  const mailtrapToken = process.env.MAILTRAP_API_TOKEN;
  const resendKey = process.env.RESEND_API_KEY;
  if (!mailtrapToken && !resendKey) return { sent: false, reason: 'no_provider_configured' };

  const to = process.env.LEADS_NOTIFY_EMAIL || 'info@strkbouw.nl';
  const fromEmail = process.env.LEADS_FROM_EMAIL || 'noreply@strkbouw.nl';
  const fromName = process.env.LEADS_FROM_NAME || 'STRKBOUW Leads';
  const replyTo = lead.email || null;

  const msg = { to, fromEmail, fromName, replyTo, ...buildMessage(lead) };

  try {
    if (mailtrapToken) return await sendViaMailtrap(mailtrapToken, msg);
    return await sendViaResend(resendKey, msg);
  } catch (e) {
    return { sent: false, reason: String(e?.message || e).slice(0, 120) };
  }
}
