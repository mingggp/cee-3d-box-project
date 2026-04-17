import { X, Moon, Sun, Grid3x3, LightbulbOff, Lightbulb, PanelLeft, PanelRight, Languages } from "lucide-react";
import { useLang } from "../contexts/LanguageContext";

export default function SettingsModal({ 
  isOpen, 
  onClose,
  theme, setTheme,
  showGrid, setShowGrid,
  showShadows, setShowShadows,
  showLabels, setShowLabels,
  sidebarPosition, setSidebarPosition,
  lang, setLang
}) {
  const { t } = useLang();

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[100]" 
        onClick={onClose}
      ></div>
      <div className={`fixed top-24 ${sidebarPosition === 'right' ? 'left-6' : 'right-6'} md:top-24 md:${sidebarPosition === 'right' ? 'left-10' : 'right-10'} z-[110] w-80 max-w-[90vw] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl rounded-2xl flex flex-col border border-slate-200 dark:border-slate-800 transform animate-in fade-in zoom-in-95 duration-200`}>
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('settings')}</h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 flex-1 overflow-y-auto">
          
          {/* Display Toggles */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Display Options</h3>
            
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-500 transition-colors">
                {theme === 'dark' ? <Moon size={18} className="text-indigo-400" /> : <Sun size={18} className="text-orange-400" />}
                {t('theme')}
              </div>
              <div className="relative inline-block w-10 h-5">
                <input type="checkbox" className="sr-only" checked={theme === 'dark'} onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
                <div className={`block w-10 h-5 rounded-full transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${theme === 'dark' ? 'translate-x-5' : ''}`}></div>
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-500 transition-colors">
                <Grid3x3 size={18} className="text-slate-400" />
                {t('grid')}
              </div>
              <div className="relative inline-block w-10 h-5">
                <input type="checkbox" className="sr-only" checked={showGrid} onChange={() => setShowGrid(!showGrid)} />
                <div className={`block w-10 h-5 rounded-full transition-colors ${showGrid ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${showGrid ? 'translate-x-5' : ''}`}></div>
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-500 transition-colors">
                {showShadows ? <Lightbulb size={18} className="text-yellow-500" /> : <LightbulbOff size={18} className="text-slate-400" />}
                {t('shadows')}
              </div>
              <div className="relative inline-block w-10 h-5">
                <input type="checkbox" className="sr-only" checked={showShadows} onChange={() => setShowShadows(!showShadows)} />
                <div className={`block w-10 h-5 rounded-full transition-colors ${showShadows ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${showShadows ? 'translate-x-5' : ''}`}></div>
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-500 transition-colors">
                <PanelLeft size={18} className="text-pink-500" />
                Show Face Labels
              </div>
              <div className="relative inline-block w-10 h-5">
                <input type="checkbox" className="sr-only" checked={showLabels} onChange={() => setShowLabels(!showLabels)} />
                <div className={`block w-10 h-5 rounded-full transition-colors ${showLabels ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${showLabels ? 'translate-x-5' : ''}`}></div>
              </div>
            </label>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Preferences */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preferences</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                <Languages size={18} className="text-slate-400" />
                {t('language')}
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button 
                  onClick={() => setLang('en')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors ${lang === 'en' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  EN
                </button>
                <button 
                  onClick={() => setLang('th')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors ${lang === 'th' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  TH
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                {sidebarPosition === 'left' ? <PanelLeft size={18} className="text-slate-400" /> : <PanelRight size={18} className="text-slate-400" />}
                {t('sidebarPos')}
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button 
                  onClick={() => setSidebarPosition('left')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors ${sidebarPosition === 'left' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Left
                </button>
                <button 
                  onClick={() => setSidebarPosition('right')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors ${sidebarPosition === 'right' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Right
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
