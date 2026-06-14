// lib/offerte/genereerOffertePdf.js
// Genereert een professionele, financieringswaardige offerte-PDF (client-side, jsPDF).
// Bron: sterkcalc_offertes + werktafel-totalen + globale bedrijf/branding-instellingen.
// Geen mockdata: alle bedragen komen uit de calculatie; ontbrekende velden → '—'.
import { jsPDF } from 'jspdf';
import { computeRow } from '@/lib/calc/werktafelTotals';

const eur = (v) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(Number(v) || 0);
const datNL = (d) => new Date(d || Date.now()).toLocaleDateString('nl-NL', { day: '2-digit', month: 'long', year: 'numeric' });

// hex → [r,g,b]
function rgb(hex, fallback = [13, 27, 42]) {
  if (typeof hex !== 'string') return fallback;
  const m = hex.replace('#', '');
  if (m.length !== 6) return fallback;
  const r = parseInt(m.slice(0, 2), 16), g = parseInt(m.slice(2, 4), 16), b = parseInt(m.slice(4, 6), 16);
  return [r, g, b].every(Number.isFinite) ? [r, g, b] : fallback;
}

// Som directe kosten per hoofdstuk (consistent met de samenvatting: hoofdstukken
// tonen directe kosten, opbouw naar verkoop staat in de kostensamenvatting).
function hoofdstukTotalen(chapters, rows) {
  const perCh = new Map();
  for (const r of rows || []) {
    const cr = computeRow(r);
    const key = r.chapter_id || '__overig';
    perCh.set(key, (perCh.get(key) || 0) + (Number(cr.kostprijs) || 0));
  }
  const out = (chapters || []).map((c) => ({ naam: c.naam || c.code || 'Hoofdstuk', bedrag: perCh.get(c.id) || 0 }));
  if (perCh.has('__overig')) out.push({ naam: 'Overig', bedrag: perCh.get('__overig') });
  return out.filter((x) => x.bedrag > 0);
}

export function genereerOffertePdf({ offerte, totalen, calculatie, chapters = [], rows = [], settings = {} }) {
  const bedrijf = settings.bedrijf || {};
  const branding = settings.branding || {};
  const modules = offerte?.modules || { voorblad: true, samenvatting: true, calculatie: true, voorwaarden: true };
  const accent = rgb(branding.kleur || branding.accent);

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, M = 18;
  let y = 0;

  const footer = () => {
    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(8); doc.setTextColor(150);
      const regel = [bedrijf.naam, bedrijf.kvk ? `KvK ${bedrijf.kvk}` : null, bedrijf.btw ? `BTW ${bedrijf.btw}` : null].filter(Boolean).join('  ·  ');
      doc.text(regel || 'SterkCalc', M, 287);
      doc.text(`${i} / ${pages}`, W - M, 287, { align: 'right' });
    }
  };
  const nieuwePaginaIndienNodig = (h) => { if (y + h > 270) { doc.addPage(); y = M; } };

  // ---- Kop / voorblad ----
  doc.setFillColor(accent[0], accent[1], accent[2]);
  doc.rect(0, 0, W, 34, 'F');
  doc.setTextColor(255); doc.setFont('helvetica', 'bold'); doc.setFontSize(20);
  doc.text(bedrijf.naam || 'SterkCalc', M, 16);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  const sub = [bedrijf.adres, [bedrijf.postcode, bedrijf.plaats].filter(Boolean).join(' ')].filter(Boolean).join('  ·  ');
  if (sub) doc.text(sub, M, 24);
  doc.setFontSize(9);
  const contact = [bedrijf.email, bedrijf.telefoon, bedrijf.website].filter(Boolean).join('   ');
  if (contact) doc.text(contact, M, 30);

  y = 48;
  doc.setTextColor(30); doc.setFont('helvetica', 'bold'); doc.setFontSize(22);
  doc.text('OFFERTE', M, y);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(90);
  doc.text(`Nr. ${offerte?.nummer || '—'}`, W - M, y - 6, { align: 'right' });
  doc.text(datNL(offerte?.created_at), W - M, y, { align: 'right' });

  // ---- Klant + project ----
  y += 12;
  doc.setDrawColor(230); doc.line(M, y, W - M, y); y += 8;
  doc.setFontSize(9); doc.setTextColor(120); doc.text('AAN', M, y);
  doc.text('PROJECT', W / 2, y);
  y += 5; doc.setFontSize(11); doc.setTextColor(30); doc.setFont('helvetica', 'bold');
  doc.text(offerte?.klant_naam || '—', M, y);
  doc.text(calculatie?.naam || '—', W / 2, y);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(110);
  if (offerte?.klant_email) { y += 5; doc.text(offerte.klant_email, M, y); }
  y += 6;

  // ---- Kostensamenvatting ----
  if (modules.samenvatting && totalen) {
    nieuwePaginaIndienNodig(70);
    y += 6; doc.setFontSize(12); doc.setTextColor(accent[0], accent[1], accent[2]); doc.setFont('helvetica', 'bold');
    doc.text('Kostensamenvatting', M, y); y += 3;
    doc.setDrawColor(accent[0], accent[1], accent[2]); doc.setLineWidth(0.4); doc.line(M, y, W - M, y); doc.setLineWidth(0.2);
    y += 7;
    const op = totalen.opslagen || {};
    const regels = [
      ['Directe kosten', totalen.directe_kosten],
      [`Algemene kosten (AK ${op.ak ?? 0}%)`, totalen.akBedrag],
      [`Algemene bouwplaatskosten (ABK ${op.abk ?? 0}%)`, totalen.abkBedrag],
      [`Risico (${op.risico ?? 0}%)`, totalen.risicoBedrag],
      [`Winst (${op.winst ?? 0}%)`, totalen.winstBedrag],
    ];
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(40);
    for (const [label, bedrag] of regels) {
      nieuwePaginaIndienNodig(7);
      doc.text(label, M, y); doc.text(eur(bedrag), W - M, y, { align: 'right' }); y += 6;
    }
    doc.setDrawColor(220); doc.line(M, y, W - M, y); y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Totaal excl. btw', M, y); doc.text(eur(totalen.verkoopprijs_excl), W - M, y, { align: 'right' }); y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(`Btw (${op.btw ?? 0}%)`, M, y); doc.text(eur(totalen.btwBedrag), W - M, y, { align: 'right' }); y += 7;
    // Totaal-balk
    doc.setFillColor(accent[0], accent[1], accent[2]); doc.rect(M, y - 5, W - 2 * M, 10, 'F');
    doc.setTextColor(255); doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
    doc.text('Totaal incl. btw', M + 3, y + 1.5); doc.text(eur(totalen.verkoopprijs_incl), W - M - 3, y + 1.5, { align: 'right' });
    y += 12;
  }

  // ---- Calculatie per hoofdstuk ----
  if (modules.calculatie) {
    const hs = hoofdstukTotalen(chapters, rows);
    if (hs.length) {
      nieuwePaginaIndienNodig(20);
      y += 4; doc.setFontSize(12); doc.setTextColor(accent[0], accent[1], accent[2]); doc.setFont('helvetica', 'bold');
      doc.text('Calculatie per hoofdstuk', M, y); y += 3;
      doc.setDrawColor(accent[0], accent[1], accent[2]); doc.setLineWidth(0.4); doc.line(M, y, W - M, y); doc.setLineWidth(0.2);
      y += 7;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(40);
      doc.setTextColor(120); doc.text('Hoofdstuk', M, y); doc.text('Directe kosten', W - M, y, { align: 'right' }); doc.setTextColor(40); y += 5;
      for (const h of hs) {
        nieuwePaginaIndienNodig(6);
        doc.text(String(h.naam).slice(0, 70), M, y);
        doc.text(eur(h.bedrag), W - M, y, { align: 'right' });
        y += 5.5;
      }
      y += 2;
    }
  }

  // ---- Voorwaarden ----
  if (modules.voorwaarden) {
    const tekst = bedrijf.voorwaarden ||
      'Deze offerte is 30 dagen geldig. Genoemde bedragen zijn exclusief btw tenzij anders vermeld. ' +
      'Meer- en minderwerk wordt separaat verrekend. Uitvoering conform de actuele calculatie en STABU-systematiek.';
    nieuwePaginaIndienNodig(30);
    y += 6; doc.setFontSize(11); doc.setTextColor(accent[0], accent[1], accent[2]); doc.setFont('helvetica', 'bold');
    doc.text('Voorwaarden', M, y); y += 6;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(90);
    const lines = doc.splitTextToSize(tekst, W - 2 * M);
    nieuwePaginaIndienNodig(lines.length * 4.5);
    doc.text(lines, M, y); y += lines.length * 4.5 + 4;
  }

  // ---- Akkoord-blok ----
  nieuwePaginaIndienNodig(30);
  y += 6; doc.setDrawColor(220); doc.line(M, y, W - M, y); y += 8;
  doc.setFontSize(9); doc.setTextColor(110);
  doc.text('Voor akkoord (opdrachtgever):', M, y);
  if (offerte?.getekend_at) {
    doc.setTextColor(20); doc.setFont('helvetica', 'bold');
    doc.text(`${offerte.klant_naam || ''} — getekend ${datNL(offerte.getekend_at)}`, M, y + 7);
  } else {
    doc.setDrawColor(170); doc.line(M, y + 12, M + 70, y + 12);
    doc.text('Naam / handtekening', M, y + 16);
    doc.line(W - M - 60, y + 12, W - M, y + 12);
    doc.text('Datum', W - M - 60, y + 16);
  }

  footer();
  const naam = `Offerte_${offerte?.nummer || 'concept'}.pdf`.replace(/[^\w.\-]+/g, '_');
  doc.save(naam);
  return naam;
}
