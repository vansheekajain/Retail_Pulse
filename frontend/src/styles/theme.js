export const lightTheme = {
  bg:         '#F8FAFC',
  surface:    '#FFFFFF',
  border:     '#E2E8F0',
  text:       '#1E293B',
  textSub:    '#64748B',
  textMuted:  '#94A3B8',
  primary:    '#0F4C81',
  primaryLight:'#EFF6FF',
  accent:     '#FF6B35',
  success:    '#16A34A',
  warning:    '#D97706',
  danger:     '#DC2626',
  card:       '#FFFFFF',
  input:      '#F8FAFC',
  navBg:      '#FFFFFF',
  navBorder:  '#E2E8F0',
};

export const darkTheme = {
  bg:          '#0F172A',
  surface:     '#1E293B',
  border:      '#334155',
  text:        '#F1F5F9',
  textSub:     '#94A3B8',
  textMuted:   '#64748B',
  primary:     '#3B82F6',
  primaryLight:'#1E3A5F',
  accent:      '#FF6B35',
  success:     '#22C55E',
  warning:     '#F59E0B',
  danger:      '#EF4444',
  card:        '#1E293B',
  input:       '#0F172A',
  navBg:       '#1E293B',
  navBorder:   '#334155',
};

export const getTheme = (isDark) => isDark ? darkTheme : lightTheme;