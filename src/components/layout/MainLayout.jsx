import Sidebar from "./Sidebar";
import { Focus } from "lucide-react";

export default function MainLayout({ children, foldProgress, setFoldProgress, facesConfig, setFacesConfig, selectedFace, setSelectedFace, theme, setTheme, showGrid, setShowGrid, showShadows, setShowShadows, activeNetId, setActiveNetId, netFlipX, setNetFlipX, netFlipY, setNetFlipY, setShowExportModal, setExportImageBlob, setShowAuthModal, setShowGalleryModal }) {
  const handleResetCamera = () => {
    window.dispatchEvent(new CustomEvent('resetCamera'));
  };

  return (
    <div className={`${theme} w-full h-full`}>
      <div className="flex h-screen w-full overflow-hidden transition-colors bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 font-sans">
        {/* Sidebar Section */}
        <Sidebar 
          foldProgress={foldProgress} 
          setFoldProgress={setFoldProgress} 
          facesConfig={facesConfig}
          setFacesConfig={setFacesConfig}
          selectedFace={selectedFace}
          setSelectedFace={setSelectedFace}
          theme={theme}
          setTheme={setTheme}
          showGrid={showGrid}
          setShowGrid={setShowGrid}
          showShadows={showShadows}
          setShowShadows={setShowShadows}
          activeNetId={activeNetId}
          setActiveNetId={setActiveNetId}
          netFlipX={netFlipX}
          setNetFlipX={setNetFlipX}
          netFlipY={netFlipY}
          setNetFlipY={setNetFlipY}
          onExport={(imgStr) => {
             setExportImageBlob(imgStr);
             setShowExportModal(true);
          }}
          setShowAuthModal={setShowAuthModal}
          setShowGalleryModal={setShowGalleryModal}
        />
      
      {/* Main 3D Canvas Section */}
      <main className="flex-1 relative bg-slate-900">
        {/* Children will be the 3D Canvas */}
        {children}
        
        {/* Overlay for UI mapping later on if needed */}
        <div className="absolute top-4 left-4 pointer-events-none">
          <h1 className="text-white text-2xl font-bold tracking-tight drop-shadow-md">
            3D Box Visualization
          </h1>
          <p className="text-slate-300 mt-1 drop-shadow-sm max-w-md">
            Interactive 3D Geometry Viewer
          </p>
        </div>

        {/* Camera Reset UI */}
        <div className="absolute top-4 right-4">
          <button 
            onClick={handleResetCamera}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-3 py-2 rounded-lg border border-white/20 transition-all font-medium text-sm shadow-sm"
          >
            <Focus size={16} />
            รีเซ็ตมุมกล้อง
          </button>
        </div>
      </main>
    </div>
    </div>
  );
}
