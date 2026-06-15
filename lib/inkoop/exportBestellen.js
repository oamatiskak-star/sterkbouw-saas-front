// lib/inkoop/exportBestellen.js — Sprint 8 DEEL 8/9: leverancierspakket-export (PDF + Excel/CSV).
import { jsPDF } from 'jspdf';

const eur = (v) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(v) || 0);
const num = (v) => new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 2 }).format(Number(v) || 0);

// Eén leverancierspakket → PDF (DEEL 9: per leverancier één pakket, niet alles door elkaar).
export function leverancierspakketPdf({ pakket, calculatie }) {
  const W = 210, M = 16;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const accent = [13, 27, 42];
  doc.setFillColor(...accent); doc.rect(0, 0, W, 26, 'F');
  doc.setTextColor(255); doc.setFont('helvetica', 'bold'); doc.setFontSize(15);
  doc.text('BESTELBON', M, 12);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  doc.text(pakket.leverancier_naam || 'Leverancier', M, 20);
  doc.setFontSize(9); doc.text(`Project: ${calculatie?.naam || '-'}`, W - M, 12, { align: 'right' });
  if (pakket.gewenste_leverdatum) doc.text(`Gewenste levering: ${pakket.gewenste_leverdatum}`, W - M, 18, { align: 'right' });

  let y = 38;
  doc.setTextColor(120); doc.setFontSize(9);
  doc.text('Materiaal', M, y); doc.text('Aantal', W - M - 70, y, { align: 'right' }); doc.text('Fase', W - M - 40, y, { align: 'right' }); doc.text('Bedrag', W - M, y, { align: 'right' });
  doc.setTextColor(40); y += 2; doc.setDrawColor(220); doc.line(M, y, W - M, y); y += 5;
  for (const r of pakket.regels || []) {
    if (y > 275) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'normal'); doc.text(String(r.omschrijving).slice(0, 50), M, y);
    doc.text(`${num(r.hoeveelheid)} ${r.eenheid || ''}`, W - M - 70, y, { align: 'right' });
    doc.text(String(r.fase_label || '').slice(0, 14), W - M - 40, y, { align: 'right' });
    doc.text(eur(r.totaal), W - M, y, { align: 'right' }); y += 6;
  }
  y += 2; doc.setDrawColor(220); doc.line(M, y, W - M, y); y += 6;
  doc.setFont('helvetica', 'bold'); doc.text('Totaal (excl. btw)', M, y); doc.text(eur(pakket.totaal), W - M, y, { align: 'right' });
  doc.save(`Bestelbon_${(pakket.leverancier_naam || 'leverancier').replace(/[^\w]+/g, '_')}.pdf`);
}

// Alle voorstellen/regels → CSV (per fase/leverancier filterbaar in Excel).
export function bestellenCsv({ voorstellen, calculatie }) {
  const rows = [['Leverancier', 'Fase', 'Materiaal', 'Aantal', 'Eenheid', 'Stuksprijs', 'Bedrag', 'Gewenste leverdatum']];
  for (const v of voorstellen || []) {
    for (const r of v.regels || []) {
      rows.push([v.leverancier_naam, r.fase_label || '', r.omschrijving, num(r.hoeveelheid), r.eenheid || '', num(r.prijs), num(r.totaal), r.leverdatum || '']);
    }
  }
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `Inkoop_${(calculatie?.naam || 'project').replace(/[^\w]+/g, '_')}.csv`;
  a.click(); URL.revokeObjectURL(url);
}
