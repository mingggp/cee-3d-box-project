import { useState } from "react";
import MainLayout from "./components/layout/MainLayout";
import Scene from "./components/canvas/Scene";
import Box from "./components/canvas/Box";
import Sidebar from "./components/layout/Sidebar";
import ExportModal from "./components/ExportModal";
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider, useLang } from './contexts/LanguageContext';
import AuthModal from './components/auth/AuthModal';
import GalleryModal from './components/gallery/GalleryModal';
import SettingsModal from './components/SettingsModal';

function AppContent() {
  const { lang, setLang } = useLang();
  
  const [foldProgress, setFoldProgress] = useState(0); // 0 to 1
  const [selectedFace, setSelectedFace] = useState("front");
  const [theme, setTheme] = useState("dark");
  const [showGrid, setShowGrid] = useState(true);
  const [showShadows, setShowShadows] = useState(true);
  const [activeNetId, setActiveNetId] = useState(0); // Which of the 11 nets is active
  const [netFlipX, setNetFlipX] = useState(false);
  const [netFlipY, setNetFlipY] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportImageBlob, setExportImageBlob] = useState(null);
  
  // Settings & Navigation States
  const [sidebarPosition, setSidebarPosition] = useState("left"); // "left" | "right"
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Phase 8 States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  const handleLoadBox = (savedData) => {
    if (savedData.facesConfig) setFacesConfig(savedData.facesConfig);
    if (savedData.activeNetId !== undefined) setActiveNetId(savedData.activeNetId);
    setNetFlipX(savedData.netFlipX || false);
    setNetFlipY(savedData.netFlipY || false);
    setFoldProgress(0); // reset fold so they can see net
  };

  const [facesConfig, setFacesConfig] = useState({
    bottom: { color: "#ffffff", textureUrl: null, aiImageUrl: null, userImageUrl: null, rotation: 0, flipX: false, flipY: false, shapes: [], activeShapeIndex: null },
    top: { color: "#ffffff", textureUrl: null, aiImageUrl: null, userImageUrl: null, rotation: 0, flipX: false, flipY: false, shapes: [], activeShapeIndex: null },
    front: { color: "#ffffff", textureUrl: null, aiImageUrl: null, userImageUrl: null, rotation: 0, flipX: false, flipY: false, shapes: [], activeShapeIndex: null },
    back: { color: "#ffffff", textureUrl: null, aiImageUrl: null, userImageUrl: null, rotation: 0, flipX: false, flipY: false, shapes: [], activeShapeIndex: null },
    left: { color: "#ffffff", textureUrl: null, aiImageUrl: null, userImageUrl: null, rotation: 0, flipX: false, flipY: false, shapes: [], activeShapeIndex: null },
    right: { color: "#ffffff", textureUrl: null, aiImageUrl: null, userImageUrl: null, rotation: 0, flipX: false, flipY: false, shapes: [], activeShapeIndex: null },
  });

  return (
    <>
      <MainLayout 
        foldProgress={foldProgress} 
        setFoldProgress={setFoldProgress}
        facesConfig={facesConfig}
        setFacesConfig={setFacesConfig}
        selectedFace={selectedFace}
        setSelectedFace={setSelectedFace}
        sidebarPosition={sidebarPosition}
        setShowSettingsModal={setShowSettingsModal}
        setShowExportModal={setShowExportModal}
        setExportImageBlob={setExportImageBlob}
        setShowAuthModal={setShowAuthModal}
        setShowGalleryModal={setShowGalleryModal}
        activeNetId={activeNetId}
        setActiveNetId={setActiveNetId}
        netFlipX={netFlipX}
        setNetFlipX={setNetFlipX}
        netFlipY={netFlipY}
        setNetFlipY={setNetFlipY}
      >
        <Scene 
          foldProgress={foldProgress} 
          facesConfig={facesConfig} 
          selectedFace={selectedFace}
          setSelectedFace={setSelectedFace}
          theme={theme}
          showGrid={showGrid}
          showShadows={showShadows}
        >
          <Box 
            foldProgress={foldProgress} 
            facesConfig={facesConfig} 
            selectedFace={selectedFace} 
            setSelectedFace={setSelectedFace}
            showShadows={showShadows}
            activeNetId={activeNetId}
            netFlipX={netFlipX}
            netFlipY={netFlipY}
          />
        </Scene>
        {showExportModal && (
          <ExportModal 
            exportImageBlob={exportImageBlob} 
            onClose={() => setShowExportModal(false)}
          />
        )}
      </MainLayout>

      <SettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)}
        theme={theme} setTheme={setTheme}
        showGrid={showGrid} setShowGrid={setShowGrid}
        showShadows={showShadows} setShowShadows={setShowShadows}
        sidebarPosition={sidebarPosition} setSidebarPosition={setSidebarPosition}
        lang={lang} setLang={setLang}
      />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <GalleryModal isOpen={showGalleryModal} onClose={() => setShowGalleryModal(false)} onLoadBox={handleLoadBox} />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
