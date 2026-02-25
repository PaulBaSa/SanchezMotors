// =============================================
// Workshop Manager - Theme Constants
// High contrast UI with large touch targets (min 60px)
// =============================================

export const COLORS = {
  // Primary palette - Sanchez Motors brand colors
  primary: '#1e5080',          // Dark teal blue from logo
  primaryLight: '#2a6aa8',     // Lighter teal
  accent: '#ff9a00',           // Orange/gold from logo
  highlight: '#ff9a00',        // Same as accent for consistency

  // Status colors
  success: '#27ae60',
  warning: '#ff9a00',          // Use brand orange for warnings
  danger: '#e74c3c',
  info: '#2a6aa8',             // Use brand blue for info

  // Neutrals
  white: '#ffffff',
  background: '#f5f6fa',
  card: '#ffffff',
  border: '#dcdde1',
  textPrimary: '#1e5080',      // Use brand blue for primary text
  textSecondary: '#7f8c8d',
  textLight: '#bdc3c7',
  overlay: 'rgba(30, 80, 128, 0.5)',  // Use brand blue overlay

  // Kanban columns
  kanbanPending: '#ffe4b3',    // Light orange
  kanbanInProgress: '#a8d4f7', // Light blue
  kanbanCompleted: '#b3e5d4',  // Light teal

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
