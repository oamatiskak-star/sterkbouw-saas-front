// node --test tests/portaal/ — toegangscode-mail via Resend met eerlijke terugval naar SMTP (geen echte mail).
import test from 'node:test';
import assert from 'node:assert/strict';
import { verstuurViaResend } from '../../lib/mail/verstuurViaResend.js';
import { verstuurToegangscodeMail } from '../../lib/offerte/verstuurToegangscodeMail.js';

const MAIL = { to: 'klant@example.com', subject: 'Uw toegangscode voor offerte OFF-1', html: '<p>123456</p>', text: '123456', idempotencyKey: 'portaal-code-abc' };

test('Resend: juiste afzender, ontvanger en Idempotency-Key; ID terug', async () => {
  let verzoek;
  const fetchImpl = async (url, init) => { verzoek = { url, init }; return { ok: true, status: 200, json: async () => ({ id: 're_123' }) }; };
  const r = await verstuurViaResend({ apiKey: 'k', fromEmail: 'offerte@strkbouw.nl', fromName: 'STRKBOUW', ...MAIL, fetchImpl });
  assert.deepEqual([r.sent, r.id, r.provider], [true, 're_123', 'resend']);
  assert.equal(verzoek.url, 'https://api.resend.com/emails');
  assert.equal(verzoek.init.headers['Idempotency-Key'], 'portaal-code-abc');
  const body = JSON.parse(verzoek.init.body);
  assert.equal(body.from, 'STRKBOUW <offerte@strkbouw.nl>');
  assert.deepEqual(body.to, ['klant@example.com']);
});

test('Resend weigert (422) → niet verstuurd, met reden', async () => {
  const fetchImpl = async () => ({ ok: false, status: 422, json: async () => ({ name: 'validation_error', message: 'domein niet geverifieerd' }) });
  const r = await verstuurViaResend({ apiKey: 'k', fromEmail: 'a@b.nl', fromName: 'X', ...MAIL, fetchImpl });
  assert.equal(r.sent, false);
  assert.match(r.reason, /niet geverifieerd/);
});

test('Resend onbereikbaar → niet verstuurd (geen exception)', async () => {
  const r = await verstuurViaResend({ apiKey: 'k', fromEmail: 'a@b.nl', fromName: 'X', ...MAIL, fetchImpl: async () => { throw new Error('ECONNRESET'); } });
  assert.deepEqual([r.sent, r.reason], [false, 'ECONNRESET']);
});

test('codemail: Resend geslaagd → geen SMTP', async () => {
  let smtp = 0;
  const r = await verstuurToegangscodeMail(MAIL, {
    env: { RESEND_API_KEY: 'k' }, verstuurViaResend: async (a) => ({ sent: true, provider: 'resend', id: 're_9', ontvangen: a }),
    verstuurOfferteMail: async () => { smtp++; return { sent: true, provider: 'smtp' }; },
  });
  assert.deepEqual([r.sent, r.provider, r.id, smtp], [true, 'resend', 're_9', 0]);
  assert.equal(r.ontvangen.fromEmail, 'offerte@strkbouw.nl');
  assert.equal(r.ontvangen.idempotencyKey, 'portaal-code-abc');
});

test('codemail: Resend-fout → terugval SMTP, beide pogingen gelogd', async () => {
  const r = await verstuurToegangscodeMail(MAIL, {
    env: { RESEND_API_KEY: 'k' }, verstuurViaResend: async () => ({ sent: false, provider: 'resend', reason: 'HTTP 500' }),
    verstuurOfferteMail: async () => ({ sent: true, provider: 'smtp', messageId: '<m@x>' }),
  });
  assert.deepEqual([r.sent, r.provider, r.terugval], [true, 'smtp', true]);
  assert.deepEqual(r.pogingen.map((p) => [p.provider, p.sent]), [['resend', false], ['smtp', true]]);
});

test('codemail: Resend én SMTP falen → niet verstuurd (geen stille "verstuurd")', async () => {
  const r = await verstuurToegangscodeMail(MAIL, {
    env: {}, verstuurViaResend,  // zonder sleutel: no_resend_key
    verstuurOfferteMail: async () => ({ sent: false, provider: 'smtp', reason: 'auth failed' }),
  });
  assert.equal(r.sent, false);
  assert.deepEqual(r.pogingen.map((p) => p.reason), ['no_resend_key', 'auth failed']);
});
