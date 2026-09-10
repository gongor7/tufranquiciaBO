export const colors = {
  primary: '#1B4965',
  primaryLight: '#5FA8D3',
  primaryDark: '#0B2545',
  accent: '#D4A843',
  accentLight: '#F2D06B',
  white: '#FFFFFF',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  border: '#E9ECEF',
  text: '#212529',
  textSecondary: '#6C757D',
  textLight: '#ADB5BD',
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#17A2B8',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  sm: 6,
  md: 10,
  lg: 12,
  xl: 16,
  full: 999,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '600' as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  bodyMedium: { fontSize: 16, fontWeight: '500' as const, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
};