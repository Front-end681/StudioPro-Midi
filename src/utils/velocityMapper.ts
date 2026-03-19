import { SettingsState, VelocitySensitivityPreset } from '../types/midi';

export const SENSITIVITY_PRESETS: Record<VelocitySensitivityPreset, { fastest: number; slowest: number }> = {
  light: { fastest: 30, slowest: 400 },
  normal: { fastest: 50, slowest: 600 },
  heavy: { fastest: 80, slowest: 800 },
};

export function durationToVelocity(
  ms: number,
  settings: SettingsState
): number {
  // Use personal calibration if available
  if (settings.isCalibrated) {
    const { softDuration, hardDuration, normalDuration } = settings;
    
    let velocity: number;
    if (ms <= hardDuration) {
      // Hard to very hard
      const t = ms / hardDuration;
      velocity = Math.round(120 + (1 - t) * 7);  // 120–127
    } else if (ms <= normalDuration) {
      // Hard to normal
      const t = (ms - hardDuration) / (normalDuration - hardDuration);
      const s = t * t * (3 - 2 * t);  // S-curve
      velocity = Math.round(120 - s * 45);  // 120→75
    } else if (ms <= softDuration) {
      // Normal to soft
      const t = (ms - normalDuration) / (softDuration - normalDuration);
      const s = t * t * (3 - 2 * t);  // S-curve
      velocity = Math.round(75 - s * 60);  // 75→15
    } else {
      // Slower than your softest = minimum
      velocity = 10;
    }

    return Math.max(1, Math.min(127, velocity));
  }

  const preset = SENSITIVITY_PRESETS[settings.velocitySensitivityPreset] || SENSITIVITY_PRESETS.normal;
  const FASTEST = preset.fastest;
  const SLOWEST = preset.slowest;

  // Clamp
  const clamped = Math.max(FASTEST, Math.min(SLOWEST, ms));

  // Normalize 0.0 (fast) to 1.0 (slow)
  const t = (clamped - FASTEST) / (SLOWEST - FASTEST);

  // S-curve: feels natural, avoids extremes
  // Most taps (100-300ms) land in middle range
  const s = t * t * (3 - 2 * t);

  // Invert: fast = high velocity
  const normalized = 1 - s;

  // Map to minVelocity–maxVelocity (default 10–127)
  const minV = settings.minVelocity;
  const maxV = settings.maxVelocity;
  const range = maxV - minV;
  
  const velocity = minV + Math.round(normalized * range);

  return Math.max(1, Math.min(127, velocity));
}
