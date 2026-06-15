// lib/offerte/genereerOffertePdf.js
// Sprint 6 — Offerte Excellence: premium verkoopdocument (2Jours++), niet een platte PDF-export.
// Secties: cover (projectfoto + branding) → executive summary (KPI-kaarten) → werkzaamheden per
// hoofdstuk → opties/alternatieven → planning → termijnschema → voorwaarden → akkoord.
// Bron: calculatie-totalen + offerte-velden + bedrijf/branding. Geen mockdata.
import { jsPDF } from 'jspdf';
import { computeRow } from '@/lib/calc/werktafelTotals';
import { berekenKpi, termijnBedragen, optiesNetto } from '@/services/offerteExcellence';

const eur = (v) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(v) || 0);
const datNL = (d) => new Date(d || Date.now()).toLocaleDateString('nl-NL', { day: '2-digit', month: 'long', year: 'numeric' });
const n = (v) => (Number.isFinite(parseFloat(v)) ? parseFloat(v) : 0);

function rgb(hex, fb = [13, 27, 42]) {
  if (typeof hex !== 'string') return fb;
  const m = hex.replace('#', '');
  if (m.length !== 6) return fb;
  const r = parseInt(m.slice(0, 2), 16), g = parseInt(m.slice(2, 4), 16), b = parseInt(m.slice(4, 6), 16);
  return [r, g, b].every(Number.isFinite) ? [r, g, b] : fb;
}

async function loadImage(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const fmt = blob.type.includes('png') ? 'PNG' : 'JPEG';
    const dataUrl = await new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = () => resolve(null);
      fr.readAsDataURL(blob);
    });
    return dataUrl ? { dataUrl, fmt } : null;
  } catch {
    return null;
  }
}

function hoofdstukVerkoop(chapters, rows, bouwsom) {
  const perCh = new Map();
  for (const r of rows || []) {
    const cr = computeRow(r);
    const key = r.chapter_id || '__overig';
    perCh.set(key, (perCh.get(key) || 0) + (Number(cr.kostprijs) || 0));
  }
  const items = (chapters || []).map((c) => ({ naam: c.naam || c.code || 'Hoofdstuk', dk: perCh.get(c.id) || 0 }));
  if (perCh.has('__overig')) items.push({ naam: 'Overig', dk: perCh.get('__overig') });
  const totaalDk = items.reduce((s, i) => s + i.dk, 0) || 1;
  // schaal directe kosten naar de bouwsom (verkoop), zodat subtotalen optellen tot bouwsom
  return items.filter((i) => i.dk > 0).map((i) => ({ naam: i.naam, bedrag: (i.dk / totaalDk) * bouwsom }));
}

export async function genereerOffertePdf({ offerte, totalen, calculatie, chapters = [], rows = [], settings = {} }) {
  const bedrijf = settings.bedrijf || {};
  const branding = settings.branding || {};
  const cover = offerte?.cover || {};
  const accent = rgb(branding.kleur || branding.accent);
  const kpi = berekenKpi(offerte, totalen);
  const W = 210, H = 297, M = 18;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = 0;

  const need = (h) => { if (y + h > H - 22) { doc.addPage(); y = M; } };
  const sectie = (titel) => {
    need(16); y += 4;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(accent[0], accent[1], accent[2]);
    doc.text(titel, M, y); y += 2.5;
    doc.setDrawColor(accent[0], accent[1], accent[2]); doc.setLineWidth(0.5); doc.line(M, y, W - M, y); doc.setLineWidth(0.2);
    y += 7;
  };

  // ============ DEEL 1 — COVER ============
  const foto = cover.projectfoto ? await loadImage(cover.projectfoto) : null;
  if (foto) { try { doc.addImage(foto.dataUrl, foto.fmt, 0, 0, W, 150); } catch { /* skip */ } }
  else { doc.setFillColor(accent[0], accent[1], accent[2]); doc.rect(0, 0, W, 150, 'F'); }
  doc.setFillColor(accent[0], accent[1], accent[2]); doc.rect(0, 150, W, H - 150, 'F');
  doc.setTextColor(255);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text((bedrijf.naam || 'STRKBOUW').toUpperCase(), M, 168);
  doc.setFontSize(30); doc.text('OFFERTE', M, 184);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(15);
  doc.text(cover.projectnaam || calculatie?.naam || 'Bouwproject', M, 196);
  const coverRegels = [
    ['Opdrachtgever', offerte?.klant_naam || '—'],
    ['Locatie', offerte?.locatie || '—'],
    ['Offertenummer', `${offerte?.nummer || '—'}  ·  versie ${offerte?.versie || 1}`],
    ['Datum', datNL(offerte?.created_at)],
  ];
  let cy = 212;
  for (const [k, v] of coverRegels) {
    doc.setTextColor(160, 170, 180); doc.setFontSize(9); doc.text(k.toUpperCase(), M, cy);
    doc.setTextColor(255); doc.setFontSize(12); doc.text(String(v), M, cy + 5.5); cy += 14;
  }

  // ============ DEEL 2 — EXECUTIVE SUMMARY ============
  doc.addPage(); y = M;
  sectie('Managementoverzicht');
  const cards = [
    ['Investering (incl. btw)', eur(kpi.investering)],
    ['Bouwsom (excl. btw)', eur(kpi.bouwsom)],
    ['Oppervlakte', kpi.oppervlakte_m2 ? `${kpi.oppervlakte_m2} m²` : '—'],
    ['Bouwtijd', kpi.bouwtijd_weken ? `${kpi.bouwtijd_weken} weken` : '—'],
    ['Risico', eur(kpi.risico)],
    ['Marge', `${Math.round(kpi.marge_pct)}%`],
  ];
  const cardW = (W - 2 * M - 2 * 6) / 3, cardH = 26;
  cards.forEach((c, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = M + col * (cardW + 6), yy = y + row * (cardH + 6);
    doc.setFillColor(245, 247, 249); doc.roundedRect(x, yy, cardW, cardH, 2, 2, 'F');
    doc.setDrawColor(accent[0], accent[1], accent[2]); doc.setLineWidth(0.8); doc.line(x, yy, x, yy + cardH); doc.setLineWidth(0.2);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(120); doc.text(c[0].toUpperCase(), x + 4, yy + 8);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.setTextColor(25, 35, 45); doc.text(String(c[1]), x + 4, yy + 19);
  });
  y += 2 * cardH + 6 + 6;

  // ============ DEEL 3 — WERKZAAMHEDEN ============
  const hs = hoofdstukVerkoop(chapters, rows, kpi.bouwsom);
  if (hs.length) {
    sectie('Werkzaamheden');
    doc.setFontSize(9.5); doc.setTextColor(120); doc.text('Hoofdstuk', M, y); doc.text('Bedrag (excl. btw)', W - M, y, { align: 'right' });
    doc.setTextColor(40); y += 5;
    for (const h of hs) {
      need(7);
      doc.setFont('helvetica', 'normal'); doc.text(String(h.naam).slice(0, 60), M, y);
      doc.text(eur(h.bedrag), W - M, y, { align: 'right' }); y += 6;
    }
    need(8); doc.setDrawColor(220); doc.line(M, y, W - M, y); y += 6;
    doc.setFont('helvetica', 'bold'); doc.text('Bouwsom excl. btw', M, y); doc.text(eur(kpi.bouwsom), W - M, y, { align: 'right' }); y += 6;
  }

  // ============ DEEL 4 — OPTIES & ALTERNATIEVEN ============
  const opties = Array.isArray(offerte?.opties) ? offerte.opties : [];
  if (opties.length) {
    sectie('Opties & alternatieven');
    doc.setFontSize(9.5);
    for (const o of opties) {
      need(8);
      const teken = o.soort === 'min' ? '-' : '+';
      const on = !!o.geselecteerd;
      doc.setFont('helvetica', on ? 'bold' : 'normal');
      doc.setTextColor(on ? accent[0] : 40, on ? accent[1] : 40, on ? accent[2] : 40);
      doc.text(`${on ? '[x]' : '[ ]'} ${o.naam}${o.impact ? '  -  ' + o.impact : ''}`.slice(0, 70), M, y);
      doc.text(`${teken} ${eur(o.bedrag)}`, W - M, y, { align: 'right' }); y += 6;
    }
    const netto = optiesNetto(opties);
    if (netto) {
      need(7); doc.setDrawColor(220); doc.line(M, y, W - M, y); y += 6;
      doc.setFont('helvetica', 'bold'); doc.setTextColor(40);
      doc.text('Netto effect geselecteerde opties', M, y);
      doc.text((netto < 0 ? '-' : '+') + ' ' + eur(Math.abs(netto)), W - M, y, { align: 'right' }); y += 6;
    }
  }

  // ============ DEEL 5 — PLANNING ============
  const planning = (offerte?.planning && offerte.planning.length ? offerte.planning : []);
  if (planning.length) {
    sectie('Planning');
    const maxW = planning.reduce((m, f) => Math.max(m, n(f.weken)), 0) || 1;
    const barMax = W - 2 * M - 55;
    for (const f of planning) {
      need(9);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(40);
      doc.text(String(f.fase).slice(0, 22), M, y + 3.5);
      const bw = (n(f.weken) / maxW) * barMax;
      doc.setFillColor(accent[0], accent[1], accent[2]); doc.roundedRect(M + 45, y, Math.max(2, bw), 5, 1, 1, 'F');
      doc.setTextColor(120); doc.text(`${n(f.weken)} wk`, M + 45 + Math.max(2, bw) + 3, y + 4);
      y += 9;
    }
  }

  // ============ DEEL 6 — TERMIJNSCHEMA ============
  const termijnen = termijnBedragen(offerte?.termijnen, kpi.investering);
  if (termijnen.length) {
    sectie('Termijnschema');
    doc.setFontSize(9.5); doc.setTextColor(120);
    doc.text('Termijn', M, y); doc.text('%', W - M - 40, y, { align: 'right' }); doc.text('Bedrag (incl. btw)', W - M, y, { align: 'right' });
    doc.setTextColor(40); y += 5;
    for (const t of termijnen) {
      need(7); doc.setFont('helvetica', 'normal');
      doc.text(String(t.label).slice(0, 50), M, y);
      doc.text(`${n(t.pct)}%`, W - M - 40, y, { align: 'right' });
      doc.text(eur(t.bedrag), W - M, y, { align: 'right' }); y += 6;
    }
    need(7); doc.setDrawColor(220); doc.line(M, y, W - M, y); y += 6;
    doc.setFont('helvetica', 'bold'); doc.text('Totaal', M, y); doc.text(eur(kpi.investering), W - M, y, { align: 'right' }); y += 6;
  }

  // ============ DEEL 7 — VOORWAARDEN + AKKOORD ============
  sectie('Voorwaarden');
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(90);
  const vw = bedrijf.voorwaarden ||
    'Deze offerte is 30 dagen geldig. Bedragen excl. btw tenzij anders vermeld. Meer- en minderwerk wordt ' +
    'separaat verrekend. Uitvoering conform de actuele calculatie en STABU-systematiek. Termijnen worden ' +
    'gefactureerd bij het bereiken van de betreffende bouwfase.';
  const vlines = doc.splitTextToSize(vw, W - 2 * M);
  need(vlines.length * 4.5 + 4); doc.text(vlines, M, y); y += vlines.length * 4.5 + 6;

  need(26); doc.setDrawColor(220); doc.line(M, y, W - M, y); y += 7;
  doc.setFontSize(9); doc.setTextColor(110); doc.text('Voor akkoord (opdrachtgever):', M, y);
  if (offerte?.ondertekening?.naam || offerte?.getekend_at) {
    const ot = offerte.ondertekening || {};
    doc.setTextColor(20); doc.setFont('helvetica', 'bold');
    doc.text(`${ot.naam || offerte.klant_naam || ''} - digitaal getekend ${datNL(offerte.getekend_at)}${ot.tijd ? ' ' + ot.tijd : ''}`, M, y + 7);
    if (ot.ip) { doc.setFont('helvetica', 'normal'); doc.setTextColor(140); doc.setFontSize(8); doc.text(`Audittrail: IP ${ot.ip}`, M, y + 12); }
  } else {
    doc.line(M, y + 13, M + 70, y + 13); doc.text('Naam / handtekening', M, y + 17);
    doc.line(W - M - 60, y + 13, W - M, y + 13); doc.text('Datum', W - M - 60, y + 17);
  }

  // ---- Footer ----
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    if (i > 1) {
      doc.setFontSize(8); doc.setTextColor(150);
      const reg = [bedrijf.naam, bedrijf.kvk ? `KvK ${bedrijf.kvk}` : null, bedrijf.btw ? `BTW ${bedrijf.btw}` : null].filter(Boolean).join('  ·  ');
      doc.text(reg || 'STRKBOUW', M, H - 10); doc.text(`${i} / ${pages}`, W - M, H - 10, { align: 'right' });
    }
  }

  const naam = `Offerte_${offerte?.nummer || 'concept'}_v${offerte?.versie || 1}.pdf`.replace(/[^\w.\-]+/g, '_');
  doc.save(naam);
  return naam;
}
