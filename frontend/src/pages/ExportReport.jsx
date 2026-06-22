import { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { salesService } from '../services/sales.service';
import { storeService } from '../services/store.service';
import { formatINR } from '../utils/currencyFormat';
import dayjs from 'dayjs';

const S = {
  page: { fontFamily: "'Noto Sans', sans-serif", paddingBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px' },
  sub: { fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px' },
  card: {
    background: '#fff', borderRadius: 16, padding: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #F1F5F9', marginBottom: 16,
  },
  cardTitle: { fontSize: 13, fontWeight: 700, color: '#334155', margin: '0 0 16px' },
  label: {
    fontSize: 11, fontWeight: 700, color: '#64748B',
    textTransform: 'uppercase', display: 'block', marginBottom: 6,
  },
  input: {
    width: '100%', height: 44, padding: '0 12px',
    borderRadius: 12, border: '1.5px solid #E2E8F0',
    background: '#F8FAFC', fontSize: 13, outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: 12,
  },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  exportBtn: (color) => ({
    width: '100%', height: 48,
    background: color, color: '#fff',
    border: 'none', borderRadius: 12,
    fontSize: 14, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
    marginBottom: 10, display: 'flex',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  }),
  previewTable: {
    width: '100%', borderCollapse: 'collapse',
    fontSize: 12, marginTop: 12,
  },
  th: {
    background: '#F1F5F9', padding: '8px 10px',
    textAlign: 'left', fontSize: 11,
    fontWeight: 700, color: '#64748B',
    borderBottom: '1px solid #E2E8F0',
  },
  td: {
    padding: '8px 10px', borderBottom: '1px solid #F8FAFC',
    color: '#334155', fontSize: 12,
  },
  statRow: {
    display: 'flex', justifyContent: 'space-between',
    padding: '8px 0', borderBottom: '1px solid #F8FAFC',
  },
  statLabel: { fontSize: 13, color: '#64748B' },
  statValue: { fontSize: 13, fontWeight: 700, color: '#1E293B' },
};

export default function ExportReport() {
  const activeStoreId = useUIStore(s => s.activeStoreId);
  const stores        = useUIStore(s => s.stores);

  const [from,     setFrom]     = useState(dayjs().subtract(6, 'day').format('YYYY-MM-DD'));
  const [to,       setTo]       = useState(dayjs().format('YYYY-MM-DD'));
  const [sales,    setSales]    = useState([]);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [loaded,   setLoaded]   = useState(false);

  const activeStore = stores.find(s => s.id === activeStoreId);

  const handleLoad = async () => {
    if (!activeStoreId) return;
    setLoading(true);
    try {
      const [salesRes, prods] = await Promise.all([
        salesService.getSales(activeStoreId, { from, to, limit: 1000 }),
        storeService.getProducts(activeStoreId),
      ]);
      setSales(salesRes.sales);
      setProducts(prods);
      setLoaded(true);
    } catch {}
    finally { setLoading(false); }
  };

  const totalRevenue  = sales.reduce((s, x) => s + parseFloat(x.totalAmount), 0);
  const totalItems    = sales.reduce((s, x) => s + parseFloat(x.qty), 0);
  const avgOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0;

  // Export as CSV
  const exportCSV = () => {
    const headers = ['Date', 'Product', 'Qty', 'Unit', 'Unit Price', 'Total', 'Logged Via'];
    const rows = sales.map(s => [
      s.saleDate,
      s.product?.name || '',
      s.qty,
      s.product?.unit || '',
      s.unitPrice,
      s.totalAmount,
      s.loggedVia,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = `sales_${activeStore?.name || 'report'}_${from}_${to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export as JSON
  const exportJSON = () => {
    const data = {
      store:     activeStore?.name,
      period:    { from, to },
      summary:   { totalRevenue, totalItems, transactions: sales.length, avgOrderValue },
      sales,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = `sales_${activeStore?.name || 'report'}_${from}_${to}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Print report
  const printReport = () => window.print();

  if (!activeStoreId) return (
    <div style={{ textAlign: 'center', padding: '48px 16px', color: '#94A3B8', fontFamily: 'Noto Sans, sans-serif' }}>
      Select a store first
    </div>
  );

  return (
    <div style={S.page}>
      <p style={S.title}>📄 Export Report</p>
      <p style={S.sub}>Download your sales data in multiple formats</p>

      {/* Date range */}
      <div style={S.card}>
        <p style={S.cardTitle}>Select Date Range</p>
        <div style={S.grid2}>
          <div>
            <label style={S.label}>From</label>
            <input style={S.input} type="date"
              value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div>
            <label style={S.label}>To</label>
            <input style={S.input} type="date"
              value={to} onChange={e => setTo(e.target.value)} />
          </div>
        </div>
        <button
          style={{ ...S.exportBtn('#0F4C81'), marginBottom: 0 }}
          onClick={handleLoad}
          disabled={loading}
        >
          {loading ? '⏳ Loading…' : '🔍 Load Data'}
        </button>
      </div>

      {loaded && (
        <>
          {/* Summary */}
          <div style={S.card}>
            <p style={S.cardTitle}>Summary — {activeStore?.name}</p>
            {[
              { label: 'Period',          value: `${from} to ${to}` },
              { label: 'Total Revenue',   value: formatINR(totalRevenue) },
              { label: 'Transactions',    value: sales.length },
              { label: 'Items Sold',      value: totalItems.toFixed(1) },
              { label: 'Avg Order Value', value: formatINR(avgOrderValue) },
            ].map(s => (
              <div key={s.label} style={S.statRow}>
                <span style={S.statLabel}>{s.label}</span>
                <span style={S.statValue}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Export buttons */}
          <div style={S.card}>
            <p style={S.cardTitle}>Download</p>
            <button style={S.exportBtn('#16A34A')} onClick={exportCSV}>
              📊 Export as CSV
            </button>
            <button style={S.exportBtn('#0F4C81')} onClick={exportJSON}>
              📋 Export as JSON
            </button>
            <button style={S.exportBtn('#64748B')} onClick={printReport}>
              🖨️ Print Report
            </button>
          </div>

          {/* Preview */}
          <div style={S.card}>
            <p style={S.cardTitle}>
              Preview ({Math.min(sales.length, 10)} of {sales.length} records)
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={S.previewTable}>
                <thead>
                  <tr>
                    {['Date', 'Product', 'Qty', 'Price', 'Total'].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sales.slice(0, 10).map(s => (
                    <tr key={s.id}>
                      <td style={S.td}>{s.saleDate}</td>
                      <td style={S.td}>{s.product?.name || '—'}</td>
                      <td style={S.td}>{s.qty} {s.product?.unit}</td>
                      <td style={S.td}>{formatINR(s.unitPrice)}</td>
                      <td style={S.td}>{formatINR(s.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}