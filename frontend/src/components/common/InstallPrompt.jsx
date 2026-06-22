import { useState, useEffect } from 'react';

const S = {
  banner: {
    position: 'fixed', bottom: 72, left: 16, right: 16,
    background: '#0F4C81', color: '#fff',
    borderRadius: 16, padding: '14px 16px',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: 12,
    boxShadow: '0 4px 20px rgba(15,76,129,0.35)',
    zIndex: 45, fontFamily: "'Noto Sans', sans-serif",
  },
  left: { display: 'flex', alignItems: 'center', gap: 10 },
  icon: { fontSize: 28, flexShrink: 0 },
  title: { fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 },
  sub:   { fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: '2px 0 0' },
  installBtn: {
    padding: '8px 16px', background: '#fff',
    color: '#0F4C81', border: 'none',
    borderRadius: 10, fontSize: 12, fontWeight: 700,
    cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit',
  },
  dismissBtn: {
    background: 'none', border: 'none',
    color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
    fontSize: 18, padding: '4px', flexShrink: 0,
  },
};

export default function InstallPrompt() {
  const [prompt,    setPrompt]    = useState(null);
  const [show,      setShow]      = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    // Check if dismissed before
    if (localStorage.getItem('pwa_dismissed')) return;

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa_dismissed', '1');
    setShow(false);
  };

  if (!show || installed) return null;

  return (
    <div style={S.banner}>
      <div style={S.left}>
        <span style={S.icon}>📲</span>
        <div>
          <p style={S.title}>Install HyperLocal Forecast</p>
          <p style={S.sub}>Works offline · Fast · No app store needed</p>
        </div>
      </div>
      <button style={S.installBtn} onClick={handleInstall}>Install</button>
      <button style={S.dismissBtn} onClick={handleDismiss}>✕</button>
    </div>
  );
}