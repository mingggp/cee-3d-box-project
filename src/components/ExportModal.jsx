import React, { useState } from 'react';
import { Download, X, ZoomIn, ZoomOut, RotateCw, RotateCcw, Move } from 'lucide-react';

export default function ExportModal({ imageUrl, exportImageBlob, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const src = imageUrl || exportImageBlob; // fallback compat

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    // Note: Creating a merged canvas of the adjustments is possible, 
    // but standard exporting usually prefers the pristine WebGL snapshot.
    // If we want to bake the transforms, we'd draw it to an offscreen canvas here.
    // Since the prompt asks to "ซูม หมุน ย่อขยาย/เลื่อน ... มีปุ่มบันทึกรูปที่ปรับแต่งแล้ว",
    // we should bake the transform into a final PNG!
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.src = src;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Move to center
      ctx.translate(canvas.width / 2, canvas.height / 2);
      
      // Apply UI Transforms
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);
      ctx.rotate(rotation * (Math.PI / 180));
      
      // Draw centered
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      
      const finalImage = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = finalImage;
      link.download = "my-geometry-box.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      onClose();
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Move className="text-indigo-400" size={20} />
            Export Studio View
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Studio Canvas Area */}
        <div className="flex-1 relative overflow-hidden bg-slate-950 flex items-center justify-center checkered-bg">
          <div 
            className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing flex items-center justify-center"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img 
              src={src} 
              alt="Snapshot" 
              draggable={false}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
              }}
              className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Toolbar Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-4">
          
          {/* Zoom Controls */}
          <div className="flex items-center gap-3 bg-slate-800 p-1.5 rounded-lg border border-slate-700">
            <button onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors">
              <ZoomOut size={18} />
            </button>
            <span className="text-sm font-mono text-slate-300 w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(Math.min(5, zoom + 0.1))} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors">
              <ZoomIn size={18} />
            </button>
          </div>

          {/* Rotate Controls */}
          <div className="flex items-center gap-3 bg-slate-800 p-1.5 rounded-lg border border-slate-700">
            <button onClick={() => setRotation(r => r - 15)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors">
              <RotateCcw size={18} />
            </button>
            <span className="text-sm font-mono text-slate-300 w-12 text-center">{rotation}°</span>
            <button onClick={() => setRotation(r => r + 15)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors">
              <RotateCw size={18} />
            </button>
            <button onClick={() => { setZoom(1); setRotation(0); setPan({x:0, y:0}); }} className="px-3 text-xs text-indigo-400 font-medium hover:text-indigo-300 border-l border-slate-700 ml-1">
              Reset
            </button>
          </div>

          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-indigo-500/25 transition-all ml-auto"
          >
            <Download size={18} />
            Confirm Download
          </button>
        </div>
        
      </div>
      
      {/* Required for the checkered background pattern so transparent snaps look authentic */}
      <style>{`
        .checkered-bg {
          background-image: 
            linear-gradient(45deg, #1e293b 25%, transparent 25%), 
            linear-gradient(-45deg, #1e293b 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #1e293b 75%), 
            linear-gradient(-45deg, transparent 75%, #1e293b 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
      `}</style>
    </div>
  );
}
