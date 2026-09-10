// lib/afspraken/afspraakEmailTemplate.js
// Afspraak-bevestigingsmail — verstuurd vanaf info@strkbouw.nl, vooral voor aanvragen vanuit
// Trustoo/Homedeal/Werkspot. Puur HTML-opmaak, geen logica.

const esc = (s) => String(s ?? '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

const fmtDatum = (d) => {
  if (!d) return null;
  try {
    return new Date(d).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return d;
  }
};

export function buildAfspraakEmail({ klantNaam, adres, postcode, plaats, datumOpname, tijdOpname, bron, opgenomenDoor, bedrijfNaam }) {
  const naam = esc(klantNaam || 'klant');
  const bedrijf = esc(bedrijfNaam || 'STRKBOUW');
  const datumTekst = fmtDatum(datumOpname);
  const adresTekst = [adres, [postcode, plaats].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  const bronTekst = bron ? ` naar aanleiding van uw aanvraag via ${esc(bron)}` : '';

  const subject = `Uw afspraak bij ${bedrijf} is bevestigd`;

  const rows = [
    ['Datum', datumTekst],
    ['Tijd', tijdOpname],
    ['Adres', adresTekst || null],
    ['Opgenomen door', opgenomenDoor],
  ].filter(([, v]) => v);

  const html = `<!doctype html>
<html lang="nl">
<body style="margin:0;padding:0;background:#F1EFEA;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1EFEA;padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr><td style="background:#0D1B2A;padding:22px 32px;">
          <span style="color:#ffffff;font-size:16px;font-weight:bold;letter-spacing:0.06em;">${bedrijf.toUpperCase()}</span>
        </td></tr>
        <tr><td style="padding:36px 32px 8px;">
          <h1 style="margin:0 0 20px;font-size:24px;line-height:1.3;color:#111827;">Uw afspraak is bevestigd</h1>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#374151;">Beste ${naam},</p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#374151;">Hierbij bevestigen wij uw afspraak${bronTekst}. Hieronder de details:</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
            ${rows.map(([k, v]) => `<tr><td style="padding:6px 0;font-size:14px;color:#9AA5B1;width:130px;vertical-align:top;">${esc(k)}</td><td style="padding:6px 0;font-size:14px;color:#111827;font-weight:bold;">${esc(v)}</td></tr>`).join('')}
          </table>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#374151;">Heeft u vragen of moet de afspraak verzet worden? Neem gerust contact met ons op.</p>
          <p style="margin:32px 0 4px;font-size:15px;line-height:1.6;color:#374151;">Met vriendelijke groet,</p>
          <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#374151;">Het ${bedrijf}-team</p>
        </td></tr>
        <tr><td style="padding:18px 32px;border-top:1px solid #EEF0F2;">
          <p style="margin:0;font-size:12px;color:#9AA5B1;">${bedrijf}<br/>Bouwen aan beter wonen.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Beste ${klantNaam || 'klant'},\n\nHierbij bevestigen wij uw afspraak${bronTekst ? bronTekst.replace(/&amp;/g, '&') : ''}.\n\n` +
    rows.map(([k, v]) => `${k}: ${v}`).join('\n') +
    `\n\nHeeft u vragen of moet de afspraak verzet worden? Neem gerust contact met ons op.\n\nMet vriendelijke groet,\nHet ${bedrijfNaam || 'STRKBOUW'}-team`;

  return { subject, html, text };
}
