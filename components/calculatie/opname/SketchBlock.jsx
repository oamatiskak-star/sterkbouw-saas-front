// components/calculatie/opname/SketchBlock.jsx — één tekenvlak (canvas) voor het opnameformulier.
// Poort van de bewezen vanilla-JS tekenmodule (Opnameformulier.html) naar React: Pointer Events
// (vinger + Apple Pencil, incl. druk), kleur/dikte-toolbar, ongedaan maken, wissen.
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Undo2, Eraser } from 'lucide-react';

const KLEUREN = [
  { hex: '#0a0a0a', label: 'Zwart' },
  { hex: '#c0392b', label: 'Rood' },
  { hex: '#1a7f37', label: 'Groen' },
  { hex: '#1f6feb', label: 'Blauw' },
];
const DIKTES = [
  { waarde: 1.5, label: 'Dun', bol: 4 },
  { waarde: 3, label: 'Normaal', bol: 7 },
  { waarde: 6, label: 'Dik', bol: 11 },
];
const MAX_HISTORY = 20;

const SketchBlock = forwardRef(function SketchBlock({ titel, initialImage = null, onRemove }, ref) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const historyRef = useRef([]);
  const hasDrawingRef = useRef(!!initialImage);
  const drawingRef = useRef(false);
  const lastRef = useRef({ x: 0, y: 0 });
  const [color, setColor] = useState(KLEUREN[0].hex);
  const [width, setWidth] = useState(DIKTES[1].waarde);

  useImperativeHandle(ref, () => ({
    getDataUrl: () => (hasDrawingRef.current ? canvasRef.current.toDataURL('image/png') : null),
    hasDrawing: () => hasDrawingRef.current,
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctxRef.current = ctx;

    function drawImageOnto(dataUrl) {
      const rect = canvas.getBoundingClientRect();
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = dataUrl;
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      const prev = hasDrawingRef.current ? canvas.toDataURL('image/png') : null;
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (prev) drawImageOnto(prev);
    }
    resize();
    if (initialImage) drawImageOnto(initialImage);

    const onWindowResize = () => resize();
    window.addEventListener('resize', onWindowResize);
    return () => window.removeEventListener('resize', onWindowResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function point(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
  function pushHistory() {
    historyRef.current.push(canvasRef.current.toDataURL('image/png'));
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
  }

  function handlePointerDown(e) {
    drawingRef.current = true;
    pushHistory();
    const p = point(e);
    lastRef.current = p;
    canvasRef.current.setPointerCapture(e.pointerId);
  }
  function handlePointerMove(e) {
    if (!drawingRef.current) return;
    const p = point(e);
    const pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.5;
    const ctx = ctxRef.current;
    ctx.strokeStyle = color;
    ctx.lineWidth = width * (0.6 + pressure);
    ctx.beginPath();
    ctx.moveTo(lastRef.current.x, lastRef.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastRef.current = p;
    hasDrawingRef.current = true;
  }
  function stopDrawing() {
    drawingRef.current = false;
  }

  function handleClear() {
    pushHistory();
    const rect = canvasRef.current.getBoundingClientRect();
    ctxRef.current.clearRect(0, 0, rect.width, rect.height);
    hasDrawingRef.current = false;
  }
  function handleUndo() {
    const rect = canvasRef.current.getBoundingClientRect();
    ctxRef.current.clearRect(0, 0, rect.width, rect.height);
    const prev = historyRef.current.pop();
    if (prev) {
      const img = new Image();
      img.onload = () => ctxRef.current.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = prev;
      hasDrawingRef.current = true;
    } else {
      hasDrawingRef.current = false;
    }
  }

  return (
    <div className="mb-5 border-b border-dashed border-gray-200 pb-4 last:mb-0 last:border-b-0 last:pb-0">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-gray-500">{titel}</span>
        {onRemove && (
          <button type="button" onClick={onRemove} className="text-xs font-semibold text-gray-500 underline">
            Verwijderen
          </button>
        )}
      </div>
      <div className="mb-2.5 flex flex-wrap items-center gap-3.5">
        <div className="flex items-center gap-1.5">
          <span className="mr-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Kleur</span>
          {KLEUREN.map((k) => (
            <button
              key={k.hex}
              type="button"
              aria-label={k.label}
              onClick={() => setColor(k.hex)}
              className="h-[26px] w-[26px] rounded-full border-2 p-0"
              style={{ background: k.hex, borderColor: color === k.hex ? '#0a0a0a' : 'transparent' }}
            />
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="mr-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Dikte</span>
          {DIKTES.map((d) => (
            <button
              key={d.waarde}
              type="button"
              aria-label={d.label}
              onClick={() => setWidth(d.waarde)}
              className="flex h-[30px] w-[30px] items-center justify-center rounded border"
              style={{ borderColor: width === d.waarde ? '#e8c84b' : '#e0e0de', background: width === d.waarde ? '#fdf6e0' : '#fff' }}
            >
              <span className="block rounded-full bg-black" style={{ width: d.bol, height: d.bol }} />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={handleUndo} className="inline-flex items-center gap-1 rounded border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-800">
            <Undo2 size={13} /> Ongedaan maken
          </button>
          <button type="button" onClick={handleClear} className="inline-flex items-center gap-1 rounded border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-800">
            <Eraser size={13} /> Wis tekening
          </button>
        </div>
      </div>
      <div
        className="overflow-hidden rounded border border-gray-200"
        style={{
          touchAction: 'none',
          backgroundImage:
            'repeating-linear-gradient(0deg, #e0e0de 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, #e0e0de 0 1px, transparent 1px 24px)',
          backgroundColor: '#fff',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ display: 'block', width: '100%', height: 420, touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onPointerLeave={stopDrawing}
        />
      </div>
    </div>
  );
});

export default SketchBlock;
