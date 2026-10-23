// lib/mail/verstuurViaResend.js
// Verzending via de Resend HTTP-API (domein strkbouw.nl is in Resend geverifieerd; DKIM resend._domainkey, bounce-domein
// send.strkbouw.nl). Geeft het Resend-bericht-ID terug, zodat de aflevering later in Resend te volgen is.
// Idempotency-Key: dezelfde sleutel binnen 24 uur levert bij Resend geen tweede mail op (veilig bij een herhaalde aanroep).
const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export async function verstuurViaResend({ apiKey, fromEmail, fromName, to, replyTo, subject, html, text, idempotencyKey, fetchImpl = fetch }) {
  if (!apiKey) return { sent: false, provider: 'resend', reason: 'no_resend_key' };
  try {
    const r = await fetchImpl(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [to],
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject, html, text,
      }),
    });
    const body = await r.json().catch(() => ({}));
    if (!r.ok || !body?.id) {
      return { sent: false, provider: 'resend', status: r.status, reason: String(body?.message || body?.name || `HTTP ${r.status}`).slice(0, 300) };
    }
    // 'sent' = Resend heeft het bericht geaccepteerd; de aflevering zelf volgt via het ID (GET /emails/{id}: last_event).
    return { sent: true, provider: 'resend', status: r.status, id: body.id };
  } catch (e) {
    return { sent: false, provider: 'resend', reason: String(e?.message || e).slice(0, 300) };
  }
}
