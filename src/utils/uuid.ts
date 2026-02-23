// =============================================
// UUID generator with React Native compatibility
// Uses Math.random with UUID v4 algorithm
// Works in both Jest tests and React Native
// =============================================

/**
 * Generates a UUID v4 using Math.random()
 * This is safe for use in both test environments and React Native
 * where crypto.getRandomValues() may not be available.
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
