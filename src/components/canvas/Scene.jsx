import { useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Grid } from "@react-three/drei";
import * as THREE from 'three';
import { analyzeNetImage } from "../../utils/SmartNetAnalyzer";
import { useToast } from "../../contexts/ToastContext";
import CustomCameraControls from "./CustomCameraControls";
import Box from "./Box";

function CanvasDropHandler({ setFacesConfig, setActiveNetId, setNetFlipX, setNetFlipY }) {
  const { camera, scene, raycaster } = useThree();
  const toast = useToast();

  useEffect(() => {
    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('image/')) {
        toast('กรุณาลากไฟล์รูปภาพเท่านั้น', 'error');
        return;
      }

      // Check if dropped on a face
      const rect = e.target.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      const mouse = new THREE.Vector2();
      mouse.x = (clientX / rect.width) * 2 - 1;
      mouse.y = -(clientY / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      const faceHit = intersects.find(hit => hit.object.userData && hit.object.userData.faceId);

      if (faceHit) {
        // Option 1: Dropped exactly on a face -> update that face's texture only
        const faceId = faceHit.object.userData.faceId;
        const imageUrl = URL.createObjectURL(file);
        setFacesConfig(prev => ({
          ...prev,
          [faceId]: { ...prev[faceId], textureUrl: imageUrl }
        }));
      } else {
        // Option 2: Dropped on background -> Try Smart Net Analysis
        try {
          // You could show a quick loading toast here
          const result = await analyzeNetImage(file);
          // Apply results
          setActiveNetId(result.activeNetId);
          setNetFlipX(result.netFlipX);
          setNetFlipY(result.netFlipY);

          setFacesConfig(prev => {
            const next = { ...prev };
            for (const face of ['top', 'bottom', 'left', 'right', 'front', 'back']) {
              if (result.extractedFaces[face]) {
                next[face] = { ...next[face], textureUrl: result.extractedFaces[face] };
              }
            }
            return next;
          });

          toast('✨ วิเคราะห์รูปคลี่สำเร็จ! กล่อง 3D พร้อมแล้ว', 'success');

        } catch (err) {
          toast('Smart Scan ไม่สามารถแกะแบบได้ — ลากรูปลงบนหน้ากล่องโดยตรงแทนได้เลย', 'error');
        }
      }
    };

    const canvasDOM = window.document.querySelector('canvas');
    if (canvasDOM) {
      canvasDOM.addEventListener('dragover', handleDragOver);
      canvasDOM.addEventListener('drop', handleDrop);
    }

    return () => {
      if (canvasDOM) {
        canvasDOM.removeEventListener('dragover', handleDragOver);
        canvasDOM.removeEventListener('drop', handleDrop);
      }
    };
  }, [camera, scene, raycaster, setFacesConfig, setActiveNetId, setNetFlipX, setNetFlipY]);

  return null;
}

export default function Scene({ children, theme, showGrid, showShadows, isAutoRotate, setFacesConfig, setActiveNetId, setNetFlipX, setNetFlipY }) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [8, 6, 9], fov: 45 }} shadows={showShadows} gl={{ preserveDrawingBuffer: true }}>
        {/* Environment and Lighting */}
        <color attach="background" args={[theme === 'dark' ? '#0f172a' : '#f8fafc']} />
        <ambientLight intensity={showShadows ? 0.5 : 1} />
        {showShadows && (
          <directionalLight
            position={[10, 10, 5]}
            intensity={1.5}
            castShadow
            shadow-mapSize={1024}
          />
        )}
        <Environment preset="city" />

        {setFacesConfig && (
          <CanvasDropHandler
            setFacesConfig={setFacesConfig}
            setActiveNetId={setActiveNetId}
            setNetFlipX={setNetFlipX}
            setNetFlipY={setNetFlipY}
          />
        )}

        {/* Scene Objects */}
        {children}

        {/* Floor and Grid */}
        {showGrid && (
          <Grid
            infiniteGrid
            fadeDistance={30}
            sectionThickness={1}
            cellThickness={0.5}
            sectionColor={theme === 'dark' ? "#334155" : "#cbd5e1"}
            cellColor={theme === 'dark' ? "#1e293b" : "#e2e8f0"}
            position={[0, -0.02, 0]}
          />
        )}

        {showShadows && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <shadowMaterial transparent opacity={0.4} />
          </mesh>
        )}

        {/* Controls — custom: 1-finger orbit, 2-finger trackball+zoom */}
        <CustomCameraControls
          target={[0, 2, 0]}
          minDistance={3}
          maxDistance={15}
          orbitSpeed={0.006}
          trackballSpeed={2.0}
        />
      </Canvas>
    </div>
  );
}
