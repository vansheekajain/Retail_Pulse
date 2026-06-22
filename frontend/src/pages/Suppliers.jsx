import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { useUIStore } from '../store/uiStore';
import { supplierService } from '../services/supplier.service';
import { storeService } from '../services/store.service';
import { formatINR } from '../utils/currencyFormat';
import dayjs from 'dayjs';

const S = {
  page: { fontFamily: "'Noto Sans', sans-serif", paddingBottom: 24 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 700, color: 'var(--text-heading)', margin: 0 },
  addBtn: {
    padding: '8px 16px', background: '#0F4C81', color: '#fff',
    border: 'none', borderRadius: 12, fontSize: 13,
    fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
  },
  tabs: { display: 'flex', gap: 4, background: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 20 },
  tab: (active) => ({
    flex: 1, padding: '8px 0', textAlign: 'center',
    borderRadius: 10, border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
    background: active ? '#fff' : 'transparent',
    color: active ? '#0F4C81' : '#64748B',
    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
  }),
  card: {
    background: '#fff', borderRadius: 16, padding: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #F1F5F9', marginBottom: 12,
  },
  supplierName: { fontSize: 15, fontWeight: 700, color: 'var(--text-heading)', margin: 0 },
  supplierMeta: { fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' },
  badge: (status) => ({
    display: 'inline-block', padding: '2px 8px',
    borderRadius: 999, fontSize: 11, fontWeight: 600,
    background: status === 'delivered' ? '#F0FDF4' : status === 'sent' ? '#EFF6FF' : '#FFF7ED',
    color: status === 'delivered' ? '#16A34A' : status === 'sent' ? '#0F4C81' : '#D97706',
  }),
  overlay: {
    position: 'fixed', inset: 0, zIndex: 50,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
  },
  modal: {
    background: '#fff', borderRadius: '24px 24px 0 0',
    padding: 20, width: '100%', maxWidth: 480,
    fontFamily: "'Noto Sans', sans-serif",
    maxHeight: '80vh', overflowY: 'auto',
  },
  modalTitle: { fontSize: 16, fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 16px' },
  label: { fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: 6 },
  input: {
    width: '100%', height: 44, padding: '0 12px',
    borderRadius: 12, border: '1.5px solid #E2E8F0',
    background: '#F8FAFC', fontSize: 13, outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: 12,
  },
  saveBtn: {
    width: '100%', height: 48, background: '#0F4C81',
    color: '#fff', border: 'none', borderRadius: 12,
    fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
  },
  empty: { textAlign: 'center', padding: '48px 16px', color: '#94A3B8', fontSize: 14 },
};

export default function Suppliers() {
  const activeStoreId = useUIStore(s => s.activeStoreId);
  const [tab,          setTab]       = useState('suppliers');
  const [suppliers,    setSuppliers] = useState([]);
  const [pos,          setPOs]       = useState([]);
  const [products,     setProducts]  = useState([]);
  const [showModal,    setShowModal] = useState(false);
  const [loading,      setLoading]   = useState(true);

  const [form, setForm] = useState({
    name: '', contactName: '', phone: '', email: '', address: '', leadDays: 2,
  });

  useEffect(() => {
    if (!activeStoreId) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      supplierService.getSuppliers(activeStoreId),
      supplierService.getPOs(activeStoreId),
      storeService.getProducts(activeStoreId),
    ]).then(([s, p, prods]) => {
      setSuppliers(s);
      setPOs(p);
      setProducts(prods);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [activeStoreId]);

  const handleSaveSupplier = async () => {
    try {
      const s = await supplierService.createSupplier({ ...form, storeId: activeStoreId });
      setSuppliers(prev => [...prev, s]);
      setShowModal(false);
      setForm({ name: '', contactName: '', phone: '', email: '', address: '', leadDays: 2 });
      toast.success('Supplier added ✓');
    } catch { toast.error('Failed to add supplier'); }
  };

  if (!activeStoreId) return <div style={S.empty}>Select a store first</div>;

  return (
    <div style={S.page}>
      <div style={S.header}>
        <p style={S.title}>🚚 {tab === 'suppliers' ? 'Suppliers' : 'Purchase Orders'}</p>
        {tab === 'suppliers' && (
          <button style={S.addBtn} onClick={() => setShowModal(true)}>+ Add Supplier</button>
        )}
      </div>

      {/* Tabs */}
      <div style={S.tabs}>
        <button style={S.tab(tab === 'suppliers')} onClick={() => setTab('suppliers')}>
          Suppliers ({suppliers.length})
        </button>
        <button style={S.tab(tab === 'orders')} onClick={() => setTab('orders')}>
          Orders ({pos.length})
        </button>
      </div>

      {/* Suppliers Tab */}
      {tab === 'suppliers' && (
        suppliers.length === 0 ? (
          <div style={S.empty}>
            <p style={{ fontSize: 32, margin: '0 0 8px' }}>🚚</p>
            <p>No suppliers yet. Add your first supplier!</p>
          </div>
        ) : (
          suppliers.map(s => (
            <div key={s.id} style={S.card}>
              <p style={S.supplierName}>{s.name}</p>
              <p style={S.supplierMeta}>
                {s.contactName && `${s.contactName} · `}
                {s.phone && `📞 ${s.phone} · `}
                Lead time: {s.leadDays} days
              </p>
              {s.email && (
                <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0' }}>
                  ✉️ {s.email}
                </p>
              )}
            </div>
          ))
        )
      )}

      {/* Orders Tab */}
      {tab === 'orders' && (
        pos.length === 0 ? (
          <div style={S.empty}>
            <p style={{ fontSize: 32, margin: '0 0 8px' }}>📋</p>
            <p>No purchase orders yet</p>
          </div>
        ) : (
          pos.map(po => (
            <div key={po.id} style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={S.supplierName}>{po.supplier?.name}</p>
                  <p style={S.supplierMeta}>
                    {dayjs(po.createdAt).format('D MMM YYYY')} ·
                    Expected: {dayjs(po.expectedDelivery).format('D MMM')}
                  </p>
                </div>
                <span style={S.badge(po.status)}>{po.status}</span>
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#0F4C81', margin: '8px 0 0' }}>
                {formatINR(po.totalAmount)}
              </p>
              {po.lineItems?.map(item => (
                <p key={item.id} style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0' }}>
                  • {item.product?.name} — {item.qty} {item.product?.unit} × {formatINR(item.unitPrice)}
                </p>
              ))}
            </div>
          ))
        )
      )}

      {/* Add Supplier Modal */}
      {showModal && (
        <div style={S.overlay} onClick={() => setShowModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <p style={S.modalTitle}>Add Supplier</p>

            {[
              { label: 'Supplier Name *', field: 'name', placeholder: 'e.g. Sharma Traders' },
              { label: 'Contact Person', field: 'contactName', placeholder: 'e.g. Ramesh Sharma' },
              { label: 'Phone', field: 'phone', placeholder: '+91 98765 43210' },
              { label: 'Email', field: 'email', placeholder: 'supplier@email.com' },
              { label: 'Address', field: 'address', placeholder: 'Full address' },
            ].map(f => (
              <div key={f.field}>
                <label style={S.label}>{f.label}</label>
                <input
                  style={S.input}
                  placeholder={f.placeholder}
                  value={form[f.field]}
                  onChange={e => setForm(prev => ({ ...prev, [f.field]: e.target.value }))}
                />
              </div>
            ))}

            <label style={S.label}>Lead Days (delivery time)</label>
            <input
              style={S.input}
              type="number" min="1" max="30"
              value={form.leadDays}
              onChange={e => setForm(prev => ({ ...prev, leadDays: parseInt(e.target.value) }))}
            />

            <button style={S.saveBtn} onClick={handleSaveSupplier}>
              Save Supplier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}