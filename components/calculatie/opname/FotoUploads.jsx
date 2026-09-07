// components/calculatie/opname/FotoUploads.jsx — foto's maken/kiezen op locatie (los van de
// handgetekende schetsen). Geen `capture`-attribuut op de file-input: zo toont iOS/iPadOS de
// keuze "Foto's / Neem foto / Kies bestand" i.p.v. alleen de camera te forceren.
// Upload gaat direct naar Supabase Storage (bucket calculatie-documenten, al publiek en in
// gebruik elders in de app) i.p.v. base64 in de rij — camera-foto's zijn te groot voor jsonb.
import { forwardRef, useImperativeHandle, useState } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import supabase from '@/lib/supabase';

const BUCKET = 'calculatie-documenten';

function veiligeNaam(naam) {
  return naam.replace(/[^a-zA-Z0-9._-]/g, '_');
}

const FotoUploads = forwardRef(function FotoUploads({ folderId, initialFotos = [] }, ref) {
  const [fotos, setFotos] = useState(initialFotos);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState(null);

  useImperativeHandle(ref, () => ({
    getFotos: () => fotos,
  }));

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    setBezig(true);
    setFout(null);
    try {
      const geupload = [];
      for (const file of files) {
        const path = `opnames/${folderId}/${Date.now()}-${veiligeNaam(file.name)}`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
        if (error) throw error;
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        geupload.push({ path, url: data.publicUrl, naam: file.name });
      }
      setFotos((f) => [...f, ...geupload]);
    } catch (err) {
      setFout(err?.message || 'Uploaden mislukt.');
    } finally {
      setBezig(false);
    }
  }

  function verwijder(path) {
    setFotos((f) => f.filter((foto) => foto.path !== path));
    supabase.storage.from(BUCKET).remove([path]).catch(() => {});
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-3">
        {fotos.map((foto) => (
          <div key={foto.path} className="group relative h-24 w-24 overflow-hidden rounded border border-gray-200 bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={foto.url} alt={foto.naam || 'Foto'} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => verwijder(foto.path)}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
              aria-label="Verwijder foto"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded border-[1.5px] border-dashed border-gray-400 bg-white px-4 py-3 text-sm font-semibold text-gray-900">
        {bezig ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
        {bezig ? 'Uploaden…' : "Foto's toevoegen"}
        <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} disabled={bezig} />
      </label>
      {fout && <p className="mt-2 text-sm text-red-600">{fout}</p>}
    </div>
  );
});

export default FotoUploads;
