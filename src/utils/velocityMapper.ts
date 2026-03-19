import { SettingsState } from '../types/midi';

export function durationToVelocity(
  ms: number,
  settings: SettingsState
): number {
  // Human tap duration ranges on glass:
  // Very fast (intentional snap): 30–80ms
  // Fast (normal tap):            80–180ms  
  // Medium (deliberate press):    180–350ms
  // Slow (gentle placement):      350–600ms
  // Very slow:                    600ms+

  // Map duration to normalized 0.0–1.0
  // Using sigmoid-like curve for natural feel
  
  const FAST_END   = 80    // ms — anything faster = max
  const SLOW_START = 500   // ms — anything slower = min
  
  let normalized: number;
  
  if (ms <= FAST_END) {
    normalized = 1.0;
  } else if (ms >= SLOW_START) {
    normalized = 0.0;
  } else {
    // Smooth S-curve between fast and slow
    const t = (ms - FAST_END) / (SLOW_START - FAST_END);
    // S-curve: slow start, fast middle, slow end
    normalized = 1 - (t * t * (3 - 2 * t));
  }
  
  // Map to HUMAN velocity curve
  // NOT linear — biased toward middle range
  
  // Center point: normalized 0.5 → velocity 75
  // This means most normal taps land around 75
  
  const CENTER_VELOCITY = 75;
  const CENTER_NORMALIZED = 0.5;
  
  let velocity: number;
  
  if (normalized >= CENTER_NORMALIZED) {
    // Upper half: 75 → 127
    const ratio = (normalized - CENTER_NORMALIZED) / 
                  (1.0 - CENTER_NORMALIZED);
    // Ease-in: hard to reach very high velocities
    const eased = Math.pow(ratio, 1.8);
    velocity = CENTER_VELOCITY + 
               eased * (settings.maxVelocity - CENTER_VELOCITY);
  } else {
    // Lower half: 75 → minVelocity
    const ratio = (CENTER_NORMALIZED - normalized) / 
                  CENTER_NORMALIZED;
    // Ease-in: hard to reach very low velocities
    const eased = Math.pow(ratio, 1.8);
    velocity = CENTER_VELOCITY - 
               eased * (CENTER_VELOCITY - settings.minVelocity);
  }
  
  return Math.max(
    settings.minVelocity, 
    Math.min(settings.maxVelocity, 
    Math.round(velocity))
  );
}
