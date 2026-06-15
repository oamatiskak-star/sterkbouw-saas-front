// lib/planning/exportPlanning.js — Sprint 7 DEEL 9: planning exporteren naar PDF en Excel (CSV).
import { jsPDF } from 'jspdf';

const datNL = (d) => (d ? new Date(d).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

export function planningNaarPdf({ planning, calculatie }) {
  const { fases = [], samenvatting = {}, config = {} } = planning || {};
  const W = 297, H = 210, M = 14; // A4 landscape voor gantt
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
  const accent = [13, 27, 42];
  doc.setFillColor(...accent); doc.rect(0, 0, W, 20, 'F');
  doc.setTextColor(255); doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
  doc.text(`Planning — ${calculatie?.naam || 'Project'}`, M, 13);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  doc.text(`${config.projecttype || ''} · ${samenvatting.totaal_weken || 0} weken · ${datNL(samenvatting.start_datum)} – ${datNL(samenvatting.eind_datum)}`, W - M, 13, { align: 'right' });

  let y = 30;
  const labelW = 55, ganttX = M + labelW, ganttW = W - M - labelW - M;
  const totDagen = Math.max(1, samenvatting.totaal_dagen || 1);
  doc.setTextColor(40); doc.setFontSize(9);
  for (const f of fases) {
    doc.setFont('helvetica', 'normal'); doc.setTextColor(40);
    doc.text(`${f.label} (${f.duur_dagen}d)`, M, y + 3.5);
    doc.setFillColor(235, 238, 241); doc.rect(ganttX, y, ganttW, 5, 'F');
    const x = ganttX + (f.start_dag / totDagen) * ganttW;
    const bw = Math.max(1.5, (f.duur_dagen / totDagen) * ganttW);
    doc.setFillColor(0, 182, 122); doc.rect(x, y, bw, 5, 'F');
    doc.setFontSize(7); doc.setTextColor(120); doc.text(`${datNL(f.start_datum)}`, x, y + 9);
    doc.setFontSize(9);
    y += 13;
    if (y > H - 20) { doc.addPage(); y = 20; }
  }

  doc.setDrawColor(220); doc.line(M, y, W - M, y); y += 7;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
  doc.text(`Totaal: ${samenvatting.totaal_uren || 0} uur · ${samenvatting.totaal_dagen || 0} werkdagen · ${samenvatting.totaal_weken || 0} weken · capaciteit ${samenvatting.capaciteit_per_dag || 0} u/dag`, M, y);
  doc.save(`Planning_${(calculatie?.naam || 'project').replace(/[^\w]+/g, '_')}.pdf`);
}

export function planningNaarCsv({ planning, calculatie }) {
  const { fases = [] } = planning || {};
  const rows = [['Fase', 'Uren', 'Duur (werkdagen)', 'Start', 'Eind', 'Materialen']];
  for (const f of fases) {
    rows.push([f.label, f.uren, f.duur_dagen, f.start_datum || '', f.eind_datum || '', (f.materialen || []).map((m) => `${m.omschrijving} ${m.hoeveelheid}${m.eenheid}`).join('; ')]);
  }
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `Planning_${(calculatie?.naam || 'project').replace(/[^\w]+/g, '_')}.csv`;
  a.click(); URL.revokeObjectURL(url);
}
