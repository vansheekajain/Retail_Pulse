import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { useUIStore } from '../store/uiStore';
import { elasticityService } from '../services/elasticity.service';
import { storeService } from '../services/store.service';
import { formatINR } from '../utils/currencyFormat';

const S = {
  page: { fontFamily: "'Noto Sans', sans-serif", paddingBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px' },
  sub:   { fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px' },
  select: {
    width: '100%', height: 44, padding: '0 12px',
    borderRadius: 12, border: '1.5px solid #E2E8F0',
    background: '#F8FAFC', fontSize: 13, outline: 'none',
    fontFamily: 'inherit', marginBottom: 20, cursor: 'pointer',
  },
  card: {
    background: '#fff', borderRadius: 16, padding: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #F1F5F9', marginBottom: 16,
  },
  cardTitle: { fontSize: 13, fontWeight: 700, color: '#334155', margin: '0 0 12px' },
  statRow: {
    display: 'flex', justifyContent: 'space-between',
    padding: '10px 0', borderBottom: '1px solid #F8FAFC',
  },
  statLabel: { fontSize: 13, color: '#64748B' },
  statValue: { fontSize: 13, fontWeight: 700, color: '#1E293B' },
  interpretBox: {
    background: '#F0FDF4', borderRadius: 12, padding: 12,
    border: '1px solid #BBF7D0', marginTop: 12,
  },
  interpretText: { fontSize: 13, color: '#14532D', margin: 0, lineHeight: 1.5 },
  optimalBadge: {
    display: 'inline-block', padding: '4px 12px',
    background: '#0F4C81', color: '#fff',
    borderRadius: 999, fontSize: 13, fontWeight: 700,
    marginTop: 8,
  },
  loader: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' },
  spinner: {
    width: 32, height: 32,
    border: '3px solid #E2E8F0',
    borderTop: '3px solid #0F4C81',
    borderRadius: '50%', animation: 'spin 0.7s linear infinite',
  },
  empty: { textAlign: 'center', padding: '48px 16px', color: '#94A3B8', fontSize: 14 },
  errBox: {
    background: '#FEF2F2', borderRadius: 12, padding: 16,
    border: '1px solid #FECACA', color: '#DC2626', fontSize: 13,
  },
};

export default function PriceElasticity() {
  const activeStoreId = useUIStore(s => s.activeStoreId);
  const [products,    setProducts]    = useState([]);
  const [selectedPid, setSelectedPid] = useState('');
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  useEffect(() => {
    if (!activeStoreId) return;
    storeService.getProducts(activeStoreId).then(prods => {
      setProducts(prods);
      if (prods.length > 0) setSelectedPid(prods[0].id);
    });
  }, [activeStoreId]);

  useEffect(() => {
    if (!activeStoreId || !selectedPid) return;
    setLoading(true);
    setError('');
    setData(null);
    elasticityService.getPriceElasticity(activeStoreId, selectedPid)
      .then(d => setData(d))
      .catch(err => setError(err.response?.data?.error || 'Failed to load data'))
      .finally(() => setLoading(false));
  }, [activeStoreId, selectedPid]);

  if (!activeStoreId) return <div style={S.empty}>Select a store first</div>;

  return (
    <div style={S.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={S.title}>💰 Price Elasticity</p>
      <p style={S.sub}>How price changes affect your sales demand</p>

      <select style={S.select} value={selectedPid}
        onChange={e => setSelectedPid(e.target.value)}>
        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>

      {loading ? (
        <div style={S.loader}><div style={S.spinner} /></div>
      ) : error ? (
        <div style={S.errBox}>⚠️ {error}</div>
      ) : !data ? null : (
        <>
          {/* Stats */}
          <div style={S.card}>
            <p style={S.cardTitle}>Elasticity Analysis</p>
            {[
              { label: 'Elasticity Coefficient', value: data.elasticity },
              { label: 'Data Points Used',       value: data.data_points },
              { label: 'Model Accuracy (R²)',    value: data.r_squared },
            ].map(s => (
              <div key={s.label} style={S.statRow}>
                <span style={S.statLabel}>{s.label}</span>
                <span style={S.statValue}>{s.value}</span>
              </div>
            ))}
            <div style={S.interpretBox}>
              <p style={S.interpretText}>{data.interpretation}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: '#64748B', margin: '12px 0 4px' }}>
                Optimal Price for Maximum Revenue:
              </p>
              <span style={S.optimalBadge}>{formatINR(data.optimal_price)}</span>
            </div>
          </div>

          {/* Chart */}
          <div style={S.card}>
            <p style={S.cardTitle}>Price vs Demand Curve</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.chart_data}>
                <XAxis dataKey="price" tick={{ fontSize: 10, fill: '#94A3B8' }}
                  tickFormatter={v => `₹${v}`} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }}
                  axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v, n) => [v, n === 'predicted_qty' ? 'Demand' : n]}
                  labelFormatter={v => `Price: ₹${v}`}
                  contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E2E8F0' }}
                />
                <ReferenceLine x={data.optimal_price} stroke="#FF6B35"
                  strokeDasharray="4 4" label={{ value: 'Optimal', fontSize: 10, fill: '#FF6B35' }} />
                <Line dataKey="predicted_qty" stroke="#0F4C81"
                  strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}