import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ComposedChart, Area, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import dayjs from 'dayjs';
import { useUIStore } from '../store/uiStore';
import { forecastService } from '../services/forecast.service';
import { storeService } from '../services/store.service';
import { formatINR } from '../utils/currencyFormat';

const S = {
  page: { fontFamily: "'Noto Sans', sans-serif", paddingBottom: 24 },
  header: { marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 700, color: 'var(--text-heading)', margin: 0 },
  sub: { fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' },
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
  cardTitle: { fontSize: 13, fontWeight: 700, color: 'var(--text-main)', margin: '0 0 16px' },
  festiveTag: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', background: '#FEF3C7',
    border: '1px solid #FCD34D', borderRadius: 999,
    fontSize: 11, fontWeight: 600, color: '#92400E',
    marginLeft: 8,
  },
  dayRow: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #F1F5F9',
  },
  dayLabel: { fontSize: 13, fontWeight: 600, color: '#334155' },
  dayDate:  { fontSize: 11, color: '#94A3B8' },
  dayQty:   { fontSize: 14, fontWeight: 700, color: '#0F4C81' },
  dayCI:    { fontSize: 11, color: '#94A3B8' },
  loader: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', minHeight: '50vh',
  },
  spinner: {
    width: 32, height: 32,
    border: '3px solid #E2E8F0',
    borderTop: '3px solid #0F4C81',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  empty: {
    textAlign: 'center', padding: '48px 16px',
    color: '#94A3B8', fontSize: 14,
  },
};

export default function Forecast() {
  const { t }         = useTranslation();
  const activeStoreId = useUIStore(s => s.activeStoreId);

  const [products,    setProducts]    = useState([]);
  const [selectedPid, setSelectedPid] = useState('');
  const [forecast,    setForecast]    = useState(null);
  const [loading,     setLoading]     = useState(false);

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
    forecastService.getForecast(activeStoreId, selectedPid, 7)
      .then(data => setForecast(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeStoreId, selectedPid]);

  const chartData = forecast?.forecasts?.map(f => ({
    date:      dayjs(f.forecastDate).format('DD MMM'),
    predicted: parseFloat(f.predictedQty),
    lower:     parseFloat(f.ciLower),
    upper:     parseFloat(f.ciUpper),
    festive:   f.festiveFlag,
  })) || [];

  if (!activeStoreId) return (
    <div style={S.empty}>Select a store to view forecasts</div>
  );

  return (
    <div style={S.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={S.header}>
        <p style={S.title}>📈 {t('nav.forecast')}</p>
        <p style={S.sub}>7-day demand prediction with confidence intervals</p>
      </div>

      {/* Product selector */}
      <select
        style={S.select}
        value={selectedPid}
        onChange={e => setSelectedPid(e.target.value)}
      >
        {products.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      {loading ? (
        <div style={S.loader}><div style={S.spinner} /></div>
      ) : !forecast ? (
        <div style={S.empty}>No forecast data available</div>
      ) : (
        <>
          {/* Chart */}
          <div style={S.card}>
            <p style={S.cardTitle}>
              Forecast — {forecast.product?.name}
              {forecast.forecasts?.some(f => f.festiveFlag) && (
                <span style={S.festiveTag}>🎉 Festive period</span>
              )}
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="ciGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0F4C81" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0F4C81" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E2E8F0' }}
                  formatter={(val, name) => [
                    `${parseFloat(val).toFixed(1)} ${forecast.product?.unit || ''}`,
                    name === 'predicted' ? 'Forecast' : name === 'upper' ? 'Upper CI' : 'Lower CI',
                  ]}
                />
                <Area dataKey="upper" fill="url(#ciGrad)" stroke="none" />
                <Area dataKey="lower" fill="#fff" stroke="none" />
                <Line dataKey="predicted" stroke="#0F4C81" strokeWidth={2.5} dot={{ r: 4, fill: '#0F4C81' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Day by day breakdown */}
          <div style={S.card}>
            <p style={S.cardTitle}>Day-by-day Forecast</p>
            {forecast.forecasts?.map((f, i) => (
              <div key={i} style={S.dayRow}>
                <div>
                  <p style={S.dayLabel}>
                    {dayjs(f.forecastDate).format('dddd')}
                    {f.festiveFlag && (
                      <span style={S.festiveTag}>🎉 {f.festiveName}</span>
                    )}
                  </p>
                  <p style={S.dayDate}>{dayjs(f.forecastDate).format('D MMM YYYY')}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={S.dayQty}>
                    {parseFloat(f.predictedQty).toFixed(1)} {forecast.product?.unit}
                  </p>
                  <p style={S.dayCI}>
                    CI: {parseFloat(f.ciLower).toFixed(1)} – {parseFloat(f.ciUpper).toFixed(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}