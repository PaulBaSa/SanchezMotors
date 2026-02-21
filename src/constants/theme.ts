// =============================================
// Workshop Manager - Theme Constants
// High contrast UI with large touch targets (min 60px)
// =============================================

export const COLORS = {
  // Primary palette
  primary: '#1a1a2e',
  primaryLight: '#16213e',
  accent: '#0f3460',
  highlight: '#e94560',

  // Status colors
  success: '#2ecc71',
  warning: '#f39c12',
  danger: '#e74c3c',
  info: '#3498db',

  // Neutrals
  white: '#ffffff',
  background: '#f5f6fa',
  card: '#ffffff',
  border: '#dcdde1',
  textPrimary: '#2c3e50',
  textSecondary: '#7f8c8d',
  textLight: '#bdc3c7',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Kanban columns
  kanbanPending: '#ffeaa7',
  kanbanInProgress: '#74b9ff',
  kanbanCompleted: '#55efc4',

  // Admin/Finance
  profit: '#27ae60',
  loss: '#c0392b',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  title: 34,
};

export const BORDER_RADIUS = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  round: 999,
};

// Minimum 60px touch targets for workshop environment
export const TOUCH_TARGET = {
  minHeight: 60,
  minWidth: 60,
  iconSize: 28,
  iconSizeLg: 36,
};
