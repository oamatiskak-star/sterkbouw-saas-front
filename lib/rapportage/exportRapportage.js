// lib/rapportage/exportRapportage.js — Sprint 9 DEEL 10: directierapport-export (PDF + Excel/CSV).
import { jsPDF } from 'jspdf';

const eur = (v) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(v) || 0);

export function directierapportPdf({ rapport, calculatie }) {
  const W = 210, M = 16;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const accent = [13, 27, 42];
  doc.setFillColor(...accent); doc.rect(0, 0, W, 24, 'F');
  doc.setTextColor(255); doc.setFont('helvetica', 'bold'); doc.setFontSize(15);
  doc.text('Directierapport', M, 14);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.text(calculatie?.naam || 'Project', W - M, 14, { align: 'right' });
  let y = 34;
  const k = rapport.kpi;
  const kpis = [['Verkoopwaarde', eur(k.verkoopwaarde)], ['Kostprijs', eur(k.kostprijs)], ['Brutomarge', `${eur(k.brutomarge)} (${k.marge_pct}%)`], ['Risico', eur(k.risico)], ['Besteld', eur(k.besteld)], ['Openstaand inkoop', eur(k.openstaand_inkoop)], ['Doorlooptijd', `${k.planning_weken} wk`], ['Oplevering', k.planning_eind || '—']];
  doc.setTextColor(40);
  kpis.forEach((c, i) => { const x = M + (i % 2) * 90; const yy = y + Math.floor(i / 2) * 9; doc.setFontSize(8); doc.setTextColor(120); doc.text(c[0], x, yy); doc.setFontSize(11); doc.setTextColor(30); doc.text(String(c[1]), x, yy + 5); });
  y += Math.ceil(kpis.length / 2) * 9 + 6;

  const sec = (t) => { doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(accent[0], accent[1], accent[2]); doc.text(t, M, y); y += 2; doc.setDrawColor(accent[0], accent[1], accent[2]); doc.line(M, y, W - M, y); y += 6; doc.setTextColor(40); doc.setFont('helvetica', 'normal'); };

  sec('Begroot / Actueel / Prognose');
  doc.setFontSize(9); doc.text('Soort', M, y); doc.text('Begroot', M + 80, y, { align: 'right' }); doc.text('Actueel', M + 120, y, { align: 'right' }); doc.text('Prognose', M + 160, y, { align: 'right' }); y += 5;
  for (const r of rapport.begroot_actueel_prognose) { if (y > 250) { doc.addPage(); y = 20; } doc.text(r.label, M, y); doc.text(eur(r.begroot), M + 80, y, { align: 'right' }); doc.text(r.actueel == null ? '—' : eur(r.actueel), M + 120, y, { align: 'right' }); doc.text(eur(r.prognose), M + 160, y, { align: 'right' }); y += 5.5; }
  y += 4;

  if (y > 230) { doc.addPage(); y = 20; }
  sec('Marge per hoofdstuk');
  for (const m of rapport.marge_hoofdstuk.slice(0, 14)) { if (y > 270) { doc.addPage(); y = 20; } doc.text(String(m.naam).slice(0, 40), M, y); doc.text(`${eur(m.marge)} (${m.margePct}%)`, W - M, y, { align: 'right' }); y += 5.5; }
  y += 4;

  if (rapport.ai_signalen.length) { if (y > 230) { doc.addPage(); y = 20; } sec('AI-signalen (advies)'); for (const a of rapport.ai_signalen) { if (y > 275) { doc.addPage(); y = 20; } const lines = doc.splitTextToSize(`• ${a.advies}`, W - 2 * M); doc.text(lines, M, y); y += lines.length * 4.5 + 1; } }

  doc.save(`Directierapport_${(calculatie?.naam || 'project').replace(/[^\w]+/g, '_')}.pdf`);
}

export function rapportageCsv({ rapport, calculatie }) {
  const rows = [['SterkCalc rapportage', calculatie?.naam || '']];
  rows.push([], ['KPI', 'Waarde']);
  Object.entries(rapport.kpi).forEach(([k, v]) => rows.push([k, v]));
  rows.push([], ['Kostensoort', 'Begroot', 'Actueel', 'Prognose']);
  rapport.begroot_actueel_prognose.forEach((r) => rows.push([r.label, r.begroot, r.actueel ?? '', r.prognose]));
  rows.push([], ['Hoofdstuk', 'Kostprijs', 'Verkoop', 'Marge', 'Marge%']);
  rapport.marge_hoofdstuk.forEach((m) => rows.push([m.naam, m.kostprijs, m.verkoop, m.marge, m.margePct]));
  rows.push([], ['Cashflow fase', 'Inkomst', 'Uitgave', 'Netto', 'Cumulatief']);
  rapport.cashflow.rijen.forEach((c) => rows.push([c.fase, c.inkomst, c.uitgave, c.netto, c.cumulatief]));
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `Rapportage_${(calculatie?.naam || 'project').replace(/[^\w]+/g, '_')}.csv`; a.click(); URL.revokeObjectURL(url);
}
