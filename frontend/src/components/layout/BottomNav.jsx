import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NAV_ITEMS = [
  { path: '/',           icon: '📊', key: 'dashboard'  },
  { path: '/sales',      icon: '💬', key: 'sales'      },
  { path: '/forecast',   icon: '📈', key: 'forecast'   },
  { path: '/multistore',   icon: '🏬', key: 'multistore' },
  { path: '/analytics',  icon: '🔍', key: 'analytics'  },
  { path: '/settings',   icon: '⚙️',  key: 'settings'   },
];

const S = {
  nav: {
    position: 'fixed',
    bottom: 0, left: 0, right: 0,
    zIndex: 40,
    background: 'var(--surface)',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    height: 64,
    fontFamily: "'Noto Sans', sans-serif",
  },
  item: (active) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: '100%',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: '4px 0',
    color: active ? 'var(--primary)' : 'var(--text-muted)',
    fontFamily: 'inherit',
  }),
  iconWrap: (active) => ({
    width: 36, height: 28,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: active ? 'var(--bg-hover)' : 'transparent',
    fontSize: 18,
  }),
  label: {
    fontSize: 10,
    fontWeight: 600,
    lineHeight: 1,
  },
};

export default function BottomNav() {
  const { t }    = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  if (window.innerWidth >= 768) return null;

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  return (
    <nav style={S.nav}>
      {NAV_ITEMS.map(item => {
        const active = isActive(item.path);
        return (
          <button
            key={item.path}
            style={S.item(active)}
            onClick={() => navigate(item.path)}
          >
            <div style={S.iconWrap(active)}>
              {item.icon}
            </div>
            <span style={S.label}>
              {t(`nav.${item.key}`)}
            </span>
          </button>
        );
      })}
    </nav>
  );
}