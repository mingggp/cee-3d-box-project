import { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Grid } from "@react-three/drei";
import Box from "./Box";

export default function Scene({ children, theme, showGrid, showShadows }) {
  const controlsRef = useRef();

  useEffect(() => {
    const handleReset = () => {
      controlsRef.current?.reset();
    };
    window.addEventListener('resetCamera', handleReset);
    return () => window.removeEventListener('resetCamera', handleReset);
  }, []);
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [5, 4, 5], fov: 45 }} shadows={showShadows} gl={{ preserveDrawingBuffer: true }}>
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

        {/* Controls */}
        <OrbitControls 
          ref={controlsRef}
          makeDefault 
          enableDamping={true}
          minPolarAngle={0} 
          maxPolarAngle={Math.PI} /* Allows viewing under the ground */
          minDistance={3}
          maxDistance={15}
        />
      </Canvas>
    </div>
  );
}
