import { useState, useEffect, useRef } from 'react';
import { useUIStore } from '../store/uiStore';
import { elasticityService } from '../services/elasticity.service';
import { storeService } from '../services/store.service';
import { toast } from 'react-hot-toast';

const S = {
  page: { fontFamily: "'Noto Sans', sans-serif", paddingBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px' },
  sub:   { fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' },
  mapBox: {
    borderRadius: 16, overflow: 'hidden',
    border: '1px solid #E2E8F0', marginBottom: 16,
    height: 320, background: '#F1F5F9',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  card: {
    background: '#fff', borderRadius: 16, padding: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #F1F5F9', marginBottom: 16,
  },
  cardTitle: { fontSize: 13, fontWeight: 700, color: 'var(--text-main)', margin: '0 0 12px' },
  addBtn: {
    width: '100%', height: 44, background: '#0F4C81',
    color: '#fff', border: 'none', borderRadius: 12,
    fontSize: 13, fontWeight: 700, cursor: 'pointer',
    fontFamily: 'inherit', marginBottom: 16,
  },
  input: {
    width: '100%', height: 44, padding: '0 12px',
    borderRadius: 12, border: '1.5px solid #E2E8F0',
    background: '#F8FAFC', fontSize: 13, outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: 10,
  },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 },
  compRow: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 0', borderBottom: '1px solid #F8FAFC',
  },
  impactBadge: (level) => ({
    padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700,
    background: level === 'Critical' ? '#FEE2E2'
      : level === 'High' ? '#FEF3C7'
      : level === 'Medium' ? '#EFF6FF'
      : '#F0FDF4',
    color: level === 'Critical' ? '#DC2626'
      : level === 'High' ? '#D97706'
      : level === 'Medium' ? '#0F4C81'
      : '#16A34A',
  }),
  analyzeBtn: {
    width: '100%', height: 44, background: '#EFF6FF',
    color: '#0F4C81', border: '1px solid #BFDBFE',
    borderRadius: 12, fontSize: 13, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
  },
  resultCard: {
    background: '#F0FDF4', borderRadius: 12, padding: 14,
    border: '1px solid #BBF7D0', marginTop: 12,
  },
  impactScore: { fontSize: 28, fontWeight: 700, color: '#0F4C81', margin: 0 },
  empty: { textAlign: 'center', padding: '32px 16px', color: '#94A3B8', fontSize: 14 },
};

export default function CompetitorMap() {
  const stores        = useUIStore(s => s.stores);
  const activeStoreId = useUIStore(s => s.activeStoreId);

  const [competitors,  setCompetitors]  = useState([]);
  const [analysis,     setAnalysis]     = useState(null);
  const [analyzing,    setAnalyzing]    = useState(false);
  const [showForm,     setShowForm]     = useState(false);
  const [activeStore,  setActiveStoreObj] = useState(null);
  const [locating,     setLocating]     = useState(false);

  const [form, setForm] = useState({
    name: '', lat: '', lng: '', distance: '',
  });

  useEffect(() => {
    const store = stores.find(s => s.id === activeStoreId);
    setActiveStoreObj(store || null);

    // Load saved competitors from localStorage
    const saved = localStorage.getItem(`competitors_${activeStoreId}`);
    if (saved) setCompetitors(JSON.parse(saved));
    else setCompetitors([]);
  }, [activeStoreId]);

  const saveCompetitors = (list) => {
    setCompetitors(list);
    localStorage.setItem(`competitors_${activeStoreId}`, JSON.stringify(list));
  };

  const handleGetLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({
          ...f,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        }));
        setLocating(false);
      },
      () => {
        toast.error('Could not get location. Enter manually.');
        setLocating(false);
      }
    );
  };

  const handleAddCompetitor = () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (!form.lat || !form.lng) { toast.error('Location is required'); return; }

    const newComp = {
      id:   Date.now(),
      name: form.name,
      lat:  parseFloat(form.lat),
      lng:  parseFloat(form.lng),
    };

    saveCompetitors([...competitors, newComp]);
    setForm({ name: '', lat: '', lng: '', distance: '' });
    setShowForm(false);
    toast.success('Competitor added ✓');
  };

  const handleRemove = (id) => {
    saveCompetitors(competitors.filter(c => c.id !== id));
    setAnalysis(null);
  };

  const handleAnalyze = async () => {
    if (!activeStore?.lat || !activeStore?.lng) {
      toast.error('Your store location is not set. Update in Settings.');
      return;
    }
    if (competitors.length === 0) {
      toast.error('Add at least one competitor first.');
      return;
    }
    setAnalyzing(true);
    try {
      const result = await elasticityService.getCompetitorImpact(
        activeStoreId,
        competitors
      );
      setAnalysis(result);
    } catch {
      toast.error('Analysis failed. Make sure Python is running.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (!activeStoreId) return (
    <div style={S.empty}>Select a store first</div>
  );

  return (
    <div style={S.page}>
      <p style={S.title}>🗺️ Competitor Map</p>
      <p style={S.sub}>Mark nearby competitors and analyze their impact on your sales</p>

      {/* Map placeholder */}
      <div style={S.mapBox}>
        <div style={{ textAlign: 'center', color: '#94A3B8' }}>
          <p style={{ fontSize: 40, margin: '0 0 8px' }}>🗺️</p>
          <p style={{ fontSize: 14, fontWeight: 600 }}>Interactive Map</p>
          <p style={{ fontSize: 12 }}>
            Add coordinates below to mark competitors
          </p>
          {activeStore?.lat && activeStore?.lng && (
            <p style={{ fontSize: 11, marginTop: 8, color: '#0F4C81', fontWeight: 600 }}>
              📍 Your store: {activeStore.lat}, {activeStore.lng}
            </p>
          )}
        </div>
      </div>

      {/* Add competitor */}
      <button style={S.addBtn} onClick={() => setShowForm(v => !v)}>
        {showForm ? '✕ Cancel' : '+ Add Competitor'}
      </button>

      {showForm && (
        <div style={S.card}>
          <p style={S.cardTitle}>Add Competitor</p>
          <input style={S.input} placeholder="Competitor name *"
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <div style={S.grid2}>
            <input style={{ ...S.input, marginBottom: 0 }} placeholder="Latitude"
              type="number" value={form.lat}
              onChange={e => setForm(f => ({ ...f, lat: e.target.value }))} />
            <input style={{ ...S.input, marginBottom: 0 }} placeholder="Longitude"
              type="number" value={form.lng}
              onChange={e => setForm(f => ({ ...f, lng: e.target.value }))} />
          </div>
          <button
            style={{ ...S.analyzeBtn, marginBottom: 10 }}
            onClick={handleGetLocation}
            disabled={locating}
          >
            {locating ? '📍 Getting location…' : '📍 Use my current location'}
          </button>
          <button style={S.addBtn} onClick={handleAddCompetitor}>
            Save Competitor
          </button>
        </div>
      )}

      {/* Competitor list */}
      <div style={S.card}>
        <p style={S.cardTitle}>
          Competitors Marked ({competitors.length})
        </p>
        {competitors.length === 0 ? (
          <p style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', padding: '16px 0' }}>
            No competitors marked yet
          </p>
        ) : (
          <>
            {competitors.map(c => (
              <div key={c.id} style={S.compRow}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', margin: 0 }}>
                    🏪 {c.name}
                  </p>
                  <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>
                    {c.lat}, {c.lng}
                  </p>
                </div>
                <button onClick={() => handleRemove(c.id)} style={{
                  background: '#FEE2E2', border: 'none', borderRadius: 8,
                  padding: '4px 10px', cursor: 'pointer', fontSize: 12,
                  fontWeight: 600, color: '#DC2626', fontFamily: 'inherit',
                }}>
                  Remove
                </button>
              </div>
            ))}

            <button
              style={{ ...S.analyzeBtn, marginTop: 16 }}
              onClick={handleAnalyze}
              disabled={analyzing}
            >
              {analyzing ? '🔍 Analyzing…' : '🔍 Analyze Impact'}
            </button>
          </>
        )}
      </div>

      {/* Analysis results */}
      {analysis && (
        <div style={S.card}>
          <p style={S.cardTitle}>Impact Analysis</p>

          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 4px' }}>
              Overall Competition Impact
            </p>
            <p style={S.impactScore}>
              {(analysis.impact_factor * 100).toFixed(0)}%
            </p>
            <div style={{
              height: 8, borderRadius: 4, background: '#E2E8F0',
              marginTop: 8, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: 4,
                background: analysis.impact_factor > 0.6 ? '#DC2626'
                  : analysis.impact_factor > 0.3 ? '#D97706' : '#16A34A',
                width: `${analysis.impact_factor * 100}%`,
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>

          {analysis.analysis?.map((a, i) => (
            <div key={i} style={S.compRow}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', margin: 0 }}>
                  {a.name}
                </p>
                <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>
                  {a.distance_km} km away
                </p>
              </div>
              <span style={S.impactBadge(a.impact_level)}>{a.impact_level}</span>
            </div>
          ))}

          <div style={S.resultCard}>
            <p style={{ fontSize: 13, color: '#14532D', margin: 0, lineHeight: 1.5 }}>
              💡 {analysis.recommendation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}