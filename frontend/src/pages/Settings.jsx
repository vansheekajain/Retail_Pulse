import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { storeService } from '../services/store.service';

// ── Styles using CSS variables (auto dark/light) ──────────────────────────
const S = {
  page: {
    fontFamily: "'Noto Sans', sans-serif",
    paddingBottom: 40,
    background: 'var(--bg-page)',
    minHeight: '100vh',
  },
  section: {
    background:   'var(--bg-card)',
    borderRadius: 16,
    padding:      16,
    boxShadow:    'var(--shadow)',
    border:       '1px solid var(--border)',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13, fontWeight: 700,
    color: 'var(--text-main)',
    margin: '0 0 16px',
  },
  label: {
    fontSize: 11, fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    display: 'block', marginBottom: 6,
  },
  input: {
    width: '100%', height: 44,
    padding: '0 12px', borderRadius: 12,
    border: '1.5px solid var(--border-input)',
    background: 'var(--bg-input)',
    color: 'var(--text-main)',
    fontSize: 13, outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit', marginBottom: 12,
  },
  select: {
    width: '100%', height: 44,
    padding: '0 12px', borderRadius: 12,
    border: '1.5px solid var(--border-input)',
    background: 'var(--bg-input)',
    color: 'var(--text-main)',
    fontSize: 13, outline: 'none',
    fontFamily: 'inherit', marginBottom: 12, cursor: 'pointer',
  },
  saveBtn: {
    width: '100%', height: 48,
    background: 'var(--primary)', color: '#fff',
    border: 'none', borderRadius: 12,
    fontSize: 14, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
  },
  dangerBtn: {
    width: '100%', height: 48,
    background: 'rgba(220, 38, 38, 0.12)', color: '#DC2626',
    border: 'none', borderRadius: 12,
    fontSize: 14, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit', marginTop: 8,
  },
  productRow: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid var(--border)',
  },
  productName: {
    fontSize: 13, fontWeight: 600,
    color: 'var(--text-main)', margin: 0,
  },
  productMeta: {
    fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0',
  },
  addBtn: {
    padding: '8px 14px', background: 'var(--primaryLight)',
    color: 'var(--primary)', border: '1px solid #BFDBFE',
    borderRadius: 10, fontSize: 12, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
  },
  overlay: {
    position: 'fixed', inset: 0, zIndex: 50,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
  },
  modal: {
    background: 'var(--bg-card)',
    borderRadius: '24px 24px 0 0',
    padding: 20, width: '100%', maxWidth: 480,
    fontFamily: "'Noto Sans', sans-serif",
  },
  modalTitle: {
    fontSize: 16, fontWeight: 700,
    color: 'var(--text-heading)', margin: '0 0 16px',
  },
  confirmBtn: {
    width: '100%', height: 48,
    background: '#0F4C81', color: '#fff',
    border: 'none', borderRadius: 12,
    fontSize: 14, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
  },
};

const CATEGORIES = [
  { value: 'grocery',     label: 'Grocery / Kirana' },
  { value: 'pharmacy',    label: 'Pharmacy / Medical' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing',    label: 'Clothing / Fashion' },
  { value: 'restaurant',  label: 'Restaurant / Food' },
  { value: 'other',       label: 'Other' },
];

const UNITS = ['kg', 'g', 'litre', 'ml', 'piece', 'dozen', 'box', 'packet'];

export default function Settings() {
  const { t, i18n }    = useTranslation();
  const user           = useAuthStore(s => s.user);
  const clearAuth      = useAuthStore(s => s.clearAuth);
  const stores         = useUIStore(s => s.stores);
  const activeStoreId  = useUIStore(s => s.activeStoreId);
  const setStores      = useUIStore(s => s.setStores);
  const setActiveStore = useUIStore(s => s.setActiveStore);

  // ── Dark mode ─────────────────────────────────────────────────────────────
  const darkMode       = useUIStore(s => s.darkMode);
  const toggleDarkMode = useUIStore(s => s.toggleDarkMode);

  const [products,     setProducts]     = useState([]);
  const [showAddStore, setShowAddStore] = useState(false);
  const [showAddProd,  setShowAddProd]  = useState(false);

  const [storeForm, setStoreForm] = useState({
    name: '', city: '', state: '', pincode: '', category: 'grocery',
  });

  const [prodForm, setProdForm] = useState({
    name: '', unit: 'piece', basePrice: '',
    currentStock: '', reorderLevel: '10',
  });

  useEffect(() => {
    if (!activeStoreId) return;
    storeService.getProducts(activeStoreId).then(setProducts).catch(() => {});
  }, [activeStoreId]);

  const handleAddStore = async () => {
    if (!storeForm.name.trim()) { toast.error('Store name is required'); return; }
    try {
      const store   = await storeService.createStore(storeForm);
      const updated = [...stores, store];
      setStores(updated);
      setActiveStore(store.id);
      setShowAddStore(false);
      setStoreForm({ name: '', city: '', state: '', pincode: '', category: 'grocery' });
      toast.success('Store created ✓');
    } catch { toast.error('Failed to create store'); }
  };

  const handleAddProduct = async () => {
    if (!prodForm.name.trim()) { toast.error('Product name is required'); return; }
    if (!prodForm.basePrice)   { toast.error('Price is required'); return; }
    try {
      const prod = await storeService.addProduct(activeStoreId, {
        ...prodForm,
        basePrice:    parseFloat(prodForm.basePrice),
        currentStock: parseFloat(prodForm.currentStock) || 0,
        reorderLevel: parseFloat(prodForm.reorderLevel) || 10,
      });
      setProducts(prev => [...prev, prod]);
      setShowAddProd(false);
      setProdForm({ name: '', unit: 'piece', basePrice: '', currentStock: '', reorderLevel: '10' });
      toast.success('Product added ✓');
    } catch { toast.error('Failed to add product'); }
  };

  return (
    <div style={S.page}>

      {/* ── Account ───────────────────────────────────────────────────────── */}
      <div style={S.section}>
        <p style={S.sectionTitle}>👤 Account</p>

        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>
          {user?.name}
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 16px' }}>
          {user?.email}
        </p>

        {/* Language */}
        <label style={S.label}>Language</label>
        <select
          style={S.select}
          value={i18n.language}
          onChange={e => i18n.changeLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
        </select>

        {/* Dark Mode Toggle */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 0',
          borderTop: '1px solid var(--border)',
          marginTop: 4,
        }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
              🌙 Dark Mode
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
              {darkMode ? 'On — Dark theme active' : 'Off — Light theme active'}
            </p>
          </div>

          {/* Toggle Switch */}
          <div
            onClick={toggleDarkMode}
            style={{
              width: 52, height: 30,
              borderRadius: 999,
              background: darkMode ? '#0F4C81' : '#E2E8F0',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.25s',
              flexShrink: 0,
            }}
          >
            <div style={{
              position: 'absolute',
              top: 4,
              left: darkMode ? 26 : 4,
              width: 22, height: 22,
              borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
              transition: 'left 0.25s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
            }}>
              {darkMode ? '🌙' : '☀️'}
            </div>
          </div>
        </div>
      </div>

      {/* ── My Stores ─────────────────────────────────────────────────────── */}
      <div style={S.section}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 16,
        }}>
          <p style={{ ...S.sectionTitle, margin: 0 }}>🏪 My Stores</p>
          <button style={S.addBtn} onClick={() => setShowAddStore(true)}>+ Add Store</button>
        </div>

        {stores.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
            No stores yet
          </p>
        ) : (
          stores.map(store => (
            <div key={store.id} style={{
              ...S.productRow,
              background: store.id === activeStoreId ? '#EFF6FF' : 'transparent',
              borderRadius: 10,
              padding: '10px 12px',
              marginBottom: 4,
            }}>
              <div>
                <p style={S.productName}>{store.name}</p>
                <p style={S.productMeta}>{store.city} · {store.category}</p>
              </div>
              {store.id === activeStoreId ? (
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)' }}>Active</span>
              ) : (
                <button style={S.addBtn} onClick={() => setActiveStore(store.id)}>Select</button>
              )}
            </div>
          ))
        )}
      </div>

      {/* ── Products ──────────────────────────────────────────────────────── */}
      {activeStoreId && (
        <div style={S.section}>
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 16,
          }}>
            <p style={{ ...S.sectionTitle, margin: 0 }}>📦 Products</p>
            <button style={S.addBtn} onClick={() => setShowAddProd(true)}>+ Add Product</button>
          </div>

          {products.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
              No products yet
            </p>
          ) : (
            products.map(p => (
              <div key={p.id} style={S.productRow}>
                <div>
                  <p style={S.productName}>{p.name}</p>
                  <p style={S.productMeta}>
                    ₹{parseFloat(p.basePrice).toLocaleString('en-IN')} / {p.unit} ·
                    Stock: {p.currentStock}
                  </p>
                </div>
                {parseFloat(p.currentStock) <= parseFloat(p.reorderLevel) && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    color: '#DC2626', background: '#FEE2E2',
                    padding: '2px 8px', borderRadius: 999,
                  }}>
                    Low Stock
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Account Actions ───────────────────────────────────────────────── */}
      <div style={S.section}>
        <p style={S.sectionTitle}>⚙️ Account Actions</p>
        <button
          style={S.dangerBtn}
          onClick={() => { clearAuth(); window.location.href = '/login'; }}
        >
          🚪 Logout
        </button>
      </div>

      {/* ── Add Store Modal ───────────────────────────────────────────────── */}
      {showAddStore && (
        <div style={S.overlay} onClick={() => setShowAddStore(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <p style={S.modalTitle}>Add Store</p>
            {[
              { label: 'Store Name *', field: 'name',    placeholder: 'e.g. Ramesh General Store' },
              { label: 'City',         field: 'city',    placeholder: 'e.g. Mumbai' },
              { label: 'State',        field: 'state',   placeholder: 'e.g. Maharashtra' },
              { label: 'PIN Code',     field: 'pincode', placeholder: '400001' },
            ].map(f => (
              <div key={f.field}>
                <label style={S.label}>{f.label}</label>
                <input
                  style={S.input}
                  placeholder={f.placeholder}
                  value={storeForm[f.field]}
                  onChange={e => setStoreForm(p => ({ ...p, [f.field]: e.target.value }))}
                />
              </div>
            ))}
            <label style={S.label}>Category</label>
            <select
              style={S.select}
              value={storeForm.category}
              onChange={e => setStoreForm(p => ({ ...p, category: e.target.value }))}
            >
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <button style={S.confirmBtn} onClick={handleAddStore}>Create Store</button>
          </div>
        </div>
      )}

      {/* ── Add Product Modal ─────────────────────────────────────────────── */}
      {showAddProd && (
        <div style={S.overlay} onClick={() => setShowAddProd(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <p style={S.modalTitle}>Add Product</p>
            {[
              { label: 'Product Name *',    field: 'name',         placeholder: 'e.g. Aashirvaad Atta 5kg' },
              { label: 'Selling Price (₹)*', field: 'basePrice',   placeholder: '250',  type: 'number' },
              { label: 'Current Stock',     field: 'currentStock', placeholder: '50',   type: 'number' },
              { label: 'Reorder Level',     field: 'reorderLevel', placeholder: '10',   type: 'number' },
            ].map(f => (
              <div key={f.field}>
                <label style={S.label}>{f.label}</label>
                <input
                  style={S.input}
                  placeholder={f.placeholder}
                  type={f.type || 'text'}
                  value={prodForm[f.field]}
                  onChange={e => setProdForm(p => ({ ...p, [f.field]: e.target.value }))}
                />
              </div>
            ))}
            <label style={S.label}>Unit</label>
            <select
              style={S.select}
              value={prodForm.unit}
              onChange={e => setProdForm(p => ({ ...p, unit: e.target.value }))}
            >
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <button style={S.confirmBtn} onClick={handleAddProduct}>Add Product</button>
          </div>
        </div>
      )}

    </div>
  );
}