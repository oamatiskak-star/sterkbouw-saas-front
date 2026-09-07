import React, { useEffect, useRef, useState } from 'react';
import { Pen, RotateCcw, Save, X } from 'lucide-react';

const SignaturePad = ({ onSave, onCancel }) => {
  const canvasRef = useRef();
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [heeftGetekend, setHeeftGetekend] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#111827';
    setContext(ctx);
  }, []);

  // Canvas heeft een vaste bitmap-resolutie (width/height attributen) maar wordt CSS-responsive
  // weergegeven (w-full) — zonder deze schaalcorrectie tekent de pen op de verkeerde plek op elk
  // scherm smaller dan de bitmap (dus vrijwel elke telefoon).
  const naarCanvasCoordinaten = (clientX, clientY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const startDrawing = (e) => {
    if (!context) return;
    const { x, y } = naarCanvasCoordinaten(e.clientX, e.clientY);
    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || !context) return;
    const { x, y } = naarCanvasCoordinaten(e.clientX, e.clientY);
    context.lineTo(x, y);
    context.stroke();
    setHeeftGetekend(true);
  };

  const stopDrawing = () => {
    if (!context) return;
    context.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    context?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHeeftGetekend(false);
  };

  const saveSignature = () => {
    if (!heeftGetekend) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSave?.({ dataUrl, timestamp: new Date().toISOString() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold"><Pen size={20} /> Zet uw handtekening</h3>
          <button onClick={onCancel}><X size={24} /></button>
        </div>

        <div className="mb-4 touch-none rounded-lg border-2 border-dashed border-gray-300">
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="h-[300px] w-full touch-none cursor-crosshair sm:h-[400px]"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={(e) => { e.preventDefault(); startDrawing(e.touches[0]); }}
            onTouchMove={(e) => { e.preventDefault(); draw(e.touches[0]); }}
            onTouchEnd={(e) => { e.preventDefault(); stopDrawing(); }}
          />
        </div>

        <div className="flex justify-between">
          <button onClick={clearCanvas} type="button" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            <RotateCcw size={16} /> Wissen
          </button>
          <div className="flex gap-2">
            <button onClick={onCancel} type="button" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
              Annuleren
            </button>
            <button onClick={saveSignature} type="button" disabled={!heeftGetekend} className="inline-flex items-center gap-1.5 rounded-lg bg-sterkcalc-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
              <Save size={16} /> Opslaan
            </button>
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-500">Door te ondertekenen bevestigt u akkoord te gaan met deze offerte.</p>
      </div>
    </div>
  );
};

export default SignaturePad;
