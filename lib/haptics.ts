/** Light tactile feedback via Vibration API (supported on mobile / some desktops). */
export type HapticPattern = 'selection' | 'light' | 'medium' | 'success' | 'toggle';

const PATTERNS: Record<HapticPattern, number | number[]> = {
  selection: 4,
  light: 10,
  medium: [12, 48, 14],
  success: [8, 40, 8, 40, 16],
  toggle: [6, 32, 6],
};

export function haptic(pattern: HapticPattern = 'light'): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  try {
    navigator.vibrate(PATTERNS[pattern]);
  } catch {
    /* ignore unsupported */
  }
}
