import { useState } from 'react';
import { useUIStore } from '../store/uiStore';
import { salesService } from '../services/sales.service';
import { formatINR } from '../utils/currencyFormat';
import dayjs from 'dayjs';

const S = {
  page: { fontFamily: "'Noto Sans', sans-serif", paddingBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 16px' },
  searchBox: {
    display: 'flex', gap: 8, marginBottom: 16,
  },
  input: {
    flex: 1, height: 48, padding: '0 16px',
    borderRadius: 14, border: '1.5px solid #E2E8F0',
    background: '#fff', fontSize: 14, outline: 'none',
    fontFamily: 'inherit',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  searchBtn: {
    height: 48, padding: '0 20px',
    background: '#0F4C81', color: '#fff',
    border: 'none', borderRadius: 14,
    fontSize: 14, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
  },
  filters: {
    display: 'flex', gap: 8, marginBottom: 16,
    overflowX: 'auto', paddingBottom: 4,
  },
  filterChip: (active) => ({
    flexShrink: 0,
    padding: '6px 14px',
    borderRadius: 999, border: 'none',
    cursor: 'pointer', fontSize: 12,
    fontWeight: 600, fontFamily: 'inherit',
    background: active ? '#0F4C81' : '#F1F5F9',
    color: active ? '#fff' : '#64748B',
  }),
  resultCard: {
    background: '#fff', borderRadius: 14, padding: '12px 14px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: '1px solid #F1F5F9', marginBottom: 8,
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
  },
  prodName: { fontSize: 13, fontWeight: 700, color: 'var(--text-heading)', margin: 0 },
  meta: { fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' },
  amount: { fontSize: 14, fontWeight: 700, color: '#0F4C81' },
  empty: { textAlign: 'center', padding: '48px 16px', color: '#94A3B8' },
  loader: { textAlign: 'center', padding: '32px 0', color: '#94A3B8', fontSize: 13 },
};

const PERIODS = [
  { label: 'Today',    days: 0  },
  { label: '7 Days',   days: 7  },
  { label: '30 Days',  days: 30 },
  { label: '90 Days',  days: 90 },
];

export default function SearchPage() {
  const activeStoreId = useUIStore(s => s.activeStoreId);
  const [query,   setQuery]   = useState('');
  const [period,  setPeriod]  = useState(7);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!activeStoreId) return;
    setLoading(true);
    setSearched(true);

    const to   = dayjs().format('YYYY-MM-DD');
    const from = period === 0
      ? to
      : dayjs().subtract(period, 'day').format('YYYY-MM-DD');

    try {
      const res = await salesService.getSales(activeStoreId, {
        from, to, limit: 200,
      });

      const filtered = query.trim()
        ? res.sales.filter(s =>
            s.product?.name?.toLowerCase().includes(query.toLowerCase())
          )
        : res.sales;

      setResults(filtered);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => { if (e.key === 'Enter') handleSearch(); };

  const totalRevenue = results.reduce((s, x) => s + parseFloat(x.totalAmount), 0);

  return (
    <div style={S.page}>
      <p style={S.title}>🔍 Search Sales</p>

      {/* Search input */}
      <div style={S.searchBox}>
        <input
          style={S.input}
          placeholder="Search by product name…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={onKey}
        />
        <button style={S.searchBtn} onClick={handleSearch}>Search</button>
      </div>

      {/* Period filters */}
      <div style={S.filters}>
        {PERIODS.map(p => (
          <button key={p.days} style={S.filterChip(period === p.days)}
            onClick={() => setPeriod(p.days)}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <p style={S.loader}>🔍 Searching…</p>
      ) : !searched ? (
        <div style={S.empty}>
          <p style={{ fontSize: 32, margin: '0 0 8px' }}>🔍</p>
          <p>Search for a product or tap Search to see all sales</p>
        </div>
      ) : results.length === 0 ? (
        <div style={S.empty}>
          <p style={{ fontSize: 32, margin: '0 0 8px' }}>😕</p>
          <p>No results found for "{query}"</p>
        </div>
      ) : (
        <>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 12,
            padding: '10px 14px',
            background: '#EFF6FF', borderRadius: 12,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>
              {results.length} results
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0F4C81' }}>
              {formatINR(totalRevenue)}
            </span>
          </div>

          {results.map(s => (
            <div key={s.id} style={S.resultCard}>
              <div>
                <p style={S.prodName}>{s.product?.name || '—'}</p>
                <p style={S.meta}>
                  {s.qty} {s.product?.unit} ·
                  {dayjs(s.saleDate).format('D MMM YYYY')} ·
                  {s.loggedVia}
                </p>
              </div>
              <p style={S.amount}>{formatINR(s.totalAmount)}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}