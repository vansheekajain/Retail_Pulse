import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { storeService } from '../services/store.service';
import { useUIStore } from '../store/uiStore';

const STEPS = [
  {
    id: 1,
    icon: '👋',
    title: 'Welcome to HyperLocal Forecast!',
    subtitle: 'Smart sales tracking and demand forecasting for your shop.',
    cta: 'Get Started',
  },
  {
    id: 2,
    icon: '🏪',
    title: 'Set up your store',
    subtitle: 'Tell us about your shop so we can personalize forecasts.',
    cta: 'Continue',
  },
  {
    id: 3,
    icon: '📦',
    title: 'Add your first product',
    subtitle: 'Add the products you sell to start tracking sales.',
    cta: 'Add Product',
  },
  {
    id: 4,
    icon: '🎉',
    title: "You're all set!",
    subtitle: 'Start logging sales and watch your forecasts improve over time.',
    cta: 'Go to Dashboard',
  },
];

const S = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0F4C81 0%, #030F22 100%)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: 24, fontFamily: "'Noto Sans', sans-serif",
  },
  card: {
    background: '#fff', borderRadius: 24, padding: 28,
    width: '100%', maxWidth: 380,
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
  },
  icon: { fontSize: 56, textAlign: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 8px', textAlign: 'center' },
  sub: { fontSize: 14, color: 'var(--text-muted)', margin: '0 0 24px', textAlign: 'center', lineHeight: 1.6 },
  progress: {
    display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24,
  },
  dot: (active, done) => ({
    width: active ? 24 : 8, height: 8, borderRadius: 4,
    background: done || active ? '#0F4C81' : '#E2E8F0',
    transition: 'all 0.3s ease',
  }),
  input: {
    width: '100%', height: 44, padding: '0 12px',
    borderRadius: 12, border: '1.5px solid #E2E8F0',
    background: '#F8FAFC', fontSize: 13, outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: 10,
  },
  select: {
    width: '100%', height: 44, padding: '0 12px',
    borderRadius: 12, border: '1.5px solid #E2E8F0',
    background: '#F8FAFC', fontSize: 13, outline: 'none',
    fontFamily: 'inherit', marginBottom: 10, cursor: 'pointer',
  },
  label: {
    fontSize: 11, fontWeight: 700, color: '#64748B',
    textTransform: 'uppercase', display: 'block', marginBottom: 6,
  },
  ctaBtn: {
    width: '100%', height: 48, background: '#0F4C81',
    color: '#fff', border: 'none', borderRadius: 12,
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
    fontFamily: 'inherit', marginTop: 8,
  },
  skipBtn: {
    width: '100%', height: 40, background: 'none',
    color: '#94A3B8', border: 'none', borderRadius: 12,
    fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
  },
};

const CATEGORIES = [
  { value: 'grocery', label: '🛒 Grocery / Kirana' },
  { value: 'pharmacy', label: '💊 Pharmacy / Medical' },
  { value: 'electronics', label: '📱 Electronics' },
  { value: 'clothing', label: '👗 Clothing / Fashion' },
  { value: 'restaurant', label: '🍛 Restaurant / Food' },
  { value: 'other', label: '🏪 Other' },
];

const UNITS = ['kg','g','litre','ml','piece','dozen','box','packet'];

export default function Onboarding() {
  const navigate       = useNavigate();
  const setStores      = useUIStore(s => s.setStores);
  const setActiveStore = useUIStore(s => s.setActiveStore);

  const [step, setStep]   = useState(0);
  const [saving, setSaving] = useState(false);
  const [createdStore, setCreatedStore] = useState(null);

  const [storeForm, setStoreForm] = useState({
    name: '', city: '', category: 'grocery',
  });
  const [prodForm, setProdForm] = useState({
    name: '', basePrice: '', unit: 'piece',
  });

  const handleNext = async () => {
    if (step === 1) {
      if (!storeForm.name.trim()) { toast.error('Store name is required'); return; }
      setSaving(true);
      try {
        const store = await storeService.createStore(storeForm);
        setCreatedStore(store);
        setStores([store]);
        setActiveStore(store.id);
        setStep(s => s + 1);
      } catch { toast.error('Failed to create store'); }
      finally { setSaving(false); }
      return;
    }

    if (step === 2) {
      if (!prodForm.name.trim() || !prodForm.basePrice) {
        toast.error('Product name and price are required');
        return;
      }
      setSaving(true);
      try {
        await storeService.addProduct(createdStore.id, {
          ...prodForm,
          basePrice: parseFloat(prodForm.basePrice),
        });
        setStep(s => s + 1);
      } catch { toast.error('Failed to add product'); }
      finally { setSaving(false); }
      return;
    }

    if (step === 3) {
      localStorage.setItem('onboarding_done', '1');
      navigate('/');
      return;
    }

    setStep(s => s + 1);
  };

  const skip = () => {
    localStorage.setItem('onboarding_done', '1');
    navigate('/');
  };

  const current = STEPS[step];

  return (
    <div style={S.page}>
      <div style={S.card}>
        {/* Progress dots */}
        <div style={S.progress}>
          {STEPS.map((_, i) => (
            <div key={i} style={S.dot(i === step, i < step)} />
          ))}
        </div>

        <div style={S.icon}>{current.icon}</div>
        <p style={S.title}>{current.title}</p>
        <p style={S.sub}>{current.subtitle}</p>

        {/* Step 2 — Store form */}
        {step === 1 && (
          <div>
            <label style={S.label}>Store Name *</label>
            <input style={S.input} placeholder="e.g. Ramesh General Store"
              value={storeForm.name}
              onChange={e => setStoreForm(f => ({ ...f, name: e.target.value }))} />
            <label style={S.label}>City</label>
            <input style={S.input} placeholder="e.g. Mumbai"
              value={storeForm.city}
              onChange={e => setStoreForm(f => ({ ...f, city: e.target.value }))} />
            <label style={S.label}>Store Type</label>
            <select style={S.select} value={storeForm.category}
              onChange={e => setStoreForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        )}

        {/* Step 3 — Product form */}
        {step === 2 && (
          <div>
            <label style={S.label}>Product Name *</label>
            <input style={S.input} placeholder="e.g. Aashirvaad Atta 5kg"
              value={prodForm.name}
              onChange={e => setProdForm(f => ({ ...f, name: e.target.value }))} />
            <label style={S.label}>Selling Price (₹) *</label>
            <input style={S.input} placeholder="250" type="number"
              value={prodForm.basePrice}
              onChange={e => setProdForm(f => ({ ...f, basePrice: e.target.value }))} />
            <label style={S.label}>Unit</label>
            <select style={S.select} value={prodForm.unit}
              onChange={e => setProdForm(f => ({ ...f, unit: e.target.value }))}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        )}

        <button style={S.ctaBtn} onClick={handleNext} disabled={saving}>
          {saving ? 'Saving…' : current.cta}
        </button>

        {step < 3 && step !== 1 && (
          <button style={S.skipBtn} onClick={skip}>Skip for now</button>
        )}
      </div>
    </div>
  );
}