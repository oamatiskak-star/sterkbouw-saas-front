// lib/offerte/verstuurOfferteMail.js
// Verstuurt de premium offerte-mail naar de klant. Zelfde provider-agnostische aanpak als
// lib/notifyLead.js (Mailtrap primair, Resend fallback, no-op zonder provider-key) — alleen
// het afzenderadres is dedicated (offerte@strkbouw.nl), los van LEADS_FROM_EMAIL: dat adres
// is voor interne lead-notificaties, dit is het klantgerichte offerte-postvak.
const MAILTRAP_ENDPOINT = 'https://send.api.mailtrap.io/api/send';
const RESEND_ENDPOINT = 'https://api.resend.com/emails';

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
  const body = await r.text().catch(() => '');
  return { sent: r.ok, status: r.status, provider: 'mailtrap', body: r.ok ? undefined : body.slice(0, 300) };
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
  const body = await r.text().catch(() => '');
  return { sent: r.ok, status: r.status, provider: 'resend', body: r.ok ? undefined : body.slice(0, 300) };
}

export async function verstuurOfferteMail({ to, replyTo, subject, html, text }) {
  const mailtrapToken = process.env.MAILTRAP_API_TOKEN;
  const resendKey = process.env.RESEND_API_KEY;
  if (!mailtrapToken && !resendKey) return { sent: false, reason: 'no_provider_configured' };

  const fromEmail = process.env.OFFERTE_FROM_EMAIL || 'offerte@strkbouw.nl';
  const fromName = process.env.OFFERTE_FROM_NAME || 'STRKBOUW';
  const msg = { to, fromEmail, fromName, replyTo, subject, html, text };

  try {
    if (mailtrapToken) return await sendViaMailtrap(mailtrapToken, msg);
    return await sendViaResend(resendKey, msg);
  } catch (e) {
    return { sent: false, reason: String(e?.message || e).slice(0, 200) };
  }
}
