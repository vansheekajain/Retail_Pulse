import { createContext, useContext } from 'react';
import { useUIStore } from '../store/uiStore';
import { getTheme } from '../styles/theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const isDark = useUIStore(s => s.darkMode);
  const theme  = getTheme(isDark);

  return (
    <ThemeContext.Provider value={{ theme, isDark }}>
      <div style={{
        width: '100%',
        height: '100%',
        background: theme.bg,
        color:      theme.text,
        transition: 'background 0.2s, color 0.2s',
      }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);