import { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import api from '../services/api';

const S = {
  page: { fontFamily: "'Noto Sans', sans-serif", paddingBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px' },
  sub: { fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px' },
  card: {
    background: '#fff', borderRadius: 16, padding: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #F1F5F9', marginBottom: 12,
    display: 'flex', alignItems: 'flex-start',
    justifyContent: 'space-between', gap: 12,
  },
  icon: (type) => ({
    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
    background: type === 'spike' ? '#FEF3C7' : '#FEE2E2',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20,
  }),
  name: { fontSize: 14, fontWeight: 700, color: 'var(--text-heading)', margin: 0 },
  meta: { fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' },
  badge: (severity) => ({
    padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
    background: severity === 'high' ? '#FEE2E2' : '#FEF3C7',
    color: severity === 'high' ? '#DC2626' : '#D97706',
    flexShrink: 0,
  }),
  empty: { textAlign: 'center', padding: '48px 16px', color: '#94A3B8' },
  loader: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' },
  spinner: {
    width: 32, height: 32,
    border: '3px solid #E2E8F0',
    borderTop: '3px solid #0F4C81',
    borderRadius: '50%', animation: 'spin 0.7s linear infinite',
  },
};

export default function Anomalies() {
  const activeStoreId = useUIStore(s => s.activeStoreId);
  const [anomalies, setAnomalies] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!activeStoreId) { setLoading(false); return; }
    setLoading(true);
    api.get('/anomalies', { params: { storeId: activeStoreId, days: 30 } })
      .then(r => setAnomalies(r.data.anomalies || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeStoreId]);

  return (
    <div style={S.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={S.title}>🚨 Anomaly Detection</p>
      <p style={S.sub}>Unusual sales spikes and drops in the last 30 days</p>

      {loading ? (
        <div style={S.loader}><div style={S.spinner} /></div>
      ) : anomalies.length === 0 ? (
        <div style={S.empty}>
          <p style={{ fontSize: 40, margin: '0 0 8px' }}>✅</p>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#64748B' }}>
            No anomalies detected
          </p>
          <p style={{ fontSize: 12, marginTop: 4 }}>
            Your sales patterns look normal
          </p>
        </div>
      ) : (
        anomalies.map((a, i) => (
          <div key={i} style={S.card}>
            <div style={S.icon(a.type)}>
              {a.type === 'spike' ? '📈' : '📉'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={S.name}>{a.productName}</p>
              <p style={S.meta}>
                {a.type === 'spike' ? '↑ Unusual spike' : '↓ Unusual drop'} on {a.date}
              </p>
              <p style={S.meta}>
                Actual: <strong>{a.actualQty}</strong> ·
                Expected: <strong>{a.expectedQty}</strong> ·
                Z-score: <strong>{a.zScore}</strong>
              </p>
            </div>
            <span style={S.badge(a.severity)}>{a.severity}</span>
          </div>
        ))
      )}
    </div>
  );
}