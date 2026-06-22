import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { salesService } from '../services/sales.service';
import { formatINR } from '../utils/currencyFormat';

const S = {
  page: {
    fontFamily: "'Noto Sans', sans-serif",
    padding: '0 0 24px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 4,
  },
  greeting: { fontSize: 13, color: 'var(--text-muted)', margin: 0 },
  name: { fontSize: 20, fontWeight: 700, color: 'var(--text-heading)', margin: '2px 0 0' },
  logBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    background: '#0F4C81',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginBottom: 20,
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #F1F5F9',
  },
  iconBox: (bg) => ({
    width: 36,
    height: 36,
    borderRadius: 10,
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    fontSize: 18,
  }),
  kpiValue: {
    fontSize: 22,
    fontWeight: 700,
    color: '#1E293B',
    margin: 0,
    lineHeight: 1,
  },
  kpiLabel: {
    fontSize: 11,
    color: '#94A3B8',
    margin: '6px 0 0',
    fontWeight: 500,
  },
  chartCard: {
    background: '#fff',
    borderRadius: 16,
    padding: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #F1F5F9',
    marginBottom: 20,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#334155',
    margin: 0,
  },
  viewAll: {
    fontSize: 12,
    fontWeight: 700,
    color: '#0F4C81',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  saleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#fff',
    borderRadius: 12,
    padding: '12px 14px',
    marginBottom: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: '1px solid #F1F5F9',
  },
  saleLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },
  saleIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: '#EFF6FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    flexShrink: 0,
  },
  saleName: {
    fontSize: 13,
    fontWeight: 700,
    color: '#1E293B',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  saleMeta: {
    fontSize: 11,
    color: '#94A3B8',
    margin: '2px 0 0',
  },
  saleAmount: {
    fontSize: 13,
    fontWeight: 700,
    color: '#1E293B',
    flexShrink: 0,
  },
  empty: {
    background: '#fff',
    borderRadius: 16,
    padding: '32px 16px',
    textAlign: 'center',
    border: '1px solid #F1F5F9',
  },
  noStore: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: 16,
    textAlign: 'center',
    fontFamily: "'Noto Sans', sans-serif",
  },
  addStoreBtn: {
    padding: '10px 24px',
    background: '#0F4C81',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  loader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
  },
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid #E2E8F0',
    borderTop: '3px solid #0F4C81',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
};

export default function Dashboard() {
  const { t }         = useTranslation();
  const navigate      = useNavigate();
  const user          = useAuthStore(s => s.user);
  const activeStoreId = useUIStore(s => s.activeStoreId);

  const [summary,  setSummary]  = useState(null);
  const [weekData, setWeekData] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const hour = dayjs().hour();
  const greeting =
    hour < 12 ? t('dashboard.good_morning') :
    hour < 17 ? t('dashboard.good_afternoon') :
    t('dashboard.good_evening');

  useEffect(() => {
    if (!activeStoreId) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);

    const today = dayjs().format('YYYY-MM-DD');
    const from  = dayjs().subtract(6, 'day').format('YYYY-MM-DD');

    Promise.all([
      salesService.getDailySummary(activeStoreId, today),
      salesService.getSales(activeStoreId, { from, to: today, limit: 200 }),
    ]).then(([sum, week]) => {
      if (cancelled) return;
      setSummary(sum);

      const map = {};
      for (let i = 6; i >= 0; i--) {
        const d = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
        map[d] = { date: dayjs(d).format('DD MMM'), revenue: 0 };
      }
      week.sales.forEach(s => {
        if (map[s.saleDate])
          map[s.saleDate].revenue += parseFloat(s.totalAmount);
      });
      setWeekData(Object.values(map));
    }).catch(() => {
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [activeStoreId]);

  if (!activeStoreId) return (
    <div style={S.noStore}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ fontSize: 48 }}>🏪</div>
      <div>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#475569', margin: 0 }}>
          {t('dashboard.add_first_store')}
        </p>
        <p style={{ fontSize: 13, color: '#94A3B8', margin: '4px 0 0' }}>
          {t('store.add_first')}
        </p>
      </div>
      <button style={S.addStoreBtn} onClick={() => navigate('/settings')}>
        + {t('store.add_store')}
      </button>
    </div>
  );

  if (loading) return (
    <div style={S.loader}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={S.spinner} />
    </div>
  );

  const kpis = [
    { icon: '💰', bg: '#EFF6FF', label: t('dashboard.total_revenue'),  value: formatINR(summary?.totalRevenue || 0) },
    { icon: '🛍️', bg: '#F0FDF4', label: t('dashboard.transactions'),   value: summary?.transactions || 0 },
    { icon: '📦', bg: '#FFF7ED', label: t('dashboard.items_sold'),     value: summary?.totalItems || 0 },
    { icon: '⭐', bg: '#FDF4FF', label: t('dashboard.top_products'),   value: summary?.uniqueProducts || 0 },
  ];

  return (
    <div style={S.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={S.header}>
        <div>
          <p style={S.greeting}>{greeting},</p>
          <p style={S.name}>{user?.name?.split(' ')[0] || 'there'} 👋</p>
        </div>
        <button style={S.logBtn} onClick={() => navigate('/sales')}>
          + {t('sales.log_sale')}
        </button>
      </div>

      {/* KPI Grid */}
      <div style={S.grid}>
        {kpis.map(k => (
          <div key={k.label} style={S.card}>
            <div style={S.iconBox(k.bg)}>{k.icon}</div>
            <p style={S.kpiValue}>{k.value}</p>
            <p style={S.kpiLabel}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* 7 day chart */}
      <div style={S.chartCard}>
        <p style={{ ...S.sectionTitle, marginBottom: 16 }}>
          {t('dashboard.week_chart_title')}
        </p>
        <ResponsiveContainer width="100%" height={130}>
          <AreaChart
            data={weekData}
            margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
          >
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#0F4C81" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#0F4C81" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#94A3B8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94A3B8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}
            />
            <Tooltip
              formatter={v => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
              contentStyle={{
                fontSize: 12,
                borderRadius: 10,
                border: '1px solid #E2E8F0',
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#0F4C81"
              strokeWidth={2}
              fill="url(#grad)"
              dot={false}
              activeDot={{ r: 4, fill: '#0F4C81' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Sales */}
      <div style={S.sectionHeader}>
        <p style={S.sectionTitle}>{t('dashboard.recent_sales')}</p>
        <button style={S.viewAll} onClick={() => navigate('/sales')}>
          {t('dashboard.view_all')}
        </button>
      </div>

      {!summary?.sales?.length ? (
        <div style={S.empty}>
          <p style={{ fontSize: 32, margin: '0 0 8px' }}>🛒</p>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#64748B', margin: 0 }}>
            {t('dashboard.no_sales_today')}
          </p>
          <p style={{ fontSize: 12, color: '#94A3B8', margin: '6px 0 0' }}>
            {t('dashboard.no_sales_sub')}
          </p>
        </div>
      ) : (
        summary.sales.slice(0, 5).map(sale => (
          <div key={sale.id} style={S.saleRow}>
            <div style={S.saleLeft}>
              <div style={S.saleIcon}>🛍️</div>
              <div style={{ minWidth: 0 }}>
                <p style={S.saleName}>{sale.product?.name || '—'}</p>
                <p style={S.saleMeta}>
                  {sale.qty} {sale.product?.unit} · {dayjs(sale.createdAt).format('h:mm A')}
                </p>
              </div>
            </div>
            <p style={S.saleAmount}>{formatINR(sale.totalAmount)}</p>
          </div>
        ))
      )}
    </div>
  );
}