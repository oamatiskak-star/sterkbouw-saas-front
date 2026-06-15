// lib/calc/documentControle.js — P7.8 documentcontrole (fase 2.1).
// Heuristische classificatie van geüploade tekeningen op bestandsnaam: welke essentiële
// tekeningtypes zijn aanwezig en welke ontbreken. Pure functie; signaleert alleen.

// De tekeningtypes die een calculator nodig heeft voor een volledige opname.
export const TEKENINGTYPES = [
  { key: 'begane_grond', label: 'Plattegrond begane grond', match: /(begane.?grond|\bbg\b|bgg|plattegrond.*(bg|0)|\b0e\b|\bbegane\b)/i },
  { key: 'verdieping', label: 'Plattegrond verdieping(en)', match: /(verdieping|\b1e\b|\b2e\b|etage|\bvd\b|1ste|2de|zolder|kap)/i },
  { key: 'doorsnede', label: 'Doorsneden', match: /(doorsnede|dwarsdoorsnede|langsdoorsnede|\bsnede\b|sectie|aa|bb)/i },
  { key: 'gevel', label: 'Gevelaanzichten', match: /(gevel|aanzicht|facade|voorgevel|achtergevel|zijgevel)/i },
  { key: 'situatie', label: 'Situatietekening', match: /(situatie|situering|kavel|terreintekening|overzichtstekening|ligging)/i },
];

const naamVan = (d) => `${d?.file_name || ''}`;

// Classificeert het dossier. Geeft per tekeningtype aanwezig + (eerste) matchende bestandsnaam.
export function controleerDocumenten(docs = []) {
  const tekeningen = (docs || []).filter((d) => {
    const t = (d.document_type || '').toLowerCase();
    return t.includes('tekening') || t.includes('constructie') || /\.(pdf|dwg|dxf|ifc|png|jpe?g)$/i.test(naamVan(d));
  });
  const resultaat = TEKENINGTYPES.map((tt) => {
    const hit = tekeningen.find((d) => tt.match.test(naamVan(d)));
    return { key: tt.key, label: tt.label, aanwezig: !!hit, bestand: hit?.file_name || null };
  });
  const ontbrekend = resultaat.filter((r) => !r.aanwezig);
  return {
    aantalTekeningen: tekeningen.length,
    resultaat,
    ontbrekend,
    compleet: ontbrekend.length === 0 && tekeningen.length > 0,
  };
}
