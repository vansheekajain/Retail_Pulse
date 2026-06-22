import { useUIStore } from '../../store/uiStore';

const S = {
  btn: {
    width: 44, height: 26,
    borderRadius: 13, border: 'none',
    cursor: 'pointer', padding: 0,
    position: 'relative', transition: 'background 0.2s',
  },
  knob: (isDark) => ({
    position: 'absolute',
    top: 3, left: isDark ? 21 : 3,
    width: 20, height: 20,
    borderRadius: '50%',
    background: '#fff',
    transition: 'left 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  }),
};

export default function DarkModeToggle() {
  const isDark      = useUIStore(s => s.darkMode);
  const toggleTheme = useUIStore(s => s.toggleDarkMode);

  return (
    <button
      style={{
        ...S.btn,
        background: isDark ? '#000000' : '#CBD5E1',
      }}
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle dark mode"
    >
      <div style={S.knob(isDark)} />
    </button>
  );
}