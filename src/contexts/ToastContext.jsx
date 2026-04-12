import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'success', duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type, exiting: false }]);
    
    // Start exit animation before removal
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    }, duration - 400);
    
    // Remove after animation
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 400);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const ICONS = {
  success: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  loading: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
};

const COLORS = {
  success: {
    bg: 'linear-gradient(135deg, #0f4c2a 0%, #065f46 100%)',
    border: 'rgba(52, 211, 153, 0.3)',
    icon: '#34d399',
    text: '#ecfdf5',
    bar: '#34d399',
  },
  error: {
    bg: 'linear-gradient(135deg, #4c0f0f 0%, #7f1d1d 100%)',
    border: 'rgba(248, 113, 113, 0.3)',
    icon: '#f87171',
    text: '#fff1f2',
    bar: '#f87171',
  },
  info: {
    bg: 'linear-gradient(135deg, #0f1c4c 0%, #1e3a8a 100%)',
    border: 'rgba(99, 179, 237, 0.3)',
    icon: '#63b3ed',
    text: '#eff6ff',
    bar: '#63b3ed',
  },
  loading: {
    bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
    border: 'rgba(167, 139, 250, 0.3)',
    icon: '#a78bfa',
    text: '#f5f3ff',
    bar: '#a78bfa',
  },
};

function ToastItem({ toast, onDismiss }) {
  const c = COLORS[toast.type] || COLORS.info;

  return (
    <div
      onClick={() => onDismiss(toast.id)}
      style={{
        pointerEvents: 'auto',
        cursor: 'pointer',
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: '16px',
        padding: '14px 16px',
        minWidth: '300px',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 4px 15px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        // Slide-in / fade-out animation via inline style transition
        animation: toast.exiting
          ? 'toastOut 0.4s cubic-bezier(0.4, 0, 1, 1) forwards'
          : 'toastIn 0.4s cubic-bezier(0, 0, 0.2, 1) forwards',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated progress bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: '3px',
        width: '100%',
        background: `${c.bar}30`,
        borderRadius: '0 0 16px 16px',
      }} />

      {/* Icon */}
      <div style={{
        color: c.icon,
        flexShrink: 0,
        marginTop: '1px',
        filter: `drop-shadow(0 0 8px ${c.icon}80)`,
      }}>
        {ICONS[toast.type]}
      </div>

      {/* Message */}
      <div style={{
        color: c.text,
        fontSize: '14px',
        fontWeight: '500',
        lineHeight: '1.5',
        flex: 1,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        {toast.message}
      </div>

      {/* Close X */}
      <div style={{
        color: c.text,
        opacity: 0.5,
        fontSize: '16px',
        flexShrink: 0,
        lineHeight: 1,
        marginTop: '1px',
      }}>
        ✕
      </div>

      {/* Keyframes injected once */}
      <style>{`
        @keyframes toastIn {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        @keyframes toastOut {
          from { transform: translateX(0);   opacity: 1; }
          to   { transform: translateX(120%); opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
