import { VALID_CUBE_NETS } from "../components/canvas/netsConfig";

// Generate 2D signatures for the 11 valid nets automatically
function generateNetSignatures() {
  const signatures = [];

  VALID_CUBE_NETS.forEach((net, index) => {
    // Generate base points
    const points = [];
    const traverse = (node, x, y) => {
      points.push({ id: node.id, x, y });
      if (node.children) {
        node.children.forEach(child => {
          let nx = x, ny = y;
          if (child.edge === 'top') ny -= 1;
          else if (child.edge === 'bottom') ny += 1;
          else if (child.edge === 'left') nx -= 1;
          else if (child.edge === 'right') nx += 1;
          traverse(child, nx, ny);
        });
      }
    };
    traverse(net, 0, 0);

    // Normalize
    const minX = Math.min(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    points.forEach(p => { p.x -= minX; p.y -= minY; });

    const width = Math.max(...points.map(p => p.x)) + 1;
    const height = Math.max(...points.map(p => p.y)) + 1;

    // Generate 8 transformations (4 rotations x 2 flips)
    const transforms = [];
    
    // We'll keep it simple: generate flipX, flipY, and transposed (swap x/y).
    // This covers all 8 combinations.
    for (let flipX of [false, true]) {
      for (let flipY of [false, true]) {
        for (let swapXY of [false, true]) {
          const tPoints = points.map(p => {
            let px = flipX ? (width - 1 - p.x) : p.x;
            let py = flipY ? (height - 1 - p.y) : p.y;
            return swapXY ? { id: p.id, x: py, y: px } : { id: p.id, x: px, y: py };
          });
          
          const tW = swapXY ? height : width;
          const tH = swapXY ? width : height;

          // Build string signature e.g., "1100,0110..."
          let sig = "";
          for (let y = 0; y < tH; y++) {
            for (let x = 0; x < tW; x++) {
              sig += tPoints.some(p => p.x === x && p.y === y) ? "1" : "0";
            }
            sig += ",";
          }
          sig = sig.slice(0, -1);

          // Check if already added
          if (!transforms.find(t => t.sig === sig)) {
            transforms.push({ sig, points: tPoints, columns: tW, rows: tH, flipX, flipY, swapXY });
          }
        }
      }
    }

    signatures.push({ index, transforms });
  });

  return signatures;
}

const NET_SIGNATURES = generateNetSignatures();

export async function analyzeNetImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // 1. Establish Background Color from corners
      const corners = [
        0, (canvas.width - 1) * 4, 
        (canvas.height - 1) * canvas.width * 4, 
        ((canvas.height - 1) * canvas.width + canvas.width - 1) * 4
      ];
      let bgR = 0, bgG = 0, bgB = 0;
      corners.forEach(idx => {
        bgR += data[idx]; bgG += data[idx+1]; bgB += data[idx+2];
      });
      bgR /= 4; bgG /= 4; bgB /= 4;

      const tolerance = 40; // color distance threshold
      const mask = new Int8Array(canvas.width * canvas.height); // 0=bg, 1=line, -1=outside

      // 2. Classify foreground (lines) vs background
      for (let i = 0; i < canvas.width * canvas.height; i++) {
        const idx = i * 4;
        const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
        const dist = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
        if (a > 50 && dist > tolerance) {
          mask[i] = 1; // foreground / line
        }
      }

      // 3. Flood fill from borders to mark OUTSIDE (-1)
      const q = [];
      const addQueue = (x, y) => {
        if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
          const i = y * canvas.width + x;
          if (mask[i] === 0) {
            mask[i] = -1;
            q.push(x, y);
          }
        }
      };

      // Add all border pixels
      for (let x = 0; x < canvas.width; x++) { addQueue(x, 0); addQueue(x, canvas.height - 1); }
      for (let y = 0; y < canvas.height; y++) { addQueue(0, y); addQueue(canvas.width - 1, y); }

      let qIter = 0;
      while (qIter < q.length) {
        const x = q[qIter++];
        const y = q[qIter++];
        addQueue(x+1, y); addQueue(x-1, y);
        addQueue(x, y+1); addQueue(x, y-1);
      }

      // 4. Find Bounding Box of INSIDE (mask !== -1)
      let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = y * canvas.width + x;
          if (mask[i] !== -1) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (minX > maxX || minY > maxY) {
        return reject(new Error("ไม่พบรูปทรงในภาพ (No shape detected)."));
      }

      const bboxWidth = maxX - minX + 1;
      const bboxHeight = maxY - minY + 1;

      // 5. Guess grid array based on best cell squareness
      let bestCols = 1, bestRows = 1;
      let minDiff = Infinity;
      for (let c = 1; c <= 5; c++) {
        for (let r = 1; r <= 5; r++) {
          if (c * r < 6) continue;
          const cellW = bboxWidth / c;
          const cellH = bboxHeight / r;
          const diff = Math.abs(cellW - cellH);
          if (diff < minDiff) {
            minDiff = diff;
            bestCols = c;
            bestRows = r;
          }
        }
      }

      const cellW = bboxWidth / bestCols;
      const cellH = bboxHeight / bestRows;

      // 6. Generate Signature
      let detectedSig = "";
      let filledCellsCount = 0;

      for (let r = 0; r < bestRows; r++) {
        for (let c = 0; c < bestCols; c++) {
          let insideCount = 0;
          let totalCount = 0;
          
          const startX = Math.floor(minX + c * cellW);
          const startY = Math.floor(minY + r * cellH);
          const endX = Math.floor(startX + cellW);
          const endY = Math.floor(startY + cellH);

          // Sub-sample cell with a margin to avoid border overlaps
          const marginX = Math.floor(cellW * 0.2);
          const marginY = Math.floor(cellH * 0.2);

          for (let y = startY + marginY; y < endY - marginY; y++) {
            for (let x = startX + marginX; x < endX - marginX; x++) {
              if (y >= 0 && y < canvas.height && x >= 0 && x < canvas.width) {
                if (mask[y * canvas.width + x] !== -1) {
                  insideCount++;
                }
                totalCount++;
              }
            }
          }

          if (totalCount > 0 && (insideCount / totalCount) > 0.4) {
            detectedSig += "1";
            filledCellsCount++;
          } else {
            detectedSig += "0";
          }
        }
        detectedSig += ",";
      }
      detectedSig = detectedSig.slice(0, -1);

      if (filledCellsCount !== 6) {
        return reject(new Error(`เราตรวจพบกล่องสี่เหลี่ยมจำนวน ${filledCellsCount} ชิ้น (ต้องมี 6 ชิ้นพอดีจึงจะเป็นรูปคลี่ลูกบาศก์ที่สมบูรณ์) แนะนำให้ใช้รูปพื้นหลังสว่างๆ ที่เห็นเส้นชัดเจนครับ`));
      }

      // Match against known signatures
      let matchedNetIndex = -1;
      let matchedTransform = null;

      for (const net of NET_SIGNATURES) {
        for (const transform of net.transforms) {
          if (transform.sig === detectedSig) {
            matchedNetIndex = net.index;
            matchedTransform = transform;
            break;
          }
        }
        if (matchedNetIndex !== -1) break;
      }

      if (matchedNetIndex === -1) {
        return reject(new Error("Net pattern recognized, but it is not one of the 11 valid folding cube hexominoes."));
      }

      // We found a match! Slice the textures for each of the 6 faces!
      const extractedFaces = {};
      
      matchedTransform.points.forEach(point => {
        const sx = minX + point.x * cellW;
        const sy = minY + point.y * cellH;
        
        const faceCanvas = document.createElement("canvas");
        const size = Math.max(cellW, cellH);
        faceCanvas.width = 512;
        faceCanvas.height = 512;
        const fCtx = faceCanvas.getContext("2d");
        
        fCtx.imageSmoothingEnabled = true;
        fCtx.imageSmoothingQuality = 'high';
        
        fCtx.fillStyle = '#ffffff';
        fCtx.fillRect(0, 0, 512, 512);

        fCtx.save();
        if (matchedTransform.swapXY) {
          fCtx.translate(256, 256);
          fCtx.transform(0, 1, 1, 0, 0, 0); // Transpose the canvas
          fCtx.translate(-256, -256);
        }

        fCtx.drawImage(
          canvas, 
          sx, sy, cellW, cellH, 
          0, 0, 512, 512
        );
        fCtx.restore();

        extractedFaces[point.id] = faceCanvas.toDataURL("image/png");
      });

      resolve({
        activeNetId: matchedNetIndex,
        extractedFaces, // { front: dataUrl, top: dataUrl, ... }
        // We will assume logical coordinates are just mapped, we don't need to change netFlipX/Y 
        // since our mapping algorithm directly matched the absolute positions! Wait, if the user rotates the 3D model, 
        // flipping might be needed for the 3D mesh structure to match visually, but mapping 
        // the faces to the semantic logical IDs guarantees the textures go to the right places.
        // However, if the net form is flipped horizontally from base, activeNetId doesn't track flips.
        // The 3D engine uses netFlipX/Y. We should pass them.
        netFlipX: matchedTransform.flipX,
        netFlipY: matchedTransform.flipY,
        swapXY: matchedTransform.swapXY
      });
      
    };
    img.onerror = () => reject(new Error("Failed to read image file."));
    img.src = URL.createObjectURL(file);
  });
}
