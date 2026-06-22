import { useOfflineQueue } from '../../hooks/useOfflineQueue';
import { useUIStore } from '../../store/uiStore';

const S = {
  banner: {
    background: '#FEF3C7', borderTop: '1px solid #FCD34D',
    padding: '8px 16px', display: 'flex',
    alignItems: 'center', justifyContent: 'space-between',
    fontFamily: "'Noto Sans', sans-serif",
  },
  text: { fontSize: 12, fontWeight: 600, color: '#92400E', margin: 0 },
  syncBtn: {
    padding: '4px 12px', background: '#D97706',
    color: '#fff', border: 'none', borderRadius: 8,
    fontSize: 11, fontWeight: 700, cursor: 'pointer',
    fontFamily: 'inherit',
  },
};

export default function OfflineQueue() {
  const isOnline              = useUIStore(s => s.isOnline);
  const { pendingCount, syncQueue, syncing } = useOfflineQueue();

  if (pendingCount === 0) return null;

  return (
    <div style={S.banner}>
      <p style={S.text}>
        {syncing
          ? '🔄 Syncing offline sales…'
          : `📦 ${pendingCount} sale${pendingCount > 1 ? 's' : ''} pending sync`}
      </p>
      {isOnline && !syncing && (
        <button style={S.syncBtn} onClick={syncQueue}>Sync Now</button>
      )}
    </div>
  );
}