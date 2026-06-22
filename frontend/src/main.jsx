import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import App from './App';
import './locales/index';
import './index.css';

if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations()
      .then(regs => regs.forEach(reg => reg.unregister()))
      .catch(() => {});
  });
}

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        reg.onupdatefound = () => {
          const newWorker = reg.installing;
          newWorker.onstatechange = () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              toast(
                (t) => (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>🔄 Update available</span>
                    <button
                      onClick={() => {
                        newWorker.postMessage({ type: 'SKIP_WAITING' });
                        toast.dismiss(t.id);
                        window.location.reload();
                      }}
                      style={{
                        background: '#0F4C81', color: '#fff',
                        border: 'none', borderRadius: '6px',
                        padding: '4px 10px', cursor: 'pointer', fontSize: '13px',
                      }}
                    >
                      Refresh
                    </button>
                  </span>
                ),
                { duration: Infinity, id: 'sw-update' }
              );
            }
          };
        };
      })
      .catch(() => {});
  });
}

window.addEventListener('online',  () => toast.success('Back online', { id: 'net', duration: 2500 }));
window.addEventListener('offline', () => toast('You are offline — changes will sync later', { id: 'net', icon: '📶', duration: Infinity }));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: "'Noto Sans', sans-serif",
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: '10px',
              padding: '10px 14px',
              maxWidth: '360px',
            },
          }}
        />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);