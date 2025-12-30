import React from 'react';
import { jsPDF } from 'jspdf';
import { FileText, Download } from 'lucide-react';
import { format } from 'date-fns';

const PDFGenerator = ({ data, title = 'Inspection Report' }) => {
const generatePDF = () => {
const doc = new jsPDF();
let yPos = 20;

text
// Header
doc.setFontSize(20);
doc.setTextColor(40, 40, 40);
doc.text(title, 20, yPos);
yPos += 15;

doc.setFontSize(10);
doc.setTextColor(100, 100, 100);
doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 20, yPos);
yPos += 20;

// Company Info
doc.setFontSize(12);
doc.setTextColor(0, 0, 0);
doc.text('Inspection Details:', 20, yPos);
yPos += 10;

doc.setFontSize(10);
Object.entries(data.metadata || {}).forEach(([key, value]) => {
  if (yPos > 270) {
    doc.addPage();
    yPos = 20;
  }
  doc.text(`${key}: ${value}`, 25, yPos);
  yPos += 7;
});

// Findings
if (data.findings?.length > 0) {
  yPos += 10;
  doc.setFontSize(12);
  doc.text('Findings:', 20, yPos);
  yPos += 10;

  doc.setFontSize(10);
  data.findings.forEach((finding, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(`${index + 1}. ${finding.title}`, 25, yPos);
    yPos += 5;
    doc.text(`   Status: ${finding.status}`, 25, yPos);
    yPos += 5;
    doc.text(`   Notes: ${finding.notes}`, 25, yPos);
    yPos += 10;
  });
}

// Photos
if (data.photos?.length > 0) {
  yPos += 10;
  doc.setFontSize(12);
  doc.text('Photos:', 20, yPos);
  yPos += 10;

  data.photos.forEach((photo, index) => {
    if (index < 3 && photo.dataUrl) {
      try {
        const img = new Image();
        img.src = photo.dataUrl;
        doc.addImage(img, 'JPEG', 25, yPos, 50, 30);
        yPos += 35;
      } catch (error) {
        console.error('Failed to add image:', error);
      }
    }
  });
}

// Signature
if (data.signature) {
  yPos += 10;
  doc.setFontSize(12);
  doc.text('Signature:', 20, yPos);
  yPos += 10;
  const sigImg = new Image();
  sigImg.src = data.signature.dataUrl;
  doc.addImage(sigImg, 'PNG', 25, yPos, 60, 20);
}

// Footer
const pageCount = doc.getNumberOfPages();
for (let i = 1; i <= pageCount; i++) {
  doc.setPage(i);
  doc.setFontSize(8);
  doc.text(`Page ${i} of ${pageCount}`, 105, 290, null, null, 'center');
}

doc.save(`${title.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
};

return (
<button onClick={generatePDF} className="btn-primary flex items-center gap-2" disabled={!data} >
<FileText size={18} />
<Download size={18} />
Generate PDF Report
</button>
);
};

export default PDFGenerator;
