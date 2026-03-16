import { SettingsState, VelocityCurve } from '../types/midi';
import { applyFreqCompensation } from './frequencyWeight';

export interface VelocityTracker {
  getHistory(ms: number): { y: number; t: number }[];
}

function combineSignals(
  A: number | null,  // speed
  B: number | null,  // pressure
  C: number | null,  // area
  D: number,         // position (always available)
  pointerType: string
): number {
  // Base weights
  let weights = {
    A: 0.50,  // speed: most important
    B: 0.25,  // pressure: high quality when available
    C: 0.15,  // area: supporting signal
    D: 0.10,  // position: subtle influence
  };

  // If pressure API available: promote it
  if (B !== null) {
    weights = { A: 0.35, B: 0.40, C: 0.15, D: 0.10 };
  }

  // If mouse (not touch): use speed + position only
  if (pointerType === 'mouse') {
    weights = { A: 0.75, B: 0, C: 0, D: 0.25 };
  }

  let combined = 0;
  let totalWeight = 0;

  if (A !== null) { combined += A * weights.A; totalWeight += weights.A; }
  if (B !== null) { combined += B * weights.B; totalWeight += weights.B; }
  if (C !== null) { combined += C * weights.C; totalWeight += weights.C; }
  
  // D always available
  combined += D * weights.D;
  totalWeight += weights.D;

  // Normalize to 0.0–1.0
  return totalWeight > 0 ? combined / totalWeight : D;
}

function applyCurve(
  normalized: number,
  curve: VelocityCurve
): number {
  switch (curve) {
    case 'linear':      return normalized;
    case 'exponential': return Math.pow(normalized, 1.5);
    case 'logarithmic': return Math.pow(normalized, 0.6);
    default:            return normalized;
  }
}

export function calculateFinalVelocity(
  event: PointerEvent,
  keyElement: HTMLElement,
  midiNote: number,
  settings: SettingsState,
  tracker: VelocityTracker
): number {
  // ── STAGE 1: Collect signals ──────────────────────

  // Signal A: downward speed
  const history = tracker.getHistory(80);
  let signalA: number | null = null;
  if (history.length >= 2) {
    const dy = history[history.length-1].y - history[0].y;
    const dt = history[history.length-1].t - history[0].t;
    const speed = Math.max(dy, 0) / Math.max(dt, 1);
    signalA = Math.min(
      Math.max(
        (speed - settings.minSpeed) / 
        (settings.maxSpeed - settings.minSpeed), 
        0
      ), 1.0
    );
  }

  // Signal B: hardware pressure
  let signalB: number | null = null;
  if (event.pressure > 0 && 
      event.pressure !== 0.5 && 
      event.pointerType === 'touch') {
    signalB = Math.pow(event.pressure, 0.75);
  }

  // Signal C: contact area
  let signalC: number | null = null;
  if (event.pointerType === 'touch' && event.width > 1) {
    const area = event.width * event.height;
    signalC = Math.min(
      Math.max((area - 80) / 820, 0), 1.0
    );
  }

  // Signal D: position on key (always available)
  const rect = keyElement.getBoundingClientRect();
  const posY = (event.clientY - rect.top) / rect.height;
  const signalD = Math.pow(Math.max(1 - posY, 0), 0.5);

  // ── STAGE 2: Combine ─────────────────────────────

  const combined = combineSignals(
    signalA, signalB, signalC, signalD,
    event.pointerType
  );

  // ── STAGE 3: Curve + map to velocity ─────────────

  const curved = applyCurve(combined, settings.velocityCurve);
  const rawVelocity = Math.round(
    settings.minVelocity + 
    curved * (settings.maxVelocity - settings.minVelocity)
  );

  // ── STAGE 4: Frequency compensation ──────────────

  const finalVelocity = applyFreqCompensation(
    rawVelocity,
    midiNote,
    settings.freqCompensationEnabled 
      ? settings.freqCompensationAmount 
      : 0
  );

  return finalVelocity;
}
