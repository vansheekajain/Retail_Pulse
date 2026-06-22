import { useNavigate } from 'react-router-dom';

const S = {
  page: {
    minHeight: '100vh',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Noto Sans', sans-serif",
    background: '#F8FAFC', padding: 24,
    textAlign: 'center',
  },
  icon: { fontSize: 72, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 8px' },
  sub: { fontSize: 14, color: 'var(--text-muted)', margin: '0 0 24px', lineHeight: 1.6 },
  btn: {
    padding: '12px 32px', background: '#0F4C81',
    color: '#fff', border: 'none', borderRadius: 12,
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
    fontFamily: 'inherit',
  },
};

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={S.page}>
      <div style={S.icon}>🔍</div>
      <p style={S.title}>Page Not Found</p>
      <p style={S.sub}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button style={S.btn} onClick={() => navigate('/')}>
        Go to Dashboard
      </button>
    </div>
  );
}