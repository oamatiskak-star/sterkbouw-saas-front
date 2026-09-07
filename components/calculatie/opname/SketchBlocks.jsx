// components/calculatie/opname/SketchBlocks.jsx — beheert 1..n schetsvlakken.
// `initialImages` (bij bewerken van een bestaande opname) worden geladen als startpunt
// per blok, zodat een eerder getekende schets verder aangepast kan worden.
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import SketchBlock from './SketchBlock';

let volgendId = 1;

const SketchBlocks = forwardRef(function SketchBlocks({ initialImages = [] }, ref) {
  const [blokken, setBlokken] = useState(() => {
    const eerste = initialImages.length ? initialImages.map((img) => ({ id: volgendId++, image: img })) : [{ id: volgendId++, image: null }];
    return eerste;
  });
  const blokRefs = useRef({});

  useImperativeHandle(ref, () => ({
    getAllDataUrls: () =>
      blokken
        .map((b) => blokRefs.current[b.id]?.getDataUrl())
        .filter(Boolean),
  }));

  function voegToe() {
    setBlokken((prev) => [...prev, { id: volgendId++, image: null }]);
  }
  function verwijder(id) {
    setBlokken((prev) => prev.filter((b) => b.id !== id));
    delete blokRefs.current[id];
  }

  return (
    <div>
      {blokken.map((b, i) => (
        <SketchBlock
          key={b.id}
          ref={(el) => { blokRefs.current[b.id] = el; }}
          titel={`Schets ${i + 1}`}
          initialImage={b.image}
          onRemove={blokken.length > 1 ? () => verwijder(b.id) : undefined}
        />
      ))}
      <button
        type="button"
        onClick={voegToe}
        className="mt-3.5 w-full rounded border border-dashed border-gray-400 bg-transparent py-2.5 text-sm font-bold text-gray-900"
      >
        + Nog een tekenvlak toevoegen
      </button>
      <p className="mt-2 text-xs text-gray-500">
        Optioneel — teken met de vinger of Apple Pencil een schets met maatvoering. Voeg meerdere vlakken toe als je tijdens één bezoek meerdere situaties opneemt.
      </p>
    </div>
  );
});

export default SketchBlocks;
