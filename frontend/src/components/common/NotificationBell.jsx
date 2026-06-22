import { useState } from 'react';
import { useAnomalies } from '../../hooks/useAnomalies';
import { useNavigate } from 'react-router-dom';

const S = {
  wrap: { position: 'relative' },
  btn: {
    width: 36, height: 36, borderRadius: 10,
    background: 'none', border: '1px solid #E2E8F0',
    cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: 18, position: 'relative',
  },
  badge: {
    position: 'absolute', top: -4, right: -4,
    width: 16, height: 16, borderRadius: '50%',
    background: '#DC2626', color: '#fff',
    fontSize: 9, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '2px solid #fff',
  },
  dropdown: {
    position: 'absolute', top: 44, right: 0,
    background: '#fff', border: '1px solid #E2E8F0',
    borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
    zIndex: 50, minWidth: 260, overflow: 'hidden',
  },
  header: {
    padding: '12px 16px', borderBottom: '1px solid #F1F5F9',
    fontSize: 13, fontWeight: 700, color: '#1E293B',
  },
  item: {
    display: 'flex', alignItems: 'flex-start', gap: 10,
    padding: '10px 16px', borderBottom: '1px solid #F8FAFC',
    cursor: 'pointer',
  },
  itemIcon: { fontSize: 20, flexShrink: 0, marginTop: 1 },
  itemText: { fontSize: 12, fontWeight: 600, color: '#334155', margin: 0 },
  itemSub:  { fontSize: 11, color: '#94A3B8', margin: '2px 0 0' },
  empty: {
    padding: '24px 16px', textAlign: 'center',
    fontSize: 13, color: '#94A3B8',
  },
  viewAll: {
    padding: '12px 16px', textAlign: 'center',
    fontSize: 12, fontWeight: 700, color: '#0F4C81',
    cursor: 'pointer', border: 'none', background: 'none',
    width: '100%', fontFamily: 'inherit',
  },
};

export default function NotificationBell() {
  const navigate             = useNavigate();
  const { anomalies, hasAlerts } = useAnomalies();
  const [open, setOpen]       = useState(false);

  const highAlerts = anomalies.filter(a => a.severity === 'high').slice(0, 5);

  return (
    <div style={S.wrap}>
      <button style={S.btn} onClick={() => setOpen(v => !v)}>
        🔔
        {hasAlerts && (
          <div style={S.badge}>{highAlerts.length}</div>
        )}
      </button>

      {open && (
        <>
          <div style={S.dropdown}>
            <div style={S.header}>
              Notifications {highAlerts.length > 0 && `(${highAlerts.length})`}
            </div>

            {highAlerts.length === 0 ? (
              <div style={S.empty}>No new alerts 🎉</div>
            ) : (
              highAlerts.map((a, i) => (
                <div key={i} style={S.item}
                  onClick={() => { navigate('/anomalies'); setOpen(false); }}>
                  <span style={S.itemIcon}>
                    {a.type === 'spike' ? '📈' : '📉'}
                  </span>
                  <div>
                    <p style={S.itemText}>{a.productName}</p>
                    <p style={S.itemSub}>
                      {a.type === 'spike' ? 'Unusual spike' : 'Unusual drop'} on {a.date}
                    </p>
                  </div>
                </div>
              ))
            )}

            <button style={S.viewAll}
              onClick={() => { navigate('/anomalies'); setOpen(false); }}>
              View all anomalies →
            </button>
          </div>

          {/* Click away */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
            onClick={() => setOpen(false)}
          />
        </>
      )}
    </div>
  );
}