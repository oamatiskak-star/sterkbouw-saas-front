// components/portaal/OffertePortalOntwerp.jsx — ontwerpafbeeldingen/plattegrondvoorstellen
// (cover.ontwerpAfbeeldingen), al aanwezig in de offerte-PDF maar tot nu toe niet zichtbaar
// in het klantportaal. Toont per afbeelding de titel en de verplichte "ter illustratie"-
// toelichting, zodat de klant nooit een render voor het definitieve resultaat aanziet.
export default function OffertePortalOntwerp({ ontwerpAfbeeldingen }) {
  const items = Array.isArray(ontwerpAfbeeldingen) ? ontwerpAfbeeldingen.filter((o) => o?.url) : [];
  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-5xl px-6 py-4 sm:px-8">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-bold text-gray-900">Ontwerp</h2>
        <p className="mt-1 text-sm text-gray-500">Plattegrondvoorstellen en visualisaties bij deze offerte.</p>
        <div className="mt-4 space-y-6">
          {items.map((item, i) => (
            <figure key={i} className="overflow-hidden rounded-xl border border-gray-100">
              <img src={item.url} alt={item.titel || 'Ontwerpvoorstel'} className="w-full object-cover" />
              <figcaption className="space-y-1 bg-gray-50 p-4">
                {item.titel && <div className="text-sm font-semibold text-gray-800">{item.titel}</div>}
                {item.beschrijving && <div className="text-xs text-gray-500">{item.beschrijving}</div>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
