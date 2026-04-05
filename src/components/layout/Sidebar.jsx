import { Cuboid, PaintBucket, Download, Settings, SlidersHorizontal, ImagePlus, Trash2, FlipHorizontal, FlipVertical, RotateCcw, RotateCw, Moon, Sun, Grid3x3, LightbulbOff, Lightbulb, Square, Circle, Star, Trash, Wand2, Loader2, AlertCircle, Save, LogOut, LogIn, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import NetSelector from "../NetSelector";
import { useAuth } from "../../contexts/AuthContext";
import { saveBoxConfig } from "../../services/db";

export default function Sidebar({ foldProgress, setFoldProgress, facesConfig, setFacesConfig, selectedFace, setSelectedFace, theme, setTheme, showGrid, setShowGrid, showShadows, setShowShadows, activeNetId, setActiveNetId, netFlipX, setNetFlipX, netFlipY, setNetFlipY, onExport, setShowAuthModal, setShowGalleryModal }) {

  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const { currentUser, logout } = useAuth();

  const handleSaveBox = async () => {
    if (!currentUser) return setShowAuthModal(true);
    try {
      setIsSaving(true);
      await saveBoxConfig(currentUser.uid, { facesConfig, activeNetId, netFlipX, netFlipY });
      alert("Box saved to gallery successfully! 🎉");
    } catch (err) {
      console.error(err);
      alert("Failed to save box format.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateFaceConfig = (key, value) => {
    setFacesConfig(prev => ({
      ...prev,
      [selectedFace]: { ...prev[selectedFace], [key]: value }
    }));
  };

  const handleAddShape = (type) => {
    const currentShapes = facesConfig[selectedFace].shapes || [];
    const newShape = {
      id: Date.now(),
      type,
      x: 512,
      y: 512,
      scale: 1,
      rotation: 0,
      color: facesConfig[selectedFace].color === '#ffffff' ? '#4f46e5' : '#ffffff'
    };
    updateFaceConfig('shapes', [...currentShapes, newShape]);
    updateFaceConfig('activeShapeIndex', currentShapes.length);
  };
  
  const handleUpdateShape = (updates) => {
    const idx = facesConfig[selectedFace].activeShapeIndex;
    if (idx === null || idx === undefined) return;
    const currentShapes = [...facesConfig[selectedFace].shapes];
    currentShapes[idx] = { ...currentShapes[idx], ...updates };
    updateFaceConfig('shapes', currentShapes);
  };

  const handleDeleteShape = () => {
    const idx = facesConfig[selectedFace].activeShapeIndex;
    if (idx === null || idx === undefined) return;
    const currentShapes = facesConfig[selectedFace].shapes.filter((_, i) => i !== idx);
    updateFaceConfig('shapes', currentShapes);
    updateFaceConfig('activeShapeIndex', null);
  };

  const handleColorChange = (e) => updateFaceConfig('color', e.target.value);

  const handleGenerateAITexture = async () => {
    if (!aiPrompt.trim()) {
      setAiError("Please enter a prompt first.");
      return;
    }
    
    setIsGenerating(true);
    setAiError(null);
    
    try {
      const apiKey = import.meta.env.VITE_HUGGINGFACE_TOKEN;
      if (!apiKey) {
        throw new Error("Missing VITE_HUGGINGFACE_TOKEN in .env file.");
      }

      const response = await fetch(
        "/api/hf/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ inputs: aiPrompt }),
        }
      );

      if (!response.ok) {
        let errorTxt = `API Error: ${response.status} ${response.statusText}`;
        try {
          const errObj = await response.json();
          if (errObj.error) errorTxt = errObj.error;
        } catch (je) {
           // ignore json parse error
        }
        throw new Error(errorTxt);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      
      updateFaceConfig('textureUrl', imageUrl);
      setAiPrompt(""); 

    } catch (err) {
      console.error(err);
      setAiError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    updateFaceConfig('textureUrl', imageUrl);
  };

  const handleRemoveImage = () => {
    updateFaceConfig('textureUrl', null);
  };

  const handleExportImage = () => {
    const canvasObj = document.querySelector("canvas");
    if (!canvasObj) return;
    const image = canvasObj.toDataURL("image/png");
    onExport(image);
  };

  return (
    <aside className="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full z-10 transition-colors">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Cuboid size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Geometry App</h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowShadows(!showShadows)} 
            className={`p-2 rounded-lg transition-colors ${showShadows ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 hover:dark:bg-slate-600'}`}
            title="Toggle Shadows"
          >
            {showShadows ? <Lightbulb size={18} /> : <LightbulbOff size={18} />}
          </button>
          <button 
            onClick={() => setShowGrid(!showGrid)} 
            className={`p-2 rounded-lg transition-colors ${showGrid ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 hover:dark:bg-slate-600'}`}
            title="Toggle Grid"
          >
            <Grid3x3 size={18} />
          </button>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        
        {/* Folding Control Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <SlidersHorizontal size={14} />
            Folding Control
          </h3>
          <div className="px-1 py-2">
            <input 
              type="range" 
              min="0" max="1" step="0.01" 
              value={foldProgress}
              onChange={(e) => setFoldProgress(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
              <span>2D Net</span>
              <span>3D Box</span>
            </div>
            <div className="mt-2 text-center text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 py-1 rounded-md">
              {Math.round(foldProgress * 100)}% Folded
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Cuboid size={14} />
              Net Geometry
            </h3>
            <div className="flex gap-1 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 p-0.5 shadow-sm">
              <button 
                onClick={() => setNetFlipX(!netFlipX)}
                className={`p-1 rounded transition-colors ${netFlipX ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                title="Flip Topology Horizontally"
              >
                <FlipHorizontal size={14} />
              </button>
              <button 
                onClick={() => setNetFlipY(!netFlipY)}
                className={`p-1 rounded transition-colors ${netFlipY ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                title="Flip Topology Vertically"
              >
                <FlipVertical size={14} />
              </button>
            </div>
          </div>
          <div className="px-1 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Select Net Form</span>
            <NetSelector activeNetId={activeNetId} setActiveNetId={setActiveNetId} netFlipX={netFlipX} netFlipY={netFlipY} />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Face Customization
          </h3>
          
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-4 shadow-sm">
            
            {/* Active Face Indication */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Editing Face:</span>
              <div className="px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-lg flex items-center justify-between">
                <span className="text-sm font-semibold uppercase text-indigo-700 dark:text-indigo-400">
                  {selectedFace}
                </span>
                <span className="text-[10px] text-indigo-400 dark:text-indigo-500 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded shadow-sm border border-indigo-50 dark:border-slate-700">3D Interactive</span>
              </div>
            </div>

            {/* Color Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Base Color</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={facesConfig[selectedFace].color}
                  onChange={handleColorChange}
                  className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-sm text-slate-600 uppercase font-mono bg-white px-2 py-1 border border-slate-200 rounded">
                  {facesConfig[selectedFace].color}
                </span>
              </div>
            </div>

            {/* Shapes / Canvas Editor */}
            <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-700">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Add Stickers</label>
              <div className="flex gap-2">
                <button onClick={() => handleAddShape('square')} className="flex-1 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded flex justify-center items-center" title="Square">
                  <Square size={16} />
                </button>
                <button onClick={() => handleAddShape('circle')} className="flex-1 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded flex justify-center items-center" title="Circle">
                  <Circle size={16} />
                </button>
                <button onClick={() => handleAddShape('star')} className="flex-1 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded flex justify-center items-center" title="Star">
                  <Star size={16} />
                </button>
              </div>

              {/* Active Shape Editor */}
              {facesConfig[selectedFace].activeShapeIndex !== null && facesConfig[selectedFace].activeShapeIndex !== undefined && facesConfig[selectedFace].shapes[facesConfig[selectedFace].activeShapeIndex] && (
                <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3 mt-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                      Edit {facesConfig[selectedFace].shapes[facesConfig[selectedFace].activeShapeIndex].type}
                    </span>
                    <button onClick={handleDeleteShape} className="text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/30 p-1 rounded">
                      <Trash size={14} />
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400">X Pos (0-1024)</label>
                      <input type="range" min="0" max="1024" value={facesConfig[selectedFace].shapes[facesConfig[selectedFace].activeShapeIndex].x} onChange={e => handleUpdateShape({x: parseInt(e.target.value)})} className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Y Pos (0-1024)</label>
                      <input type="range" min="0" max="1024" value={facesConfig[selectedFace].shapes[facesConfig[selectedFace].activeShapeIndex].y} onChange={e => handleUpdateShape({y: parseInt(e.target.value)})} className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Scale</label>
                      <input type="range" min="0.1" max="5" step="0.1" value={facesConfig[selectedFace].shapes[facesConfig[selectedFace].activeShapeIndex].scale} onChange={e => handleUpdateShape({scale: parseFloat(e.target.value)})} className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Rotate</label>
                      <input type="range" min="0" max="360" value={facesConfig[selectedFace].shapes[facesConfig[selectedFace].activeShapeIndex].rotation} onChange={e => handleUpdateShape({rotation: parseInt(e.target.value)})} className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Fill</label>
                    <input type="color" value={facesConfig[selectedFace].shapes[facesConfig[selectedFace].activeShapeIndex].color} onChange={e => handleUpdateShape({color: e.target.value})} className="w-8 h-8 rounded cursor-pointer border border-slate-200 dark:border-slate-600 p-0 bg-transparent" />
                  </div>
                </div>
              )}
              
              {facesConfig[selectedFace].shapes.length > 0 && facesConfig[selectedFace].activeShapeIndex === null && (
                <div className="flex gap-1.5 flex-wrap mt-3">
                  {facesConfig[selectedFace].shapes.map((s, i) => (
                    <button key={s.id} onClick={() => updateFaceConfig('activeShapeIndex', i)} className="px-2 py-1 text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md border border-indigo-100 dark:border-indigo-800 uppercase font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                      Select {s.type}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-1.5 pt-3 border-t border-slate-200 dark:border-slate-700">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Texture Image</label>
              
              {facesConfig[selectedFace].textureUrl ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                        <img src={facesConfig[selectedFace].textureUrl} alt="Texture" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate">Image Applied</span>
                    </div>
                    <button 
                      onClick={handleRemoveImage}
                      className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                      title="Remove Image"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Texture Controls */}
                  <div className="space-y-3 pt-2">
                    {/* Rotation */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-medium text-slate-600 dark:text-slate-400">
                        <span>Rotation</span>
                        <span>{facesConfig[selectedFace].rotation}°</span>
                      </div>
                      <div className="flex gap-2 items-center py-1">
                        <input 
                          type="range" 
                          min="0" max="360" step="1"
                          value={facesConfig[selectedFace].rotation}
                          onChange={(e) => updateFaceConfig('rotation', parseInt(e.target.value))}
                          className="flex-1 accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => updateFaceConfig('rotation', (facesConfig[selectedFace].rotation - 90 + 360) % 360)}
                          className="flex-1 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs flex justify-center items-center gap-1"
                        >
                          <RotateCcw size={12} /> -90°
                        </button>
                        <button 
                          onClick={() => updateFaceConfig('rotation', (facesConfig[selectedFace].rotation + 90) % 360)}
                          className="flex-1 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs flex justify-center items-center gap-1"
                        >
                          <RotateCw size={12} /> +90°
                        </button>
                      </div>
                    </div>

                    {/* Flipping */}
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Flip</div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => updateFaceConfig('flipX', !facesConfig[selectedFace].flipX)}
                          className={`flex-1 py-1.5 border rounded flex justify-center items-center gap-1.5 transition-colors ${facesConfig[selectedFace].flipX ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'}`}
                        >
                          <FlipHorizontal size={14} /> <span className="text-xs">Horiz</span>
                        </button>
                        <button 
                          onClick={() => updateFaceConfig('flipY', !facesConfig[selectedFace].flipY)}
                          className={`flex-1 py-1.5 border rounded flex justify-center items-center gap-1.5 transition-colors ${facesConfig[selectedFace].flipY ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'}`}
                        >
                          <FlipVertical size={14} /> <span className="text-xs">Vert</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 border-dashed text-slate-600 dark:text-slate-400 rounded-xl transition-colors cursor-pointer text-sm font-medium">
                  <ImagePlus size={18} className="text-indigo-500" />
                  <span>Upload Image</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="hidden" 
                  />
                </label>
              )}
            </div>

            {/* AI Generator */}
            <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-700">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">✨ AI Texture Generator</label>
              <textarea 
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="Make a wooden box texture, 4k..."
                className="w-full h-16 resize-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-xs text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isGenerating}
              />
              
              {aiError && (
                <div className="flex items-center gap-1.5 text-red-500 text-[10px] bg-red-50 dark:bg-red-900/20 p-1.5 rounded border border-red-100 dark:border-red-900/50 mt-1">
                  <AlertCircle size={12} className="flex-shrink-0" />
                  <span className="leading-tight">{aiError}</span>
                </div>
              )}
              
              <button 
                onClick={handleGenerateAITexture}
                disabled={isGenerating || !aiPrompt.trim()}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors mt-2 ${
                  isGenerating || !aiPrompt.trim() 
                    ? 'bg-indigo-100 text-indigo-400 dark:bg-indigo-900/30 dark:text-indigo-400/50 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 size={16} />
                    Generate with AI
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-800">
        
        {/* User Auth Section */}
        {currentUser ? (
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 truncate pr-2">
              <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-[10px]">
                {currentUser.email.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
                {currentUser.email}
              </span>
            </div>
            <button 
              onClick={logout} 
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setShowAuthModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2 border border-indigo-200 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors text-sm font-medium"
          >
            <LogIn size={16} />
            Sign In / Register
          </button>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={handleSaveBox}
            disabled={isSaving}
            className="flex flex-col items-center justify-center gap-1 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 rounded-lg transition-colors text-xs font-bold"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSaving ? "Saving..." : "Save Box"}
          </button>
          
          <button 
            onClick={() => {
              if (currentUser) setShowGalleryModal(true);
              else setShowAuthModal(true);
            }}
            className="flex flex-col items-center justify-center gap-1 py-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-400 rounded-lg transition-colors text-xs font-bold"
          >
            <ImageIcon size={18} />
            My Gallery
          </button>
        </div>

        <button 
          onClick={handleExportImage}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg transition-colors font-medium text-sm shadow-sm" 
        >
          <Download size={16} />
          Export PNG Snapshot
        </button>
      </div>
    </aside>
  );
}
