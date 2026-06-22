import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import BottomNav from './BottomNav';
import InstallPrompt from '../common/InstallPrompt';
import OfflineQueue from '../common/OfflineQueue';
import DarkModeToggle from '../common/DarkModeToggle';
import NotificationBell from '../common/NotificationBell';

const S = {
  shell: {
    display: 'flex',
    height: '100vh',
    background: 'var(--bg-page)',
    fontFamily: "'Noto Sans', sans-serif",
    overflow: 'hidden',
  },
  sidebar: {
    width: 220,
    background: 'var(--navBg)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 0',
    flexShrink: 0,
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 20px 20px',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    background: '#0F4C81',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
  },
  logoText: {
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--primary)',
    lineHeight: 1.2,
    margin: 0,
  },
  logoSub: {
    fontSize: 11,
    color: 'var(--text-muted)',
    fontWeight: 400,
    margin: 0,
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '0 12px',
  },
  navItem: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 12,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: active ? 700 : 500,
    color: active ? '#fff' : 'var(--text-muted)',
    background: active ? 'var(--primary)' : 'transparent',
    border: 'none',
    fontFamily: 'inherit',
    textAlign: 'left',
  }),
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
  },
  topbar: {
    height: 56,
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    flexShrink: 0,
    position: 'relative',
    zIndex: 10,
  },
  storeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 10px',
    borderRadius: 10,
    background: 'none',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-main)',
    fontFamily: 'inherit',
    maxWidth: 180,
  },
  dropdown: {
    position: 'absolute',
    top: 52,
    left: 16,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
    zIndex: 50,
    minWidth: 200,
    overflow: 'hidden',
  },
  dropdownItem: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 16px',
    fontSize: 13,
    fontWeight: active ? 700 : 500,
    color: active ? 'var(--primary)' : 'var(--text-main)',
    background: active ? 'var(--bg-hover)' : 'var(--surface)',
    cursor: 'pointer',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'inherit',
  }),
  userBtn: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'inherit',
  },
  userDropdown: {
    position: 'absolute',
    top: 52,
    right: 16,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
    zIndex: 50,
    minWidth: 180,
    overflow: 'hidden',
  },
  userInfo: {
    padding: '12px 16px',
    borderBottom: '1px solid var(--border)',
  },
  topRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  langToggle: {
    display: 'flex',
    alignItems: 'center',
    background: 'var(--bg-hover)',
    borderRadius: 8,
    padding: 3,
    gap: 2,
  },
  langBtn: (active) => ({
    padding: '4px 10px',
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 700,
    background: active ? 'var(--surface)' : 'transparent',
    color: active ? 'var(--primary)' : 'var(--text-muted)',
    fontFamily: 'inherit',
  }),
  pageArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 16px 80px',
    background: 'var(--bg-page)',
  },
  pageInner: {
    maxWidth: 680,
    margin: '0 auto',
  },
  offlineBanner: {
    background: '#D97706',
    color: '#fff',
    fontSize: 12,
    fontWeight: 600,
    padding: '6px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
};

const NAV_ITEMS = [
  { path: '/',             icon: '📊', key: 'dashboard'  },
  { path: '/sales',        icon: '💬', key: 'sales'      },
  { path: '/forecast',     icon: '📈', key: 'forecast'   },
  { path: '/suppliers',    icon: '🚚', key: 'suppliers'  },
  { path: '/anomalies',    icon: '🚨', key: 'anomalies'  },
  { path: '/analytics',    icon: '🔍', key: 'analytics'  },
  { path: '/elasticity',   icon: '💰', key: 'elasticity' },
  { path: '/multistore',   icon: '🏬', key: 'multistore' },
  { path: '/competitors',  icon: '🗺️',  key: 'competitors'},
  { path: '/export',       icon: '📄', key: 'export'     },
  { path: '/search',       icon: '🔎', key: 'search'     },
  { path: '/settings',     icon: '⚙️',  key: 'settings'   },
];

export default function AppShell() {
  const { t, i18n }   = useTranslation();
  const navigate       = useNavigate();
  const location       = useLocation();
  const user           = useAuthStore(s => s.user);
  const clearAuth      = useAuthStore(s => s.clearAuth);
  const stores         = useUIStore(s => s.stores);
  const activeStoreId  = useUIStore(s => s.activeStoreId);
  const setActiveStore = useUIStore(s => s.setActiveStore);
  const isOnline       = useUIStore(s => s.isOnline);

  const [storeOpen, setStoreOpen] = useState(false);
  const [userOpen,  setUserOpen]  = useState(false);

  const activeStore = stores.find(s => s.id === activeStoreId);
  const isDesktop   = window.innerWidth >= 768;

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div style={S.shell}>

      {/* Desktop sidebar */}
      {isDesktop && (
        <aside style={S.sidebar}>
          <div style={S.logoWrap}>
            <div style={S.logoIcon}>📈</div>
            <div>
              <p style={S.logoText}>HyperLocal</p>
              <p style={S.logoSub}>Forecast</p>
            </div>
          </div>
          <nav style={S.nav}>
            {NAV_ITEMS.map(item => (
              <button
                key={item.path}
                style={S.navItem(isActive(item.path))}
                onClick={() => navigate(item.path)}
              >
                <span>{item.icon}</span>
                {t(`nav.${item.key}`)}
              </button>
            ))}
          </nav>
          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border)',
          }}>
            <p style={{ fontSize: 10, color: '#CBD5E1', fontWeight: 600 }}>
              Phase 1 · v1.0.0
            </p>
          </div>
        </aside>
      )}

      {/* Main */}
      <div style={S.main}>

        {/* Topbar */}
        <div style={S.topbar}>

          {/* Store selector */}
          <button
            style={S.storeBtn}
            onClick={() => {
              setStoreOpen(v => !v);
              setUserOpen(false);
            }}
          >
            🏪
            <span style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {activeStore?.name || t('store.select_store')}
            </span>
            ▾
          </button>

          {storeOpen && (
            <div style={S.dropdown}>
              {stores.length === 0 && (
                <p style={{
                  padding: '12px 16px',
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  margin: 0,
                }}>
                  {t('store.no_stores')}
                </p>
              )}
              {stores.map(s => (
                <button
                  key={s.id}
                  style={S.dropdownItem(s.id === activeStoreId)}
                  onClick={() => {
                    setActiveStore(s.id);
                    setStoreOpen(false);
                  }}
                >
                  🏪 {s.name}
                </button>
              ))}
              <button
                style={{
                  ...S.dropdownItem(false),
                  color: 'var(--primary)',
                  borderTop: '1px solid var(--border)',
                }}
                onClick={() => {
                  navigate('/settings');
                  setStoreOpen(false);
                }}
              >
                + {t('store.add_store')}
              </button>
            </div>
          )}

          {/* Right side */}
          <div style={S.topRight}>
            <NotificationBell />
            <DarkModeToggle />
            <div style={S.langToggle}>
              {['en', 'hi'].map(lang => (
                <button
                  key={lang}
                  style={S.langBtn(i18n.language === lang)}
                  onClick={() => i18n.changeLanguage(lang)}
                >
                  {lang === 'en' ? 'EN' : 'हि'}
                </button>
              ))}
            </div>

            <button
              style={S.userBtn}
              onClick={() => {
                setUserOpen(v => !v);
                setStoreOpen(false);
              }}
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </button>

            {userOpen && (
              <div style={S.userDropdown}>
                <div style={S.userInfo}>
                  <p style={{
                    fontSize: 13, fontWeight: 700,
                    color: 'var(--text-main)', margin: 0,
                  }}>
                    {user?.name}
                  </p>
                  <p style={{
                    fontSize: 11, color: 'var(--text-muted)',
                    margin: '2px 0 0',
                  }}>
                    {user?.email}
                  </p>
                </div>
                <button
                  style={{
                    ...S.dropdownItem(false),
                    borderBottom: '1px solid var(--border)',
                  }}
                  onClick={() => {
                    navigate('/settings');
                    setUserOpen(false);
                  }}
                >
                  ⚙️ {t('nav.settings')}
                </button>
                <button
                  style={{ ...S.dropdownItem(false), color: '#DC2626' }}
                  onClick={handleLogout}
                >
                  🚪 {t('auth.logout')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Offline banner */}
        {!isOnline && (
          <div style={S.offlineBanner}>
            📶 {t('common.offline')}
          </div>
        )}

        {/* Page content */}
        <div style={S.pageArea}>
          <div style={S.pageInner}>
            <Outlet />
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />

      {/* Click away */}
      {(storeOpen || userOpen) && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
          }}
          onClick={() => {
            setStoreOpen(false);
            setUserOpen(false);
          }}
        />
      )}
      <InstallPrompt />
      <OfflineQueue />
    </div>
  );
}