import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import dayjs from 'dayjs';
import { useUIStore } from '../store/uiStore';
import { salesService } from '../services/sales.service';
import { storeService } from '../services/store.service';
import { formatINR, formatCompact } from '../utils/currencyFormat';

const S = {
  page: { fontFamily: "'Noto Sans', sans-serif", paddingBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px' },
  sub: { fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px' },
  kpiGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 },
  kpiCard: {
    background: '#fff', borderRadius: 16, padding: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #F1F5F9',
  },
  kpiIcon: {
    fontSize: 24, marginBottom: 8,
  },
  kpiValue: { fontSize: 20, fontWeight: 700, color: '#1E293B', margin: 0 },
  kpiLabel: { fontSize: 11, color: '#94A3B8', margin: '4px 0 0' },
  card: {
    background: '#fff', borderRadius: 16, padding: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #F1F5F9', marginBottom: 16,
  },
  cardTitle: { fontSize: 13, fontWeight: 700, color: '#334155', margin: '0 0 16px' },
  heatmapGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 4,
  },
  heatCell: (intensity) => ({
    height: 32, borderRadius: 6,
    background: intensity === 0 ? '#F1F5F9'
      : intensity < 0.3 ? '#BFDBFE'
      : intensity < 0.6 ? '#60A5FA'
      : intensity < 0.9 ? '#2563EB'
      : '#1E3A8A',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center',
    fontSize: 9, color: intensity > 0.5 ? '#fff' : '#64748B',
    cursor: 'pointer',
  }),
  dayLabel: {
    fontSize: 10, fontWeight: 600, color: '#94A3B8',
    textAlign: 'center', marginBottom: 4,
  },
  productRow: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 0', borderBottom: '1px solid #F8FAFC',
  },
  prodName: { fontSize: 13, fontWeight: 600, color: '#1E293B', margin: 0 },
  prodMeta: { fontSize: 11, color: '#94A3B8', margin: '2px 0 0' },
  loader: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' },
  spinner: {
    width: 32, height: 32,
    border: '3px solid #E2E8F0',
    borderTop: '3px solid #0F4C81',
    borderRadius: '50%', animation: 'spin 0.7s linear infinite',
  },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const COLORS = ['#0F4C81', '#1A73E8', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'];

export default function Analytics() {
  const activeStoreId = useUIStore(s => s.activeStoreId);
  const [loading,       setLoading]     = useState(true);
  const [sales,         setSales]       = useState([]);
  const [products,      setProducts]    = useState([]);
  const [heatmapData,   setHeatmapData] = useState([]);
  const [topProducts,   setTopProducts] = useState([]);
  const [weeklyData,    setWeeklyData]  = useState([]);
  const [kpis,          setKpis]        = useState({});

  useEffect(() => {
    if (!activeStoreId) { setLoading(false); return; }
    setLoading(true);

    const from = dayjs().subtract(29, 'day').format('YYYY-MM-DD');
    const to   = dayjs().format('YYYY-MM-DD');

    Promise.all([
      salesService.getSales(activeStoreId, { from, to, limit: 500 }),
      storeService.getProducts(activeStoreId),
    ]).then(([salesRes, prods]) => {
      const allSales = salesRes.sales;
      setSales(allSales);
      setProducts(prods);
      buildAnalytics(allSales, prods);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [activeStoreId]);

  const buildAnalytics = (allSales, prods) => {
    // KPIs
    const totalRevenue  = allSales.reduce((s, x) => s + parseFloat(x.totalAmount), 0);
    const totalItems    = allSales.reduce((s, x) => s + parseFloat(x.qty), 0);
    const avgOrderValue = allSales.length > 0 ? totalRevenue / allSales.length : 0;
    setKpis({ totalRevenue, totalItems, avgOrderValue, transactions: allSales.length });

    // Heatmap — last 28 days
    const hmap = [];
    for (let i = 27; i >= 0; i--) {
      const d   = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      const rev = allSales
        .filter(s => s.saleDate === d)
        .reduce((sum, s) => sum + parseFloat(s.totalAmount), 0);
      hmap.push({ date: d, revenue: rev, day: dayjs(d).format('D') });
    }
    const maxRev = Math.max(...hmap.map(h => h.revenue), 1);
    setHeatmapData(hmap.map(h => ({ ...h, intensity: h.revenue / maxRev })));

    // Top products
    const byProduct = {};
    allSales.forEach(s => {
      const pid = s.productId;
      if (!byProduct[pid]) byProduct[pid] = { qty: 0, revenue: 0, name: s.product?.name || '—' };
      byProduct[pid].qty     += parseFloat(s.qty);
      byProduct[pid].revenue += parseFloat(s.totalAmount);
    });
    const sorted = Object.values(byProduct).sort((a, b) => b.revenue - a.revenue);
    setTopProducts(sorted.slice(0, 5));

    // Weekly breakdown
    const weekly = {};
    allSales.forEach(s => {
      const week = dayjs(s.saleDate).startOf('week').format('DD MMM');
      if (!weekly[week]) weekly[week] = { week, revenue: 0 };
      weekly[week].revenue += parseFloat(s.totalAmount);
    });
    setWeeklyData(Object.values(weekly));
  };

  if (!activeStoreId) return (
    <div style={{ ...S.loader, fontFamily: 'Noto Sans, sans-serif' }}>
      <p style={{ color: '#94A3B8', fontSize: 14 }}>Select a store to view analytics</p>
    </div>
  );

  if (loading) return (
    <div style={S.loader}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={S.spinner} />
    </div>
  );

  return (
    <div style={S.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={S.title}>📊 Analytics</p>
      <p style={S.sub}>Last 30 days performance overview</p>

      {/* KPI Grid */}
      <div style={S.kpiGrid}>
        {[
          { icon: '💰', label: 'Total Revenue',  value: formatCompact(kpis.totalRevenue)  },
          { icon: '🛍️', label: 'Transactions',   value: kpis.transactions                 },
          { icon: '📦', label: 'Items Sold',      value: kpis.totalItems?.toFixed(0)       },
          { icon: '🧾', label: 'Avg Order Value', value: formatINR(kpis.avgOrderValue)     },
        ].map(k => (
          <div key={k.label} style={S.kpiCard}>
            <div style={S.kpiIcon}>{k.icon}</div>
            <p style={S.kpiValue}>{k.value}</p>
            <p style={S.kpiLabel}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div style={S.card}>
        <p style={S.cardTitle}>Sales Heatmap — Last 28 Days</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
          {DAYS.map(d => <div key={d} style={S.dayLabel}>{d}</div>)}
        </div>
        <div style={S.heatmapGrid}>
          {heatmapData.map((h, i) => (
            <div key={i} style={S.heatCell(h.intensity)} title={`${h.date}: ${formatINR(h.revenue)}`}>
              {h.day}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 10, color: '#94A3B8' }}>Low</span>
          {['#F1F5F9', '#BFDBFE', '#60A5FA', '#2563EB', '#1E3A8A'].map((c, i) => (
            <div key={i} style={{ width: 14, height: 14, borderRadius: 3, background: c }} />
          ))}
          <span style={{ fontSize: 10, color: '#94A3B8' }}>High</span>
        </div>
      </div>

      {/* Weekly Revenue Bar Chart */}
      <div style={S.card}>
        <p style={S.cardTitle}>Weekly Revenue</p>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={weeklyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}
              tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
            <Tooltip
              formatter={v => [formatINR(v), 'Revenue']}
              contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E2E8F0' }}
            />
            <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
              {weeklyData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products */}
      <div style={S.card}>
        <p style={S.cardTitle}>Top Products by Revenue</p>
        {topProducts.length === 0 ? (
          <p style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', padding: '16px 0' }}>
            No sales data yet
          </p>
        ) : (
          topProducts.map((p, i) => (
            <div key={i} style={S.productRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: COLORS[i], display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 12, fontWeight: 700,
                }}>
                  {i + 1}
                </div>
                <div>
                  <p style={S.prodName}>{p.name}</p>
                  <p style={S.prodMeta}>{p.qty.toFixed(1)} units sold</p>
                </div>
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0F4C81' }}>
                {formatCompact(p.revenue)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}