import { VelocityCurve } from '../types/midi';

export function durationToVelocity(
  durationMs: number,
  curve: VelocityCurve,
  minVelocity: number = 10,
  maxVelocity: number = 127
): number {
  const MAX_DURATION = 400; // ms — anything longer = minimum velocity
  const ratio = Math.min(durationMs / MAX_DURATION, 1);
  // ratio: 0 = instant press, 1 = very slow press

  let normalized: number;
  
  switch (curve) {
    case 'linear':
      normalized = 1 - ratio;
      break;
    
    case 'exponential':
      // More sensitive at fast end
      normalized = Math.pow(1 - ratio, 2);
      break;
    
    case 'logarithmic':
      // More sensitive at slow end
      normalized = 1 - Math.log1p(ratio * (Math.E - 1));
      break;
    default:
      normalized = 1 - ratio;
  }

  const velocity = minVelocity + (normalized * (maxVelocity - minVelocity));
  return Math.max(1, Math.min(127, Math.round(velocity)));
}
