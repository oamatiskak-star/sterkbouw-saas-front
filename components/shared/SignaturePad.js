import React, { useRef, useState } from 'react';
import { Pen, RotateCcw, Save, X } from 'lucide-react';

const SignaturePad = ({ onSave, onCancel }) => {
const canvasRef = useRef();
const [isDrawing, setIsDrawing] = useState(false);
const [context, setContext] = useState(null);

const initCanvas = () => {
const canvas = canvasRef.current;
const ctx = canvas.getContext('2d');
ctx.lineWidth = 2;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.strokeStyle = '#000';
setContext(ctx);
};

const startDrawing = (e) => {
const rect = canvasRef.current.getBoundingClientRect();
context.beginPath();
context.moveTo(e.clientX - rect.left, e.clientY - rect.top);
setIsDrawing(true);
};

const draw = (e) => {
if (!isDrawing) return;
const rect = canvasRef.current.getBoundingClientRect();
context.lineTo(e.clientX - rect.left, e.clientY - rect.top);
context.stroke();
};

const stopDrawing = () => {
context.closePath();
setIsDrawing(false);
};

const clearCanvas = () => {
context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
};

const saveSignature = () => {
const dataUrl = canvasRef.current.toDataURL('image/png');
onSave?.({
dataUrl,
timestamp: new Date().toISOString()
});
};

return (
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
<div className="bg-white rounded-lg p-6 w-full max-w-2xl">
<div className="flex justify-between items-center mb-4">
<h3 className="text-lg font-semibold flex items-center gap-2">
<Pen size={20} /> Sign Below
</h3>
<button onClick={onCancel}>
<X size={24} />
</button>
</div>

text
    <div className="border-2 border-dashed border-gray-300 rounded-lg mb-4">
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="w-full h-[400px] cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={(e) => {
          e.preventDefault();
          startDrawing(e.touches[0]);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          draw(e.touches[0]);
        }}
        onTouchEnd={stopDrawing}
      />
    </div>

    <div className="flex justify-between">
      <div className="flex gap-2">
        <button onClick={clearCanvas} className="btn-secondary">
          <RotateCcw size={18} /> Clear
        </button>
        <button onClick={initCanvas} className="btn-secondary">
          Reset Canvas
        </button>
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button onClick={saveSignature} className="btn-primary">
          <Save size={18} /> Save Signature
        </button>
      </div>
    </div>

    <p className="text-sm text-gray-500 mt-4">
      By signing, you acknowledge the accuracy of this inspection report.
    </p>
  </div>
</div>
);
};

export default SignaturePad;
