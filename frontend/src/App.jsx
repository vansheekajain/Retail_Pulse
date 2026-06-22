import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';

const Login           = lazy(() => import('./pages/Login'));
const Dashboard       = lazy(() => import('./pages/Dashboard'));
const SalesLog        = lazy(() => import('./pages/SalesLog'));
const Forecast        = lazy(() => import('./pages/Forecast'));
const Suppliers       = lazy(() => import('./pages/Suppliers'));
const Anomalies       = lazy(() => import('./pages/Anomalies'));
const Settings        = lazy(() => import('./pages/Settings'));
const PriceElasticity = lazy(() => import('./pages/PriceElasticity'));
const Analytics       = lazy(() => import('./pages/Analytics'));
const MultiStore      = lazy(() => import('./pages/MultiStore'));
const CompetitorMap   = lazy(() => import('./pages/CompetitorMap'));
const ExportReport    = lazy(() => import('./pages/ExportReport'));
const SearchPage      = lazy(() => import('./pages/SearchPage'));
const Onboarding      = lazy(() => import('./pages/Onboarding'));
const NotFound        = lazy(() => import('./pages/NotFound'));
const AppShell        = lazy(() => import('./components/layout/AppShell'));

function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', height: '100vh', background: '#F8FAFC',
    }}>
      <div style={{
        width: 36, height: 36,
        border: '3px solid #E2E8F0',
        borderTop: '3px solid #0F4C81',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function PrivateRoute({ children }) {
  const token      = useAuthStore(s => s.token);
  const isHydrated = useAuthStore(s => s._hasHydrated);
  const location   = useLocation();
  if (!isHydrated) return <PageLoader />;
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const token      = useAuthStore(s => s.token);
  const isHydrated = useAuthStore(s => s._hasHydrated);
  const location   = useLocation();
  if (!isHydrated) return <PageLoader />;
  if (token) {
    const dest = location.state?.from?.pathname || '/';
    return <Navigate to={dest} replace />;
  }
  return children;
}

export default function App() {
  const { i18n }       = useTranslation();
  const token          = useAuthStore(s => s.token);
  const user           = useAuthStore(s => s.user);
  const setStores      = useUIStore(s => s.setStores);
  const setActiveStore = useUIStore(s => s.setActiveStore);
  const activeStoreId  = useUIStore(s => s.activeStoreId);

  // ── Dark mode ─────────────────────────────────────────────────────────────
  const darkMode = useUIStore(s => s.darkMode);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', darkMode);

    if (darkMode) {
      root.style.setProperty('--bg-page',      '#0F172A');
      root.style.setProperty('--bg-card',      '#1E293B');
      root.style.setProperty('--surface',      '#1E293B');
      root.style.setProperty('--bg-input',     '#0F172A');
      root.style.setProperty('--bg-hover',     '#334155');
      root.style.setProperty('--text-main',    '#F1F5F9');
      root.style.setProperty('--text-muted',   '#94A3B8');
      root.style.setProperty('--text-heading', '#FFFFFF');
      root.style.setProperty('--border',       '#334155');
      root.style.setProperty('--border-input', '#475569');
      root.style.setProperty('--shadow',       '0 1px 3px rgba(0,0,0,0.4)');
      root.style.setProperty('--navBg',        '#1E293B');
      root.style.setProperty('--primary',      '#3B82F6');
      document.body.style.backgroundColor = '#0F172A';
      document.body.style.color           = '#F1F5F9';
    } else {
      root.style.setProperty('--bg-page',      '#F8FAFC');
      root.style.setProperty('--bg-card',      '#FFFFFF');
      root.style.setProperty('--surface',      '#FFFFFF');
      root.style.setProperty('--bg-input',     '#F8FAFC');
      root.style.setProperty('--bg-hover',     '#F1F5F9');
      root.style.setProperty('--text-main',    '#1E293B');
      root.style.setProperty('--text-muted',   '#64748B');
      root.style.setProperty('--text-heading', '#0F172A');
      root.style.setProperty('--border',       '#E2E8F0');
      root.style.setProperty('--border-input', '#E2E8F0');
      root.style.setProperty('--shadow',       '0 1px 3px rgba(0,0,0,0.08)');
      root.style.setProperty('--navBg',        '#FFFFFF');
      root.style.setProperty('--primary',      '#0F4C81');
      document.body.style.backgroundColor = '#F8FAFC';
      document.body.style.color           = '#1E293B';
    }
  }, [darkMode]);

  // ── Language ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.preferredLanguage && i18n.language !== user.preferredLanguage) {
      i18n.changeLanguage(user.preferredLanguage);
    }
  }, [user?.preferredLanguage]);

  // ── Load stores ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    import('./services/store.service').then(({ storeService }) => {
      storeService.getMyStores().then(stores => {
        if (cancelled) return;
        setStores(stores);
        
        // Validate activeStoreId - it must belong to user's stores
        const activeStoreExists = stores.some(s => s.id === activeStoreId);
        
        if (stores.length > 0) {
          // If no active store OR active store doesn't belong to user, set first store
          if (!activeStoreId || !activeStoreExists) {
            setActiveStore(stores[0].id);
          }
        } else {
          // User has no stores - clear active store
          setActiveStore(null);
        }
      }).catch(() => {});
    });
    return () => { cancelled = true; };
  }, [token]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/login"      element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Protected */}
        <Route path="/" element={<PrivateRoute><AppShell /></PrivateRoute>}>
          <Route index                element={<Dashboard />}       />
          <Route path="sales"         element={<SalesLog />}        />
          <Route path="forecast"      element={<Forecast />}        />
          <Route path="suppliers"     element={<Suppliers />}       />
          <Route path="anomalies"     element={<Anomalies />}       />
          <Route path="settings"      element={<Settings />}        />
          <Route path="elasticity"    element={<PriceElasticity />} />
          <Route path="analytics"     element={<Analytics />}       />
          <Route path="multistore"    element={<MultiStore />}      />
          <Route path="stores"        element={<MultiStore />}      />
          <Route path="competitors"   element={<CompetitorMap />}   />
          <Route path="export"        element={<ExportReport />}    />
          <Route path="search"        element={<SearchPage />}      />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}