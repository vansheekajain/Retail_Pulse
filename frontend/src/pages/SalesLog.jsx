import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import { useUIStore } from '../store/uiStore';
import { salesService } from '../services/sales.service';
import { storeService } from '../services/store.service';
import { formatINR } from '../utils/currencyFormat';

const S = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 112px)',
    margin: '0 -16px',
    fontFamily: "'Noto Sans', sans-serif",
  },
  header: {
    padding: '12px 16px',
    background: '#fff',
    borderBottom: '1px solid #E2E8F0',
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--text-heading)',
    margin: 0,
  },
  headerSub: {
    fontSize: 11,
    color: '#94A3B8',
    margin: '2px 0 0',
  },
  chatArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 16px',
    background: '#F1F5F9',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  dateDivider: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    margin: '4px 0 8px',
  },
  divLine: { flex: 1, height: 1, background: '#CBD5E1' },
  divText: {
    fontSize: 10,
    fontWeight: 600,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 8,
    textAlign: 'center',
    padding: '48px 0',
  },
  bubbleWrap: { display: 'flex', justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '78%',
    background: '#0F4C81',
    color: '#fff',
    borderRadius: '16px 16px 4px 16px',
    padding: '10px 14px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
  },
  bubbleName: {
    fontSize: 13,
    fontWeight: 700,
    margin: '0 0 2px',
  },
  bubbleMeta: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    margin: 0,
  },
  bubbleFooter: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  bubbleTotal: {
    fontSize: 16,
    fontWeight: 700,
    margin: 0,
    lineHeight: 1,
  },
  bubbleTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.45)',
    margin: 0,
  },
  chipsBar: {
    background: '#fff',
    borderTop: '1px solid #F1F5F9',
    padding: '8px 16px 10px',
    flexShrink: 0,
  },
  chipsLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 8,
  },
  chipsRow: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    paddingBottom: 2,
  },
  chip: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    background: '#EFF6FF',
    border: '1px solid #BFDBFE',
    borderRadius: 999,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 700,
    color: '#1D4ED8',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  },
  inputBar: {
    background: '#fff',
    borderTop: '1px solid #E2E8F0',
    padding: '10px 12px',
    flexShrink: 0,
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
    height: 44,
    padding: '0 14px',
    borderRadius: 12,
    border: '1.5px solid #E2E8F0',
    background: '#F8FAFC',
    fontSize: 13,
    outline: 'none',
    fontFamily: 'inherit',
  },
  numInput: {
    width: 64,
    height: 44,
    padding: '0 8px',
    borderRadius: 12,
    border: '1.5px solid #E2E8F0',
    background: '#F8FAFC',
    fontSize: 13,
    fontWeight: 700,
    textAlign: 'center',
    outline: 'none',
    fontFamily: 'inherit',
  },
  sendBtn: (active) => ({
    width: 44,
    height: 44,
    borderRadius: 12,
    flexShrink: 0,
    background: active ? '#0F4C81' : '#E2E8F0',
    border: 'none',
    cursor: active ? 'pointer' : 'default',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
  }),
  suggest: {
    marginBottom: 8,
    background: '#fff',
    border: '1px solid #E2E8F0',
    borderRadius: 12,
    maxHeight: 160,
    overflowY: 'auto',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  },
  suggestItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    cursor: 'pointer',
    fontSize: 13,
    borderBottom: '1px solid #F8FAFC',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  modal: {
    background: '#fff',
    borderRadius: '24px 24px 0 0',
    padding: 20,
    width: '100%',
    maxWidth: 480,
    fontFamily: "'Noto Sans', sans-serif",
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalName: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1E293B',
    margin: 0,
  },
  modalSub: {
    fontSize: 11,
    color: '#94A3B8',
    margin: '2px 0 0',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#F1F5F9',
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
  },
  modalGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    display: 'block',
    marginBottom: 6,
  },
  modalInput: {
    width: '100%',
    height: 44,
    padding: '0 12px',
    borderRadius: 12,
    border: '1.5px solid #E2E8F0',
    background: '#F8FAFC',
    fontSize: 14,
    fontWeight: 700,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  totalRow: {
    background: '#EFF6FF',
    borderRadius: 12,
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  confirmBtn: (disabled) => ({
    width: '100%',
    height: 48,
    background: disabled ? '#94A3B8' : '#0F4C81',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
  }),
};

export default function SalesLog() {
  const { t }         = useTranslation();
  const activeStoreId = useUIStore(s => s.activeStoreId);
  const bottomRef     = useRef(null);

  const [products, setProducts] = useState([]);
  const [sales,    setSales]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [sending,  setSending]  = useState(false);
  const [modal,    setModal]    = useState(null);
  const [query,    setQuery]    = useState('');
  const [selected, setSelected] = useState(null);
  const [qty,      setQty]      = useState('');
  const [price,    setPrice]    = useState('');
  const [showSug,  setShowSug]  = useState(false);

  const filtered = query.length > 0
    ? products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  useEffect(() => {
    if (!activeStoreId) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    const today = dayjs().format('YYYY-MM-DD');

    Promise.all([
      storeService.getProducts(activeStoreId),
      salesService.getSales(activeStoreId, {
        from: today, to: today, limit: 100,
      }),
    ]).then(([prods, res]) => {
      if (cancelled) return;
      setProducts(prods);
      setSales(res.sales.reverse());
    }).catch(() => {
      if (!cancelled) toast.error(t('common.error'));
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [activeStoreId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sales]);

  const logSale = async ({ productId, qty: q, unitPrice: p }) => {
    setSending(true);
    try {
      const sale = await salesService.createSale(activeStoreId, {
        productId,
        qty: q,
        unitPrice: p,
        loggedVia: 'chat',
        saleDate: dayjs().format('YYYY-MM-DD'),
      });
      const product = products.find(x => x.id === productId);
      setSales(prev => [...prev, { ...sale, product }]);
      setModal(null);
      setQuery('');
      setSelected(null);
      setQty('');
      setPrice('');
      toast.success(t('sales.saved'));
    } catch {
      toast.error(t('sales.error_save'));
    } finally {
      setSending(false);
    }
  };

  const selectProduct = (p) => {
    setSelected(p);
    setQuery(p.name);
    setPrice(String(p.basePrice));
    setQty('1');
    setShowSug(false);
  };

  const handleSend = () => {
    if (!selected || !qty || parseFloat(qty) <= 0) return;
    logSale({
      productId: selected.id,
      qty: parseFloat(qty),
      unitPrice: parseFloat(price) || parseFloat(selected.basePrice),
    });
  };

  const onKey = (e) => {
    if (e.key === 'Enter') {
      if (!selected && filtered.length) selectProduct(filtered[0]);
      else handleSend();
    }
    if (e.key === 'Escape') {
      setShowSug(false);
      setQuery('');
      setSelected(null);
    }
  };

  const canSend = selected && parseFloat(qty) > 0 && !sending;

  if (!activeStoreId) return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh',
      fontFamily: "'Noto Sans', sans-serif",
    }}>
      <p style={{ color: '#94A3B8', fontSize: 14 }}>
        {t('dashboard.no_store_selected')}
      </p>
    </div>
  );

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        width: 32, height: 32,
        border: '3px solid #E2E8F0',
        borderTop: '3px solid #0F4C81',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  );

  return (
    <div style={S.page}>

      {/* Header */}
      <div style={S.header}>
        <p style={S.headerTitle}>{t('sales.sales_log')}</p>
        <p style={S.headerSub}>
          {dayjs().format('dddd, D MMMM YYYY')}
        </p>
      </div>

      {/* Chat area */}
      <div style={S.chatArea}>
        <div style={S.dateDivider}>
          <div style={S.divLine} />
          <span style={S.divText}>
            {t('common.today')} · {dayjs().format('D MMM')}
          </span>
          <div style={S.divLine} />
        </div>

        {sales.length === 0 ? (
          <div style={S.empty}>
            <span style={{ fontSize: 40 }}>🛒</span>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#64748B', margin: 0 }}>
              {t('dashboard.no_sales_today')}
            </p>
            <p style={{ fontSize: 12, color: '#94A3B8', margin: '4px 0 0' }}>
              {t('dashboard.no_sales_sub')}
            </p>
          </div>
        ) : (
          sales.map(sale => (
            <div key={sale.id} style={S.bubbleWrap}>
              <div style={S.bubble}>
                <p style={S.bubbleName}>
                  {sale.product?.name || '—'}
                </p>
                <p style={S.bubbleMeta}>
                  {sale.qty} {sale.product?.unit || 'pc'} × {formatINR(sale.unitPrice)}
                </p>
                <div style={S.bubbleFooter}>
                  <p style={S.bubbleTotal}>
                    {formatINR(sale.totalAmount)}
                  </p>
                  <p style={S.bubbleTime}>
                    {dayjs(sale.createdAt).format('h:mm A')}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick chips */}
      {products.length > 0 && (
        <div style={S.chipsBar}>
          <p style={S.chipsLabel}>{t('sales.quick_log')}</p>
          <div style={S.chipsRow}>
            {products.map(p => (
              <button
                key={p.id}
                style={S.chip}
                onClick={() => setModal({ product: p })}
              >
                {p.name}
                <span style={{ fontWeight: 400, color: '#60A5FA' }}>
                  ₹{parseFloat(p.basePrice).toLocaleString('en-IN')}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div style={S.inputBar}>
        {showSug && filtered.length > 0 && (
          <div style={S.suggest}>
            {filtered.map(p => (
              <div
                key={p.id}
                style={S.suggestItem}
                onMouseDown={() => selectProduct(p)}
              >
                <span style={{ fontWeight: 600, color: '#1E293B' }}>
                  {p.name}
                </span>
                <span style={{ fontSize: 11, color: '#94A3B8' }}>
                  ₹{parseFloat(p.basePrice).toLocaleString('en-IN')} / {p.unit}
                </span>
              </div>
            ))}
          </div>
        )}
        <div style={S.inputRow}>
          <input
            style={S.textInput}
            placeholder={t('sales.type_message')}
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelected(null);
              setShowSug(true);
            }}
            onFocus={() => setShowSug(true)}
            onBlur={() => setTimeout(() => setShowSug(false), 150)}
            onKeyDown={onKey}
          />
          {selected && (
            <>
              <input
                style={S.numInput}
                type="number"
                min="0.1"
                step="0.1"
                placeholder="Qty"
                value={qty}
                onChange={e => setQty(e.target.value)}
                onKeyDown={onKey}
                autoFocus
              />
              <input
                style={S.numInput}
                type="number"
                min="0"
                placeholder="₹"
                value={price}
                onChange={e => setPrice(e.target.value)}
                onKeyDown={onKey}
              />
            </>
          )}
          <button
            style={S.sendBtn(canSend)}
            onClick={handleSend}
            disabled={!canSend}
          >
            ➤
          </button>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <QuickModal
          product={modal.product}
          sending={sending}
          onConfirm={logSale}
          onClose={() => setModal(null)}
          t={t}
        />
      )}
    </div>
  );
}

function QuickModal({ product, sending, onConfirm, onClose, t }) {
  const [qty,   setQty]   = useState('1');
  const [price, setPrice] = useState(String(product.basePrice));
  const total = (parseFloat(qty) || 0) * (parseFloat(price) || 0);
  const ok = !sending && parseFloat(qty) > 0;

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <div>
            <p style={S.modalName}>{product.name}</p>
            <p style={S.modalSub}>
              {product.unit} · {t('sales.log_sale')}
            </p>
          </div>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={S.modalGrid}>
          <div>
            <label style={S.modalLabel}>
              {t('sales.quantity')} ({product.unit})
            </label>
            <input
              style={S.modalInput}
              type="number"
              min="0.1"
              step="0.1"
              value={qty}
              onChange={e => setQty(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label style={S.modalLabel}>
              {t('sales.unit_price')} (₹)
            </label>
            <input
              style={S.modalInput}
              type="number"
              min="0"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
          </div>
        </div>

        <div style={S.totalRow}>
          <span style={{ fontSize: 13, color: '#1D4ED8', fontWeight: 500 }}>
            {t('sales.total')}
          </span>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#1E3A5F' }}>
            {formatINR(total)}
          </span>
        </div>

        <button
          style={S.confirmBtn(!ok)}
          disabled={!ok}
          onClick={() => onConfirm({
            productId: product.id,
            qty: parseFloat(qty),
            unitPrice: parseFloat(price),
          })}
        >
          {sending ? t('sales.saving') : t('sales.save')}
        </button>
      </div>
    </div>
  );
}