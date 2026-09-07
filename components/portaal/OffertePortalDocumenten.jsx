// components/portaal/OffertePortalDocumenten.jsx — bijlagen die de klant zelf kan inzien/
// downloaden (bijv. besteklijst, plattegrondvoorstel), los van de gegenereerde offerte-PDF.
import { FileText, FileSpreadsheet, Download } from 'lucide-react';

function iconVoor(bestandsnaam = '') {
  return /\.(xlsx|xls|csv)$/i.test(bestandsnaam) ? FileSpreadsheet : FileText;
}

export default function OffertePortalDocumenten({ documenten }) {
  const items = Array.isArray(documenten) ? documenten.filter((d) => d?.url) : [];
  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-5xl px-6 py-4 sm:px-8">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-bold text-gray-900">Documenten</h2>
        <p className="mt-1 text-sm text-gray-500">Bijlagen bij deze offerte, direct te bekijken of downloaden.</p>
        <div className="mt-4 space-y-2">
          {items.map((d, i) => {
            const Icon = iconVoor(d.titel || d.url);
            return (
              <a key={i} href={d.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 [color-scheme:light] hover:border-sterkcalc-gold/40 hover:bg-sterkcalc-gold/5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sterkcalc-navy/5 text-sterkcalc-navy"><Icon size={18} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-gray-800">{d.titel || 'Document'}</span>
                  {d.beschrijving && <span className="block truncate text-xs text-gray-400">{d.beschrijving}</span>}
                </span>
                <Download size={16} className="shrink-0 text-gray-400" />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
