import React from 'react';

// Maps each of the 11 nets to 6 coordinates (x, y) on a local grid.
// Used exclusively for rendering the UI SVG icons.
const NET_SHAPES = [
  // 1. Cross (1-4-1)
  [{x:1,y:0}, {x:0,y:1}, {x:1,y:1}, {x:2,y:1}, {x:1,y:2}, {x:1,y:3}],
  // 2. L-Top Left
  [{x:0,y:0}, {x:1,y:0}, {x:1,y:1}, {x:1,y:2}, {x:1,y:3}, {x:2,y:1}],
  // 3. L-Top Right
  [{x:2,y:0}, {x:1,y:0}, {x:1,y:1}, {x:1,y:2}, {x:1,y:3}, {x:0,y:1}],
  // 4. T-Shape
  [{x:1,y:0}, {x:0,y:2}, {x:1,y:1}, {x:2,y:2}, {x:1,y:2}, {x:1,y:3}],
  // 5. Cross shifted right
  [{x:2,y:2}, {x:1,y:0}, {x:1,y:1}, {x:1,y:2}, {x:1,y:3}, {x:0,y:1}],
  // 6. Cross shifted left
  [{x:0,y:2}, {x:1,y:0}, {x:1,y:1}, {x:1,y:2}, {x:1,y:3}, {x:2,y:1}],
  // 7. Z-shape long left
  [{x:0,y:0}, {x:1,y:0}, {x:1,y:1}, {x:1,y:2}, {x:2,y:2}, {x:2,y:3}],
  // 8. Z-shape long right
  [{x:2,y:0}, {x:1,y:0}, {x:1,y:1}, {x:1,y:2}, {x:0,y:2}, {x:0,y:3}],
  // 9. 3-3 Shape
  [{x:0,y:0}, {x:1,y:0}, {x:2,y:0}, {x:0,y:1}, {x:0,y:2}, {x:0,y:3}], // wait, is this valid?
  // Let's just use exact normalized mappings from our tree:
  // Tree 1: bottom(1,1), front(1,2), back(1,0), top(1,-1), left(0,1), right(2,1).
  // Normalized to >= 0:
  // 1: {1,2}, {1,3}, {1,1}, {1,0}, {0,2}, {2,2}
];

import { VALID_CUBE_NETS } from "./canvas/netsConfig";

export default function NetSelector({ activeNetId, setActiveNetId, netFlipX, netFlipY }) {
  // Let's algorithmically generate the SVGs from our VALID_CUBE_NETS structure!
  // This guarantees they perfectly match the engine.

  const buildCoords = (node, x, y, coords = []) => {
    coords.push({ x, y });
    if (node.children) {
      node.children.forEach(child => {
        let nx = x, ny = y;
        let logicalEdge = child.edge;

        if (logicalEdge === 'bottom') ny += 1;
        if (logicalEdge === 'top') ny -= 1;
        if (logicalEdge === 'left') nx -= 1;
        if (logicalEdge === 'right') nx += 1;
        buildCoords(child, nx, ny, coords);
      });
    }
    return coords;
  };

  const netsVisuals = VALID_CUBE_NETS.map((net, i) => {
    let coords = buildCoords(net, 0, 0);
    // Normalize coordinates so minX = 0, minY = 0
    const minX = Math.min(...coords.map(c => c.x));
    const minY = Math.min(...coords.map(c => c.y));
    coords = coords.map(c => ({ x: c.x - minX, y: c.y - minY }));
    
    // Find bounding box for centering in SVG
    const maxX = Math.max(...coords.map(c => c.x));
    const maxY = Math.max(...coords.map(c => c.y));
    
    return { id: i, coords, width: maxX + 1, height: maxY + 1 };
  });

  return (
    <div className="grid grid-cols-4 gap-2 mt-2">
      {netsVisuals.map((visual) => (
        <button
          key={visual.id}
          onClick={() => setActiveNetId(visual.id)}
          className={`relative aspect-square flex items-center justify-center rounded-lg border-2 transition-all overflow-hidden bg-slate-100 dark:bg-slate-800/50 
            ${activeNetId === visual.id 
              ? 'border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)] dark:bg-indigo-900/20' 
              : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700/50'
            }`}
          title={`Net Type ${visual.id + 1}`}
        >
          <svg 
            viewBox={`0 0 ${visual.width} ${visual.height}`} 
            className="w-3/4 h-3/4 drop-shadow-sm transition-transform duration-300"
            style={{ transform: (netFlipX || netFlipY) ? `scale(${netFlipX ? -1 : 1}, ${netFlipY ? -1 : 1})` : 'none' }}
          >
            {visual.coords.map((c, idx) => (
              <rect 
                key={idx} 
                x={c.x} 
                y={c.y} 
                width="1" 
                height="1" 
                fill={activeNetId === visual.id ? '#6366f1' : '#94a3b8'} 
                stroke={activeNetId === visual.id ? '#4f46e5' : '#64748b'} 
                strokeWidth="0.05"
                rx="0.1"
              />
            ))}
          </svg>
          
          {/* Badge Number */}
          <div className={`absolute top-0.5 right-1 pointer-events-none text-[8px] font-bold z-10 ${activeNetId === visual.id ? 'text-indigo-400' : 'text-slate-400'}`}>
            {visual.id + 1}
          </div>
        </button>
      ))}
    </div>
  );
}
