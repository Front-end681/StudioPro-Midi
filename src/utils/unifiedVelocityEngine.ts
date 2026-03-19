import { SettingsState, VelocityCurve } from '../types/midi';
import { applyFreqCompensation } from './frequencyWeight';
import { adaptiveCalibrator } from './adaptiveCalibrator';
import { melodicIntelligence } from './melodicIntelligence';

class MusicalContext {
  private recentVelocities: number[] = []
  private readonly WINDOW = 8
  
  getAnchor(defaultCenter: number): number {
    if (this.recentVelocities.length === 0) return defaultCenter;
    const sum = this.recentVelocities.reduce((a,b) => a+b)
    return Math.round(sum / this.recentVelocities.length)
  }
  
  record(velocity: number): void {
    this.recentVelocities.push(velocity)
    if (this.recentVelocities.length > this.WINDOW) {
      this.recentVelocities.shift()
    }
  }
  
  // Pull new velocity toward recent average
  // This prevents sudden extreme changes
  smooth(newVelocity: number, amount: number, defaultCenter: number): number {
    const anchor = this.getAnchor(defaultCenter)
    return Math.round(
      newVelocity * (1 - amount) + anchor * amount
    )
  }
}

export const musicalContext = new MusicalContext();

let previousVelocity = 75;

const PRESETS = {
  precise: { maxJump: 20, smooth: 0.35, center: 72 },
  natural: { maxJump: 35, smooth: 0.25, center: 75 },
  expressive: { maxJump: 50, smooth: 0.15, center: 78 },
  custom: { maxJump: 35, smooth: 0.25, center: 75 }
};

function filterVelocity(
  newVelocity: number,
  previous: number,
  maxJump: number
): number {
  const diff = newVelocity - previous
  
  if (Math.abs(diff) > maxJump) {
    // Limit the jump
    const direction = diff > 0 ? 1 : -1
    return previous + (direction * maxJump)
  }
  
  return newVelocity
}

export interface VelocityTracker {
  getHistory(ms: number): { y: number; t: number }[];
}

export function penPressureToVelocity(
  pressure: number,
  settings: SettingsState
): number {
  if (pressure <= 0 || pressure === 0.5) {
    // Not a real pressure reading — fallback
    return 80;
  }
  
  // Minimum pressure threshold (ignore ghost touches)
  const MIN_PRESSURE = 0.05;
  if (pressure < MIN_PRESSURE) return settings.minVelocity;
  
  // Normalize above threshold
  const normalized = (pressure - MIN_PRESSURE) / (1.0 - MIN_PRESSURE);
  
  // Apply expressive curve
  const curve = 0.7; // slightly sensitive at soft end
  const curved = Math.pow(normalized, curve);
  
  const velocity = settings.minVelocity + 
    curved * (settings.maxVelocity - settings.minVelocity);
  
  return Math.max(1, Math.min(127, Math.round(velocity)));
}

export function contactAreaToVelocity(
  event: PointerEvent,
  settings: SettingsState
): number | null {
  // Check if area data is available
  if (!event.width || !event.height || 
      event.width <= 1 || event.height <= 1) {
    return null; // not available on this device
  }
  
  const area = event.width * event.height;
  
  // Calibration (adjustable in settings)
  const MIN_AREA = settings.minContactArea;
  const MAX_AREA = settings.maxContactArea;
  
  const normalized = Math.min(
    Math.max((area - MIN_AREA) / (MAX_AREA - MIN_AREA), 0),
    1.0
  );
  
  // Apply curve
  const curved = Math.pow(normalized, 0.75);
  
  const velocity = settings.minVelocity + 
    curved * (settings.maxVelocity - settings.minVelocity);
  
  return Math.max(1, Math.min(127, Math.round(velocity)));
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
  if (event.pressure > 0 && event.pressure !== 0.5) {
    // Normalize above threshold
    const MIN_PRESSURE = 0.05;
    if (event.pressure >= MIN_PRESSURE) {
      signalB = (event.pressure - MIN_PRESSURE) / (1.0 - MIN_PRESSURE);
    }
  }

  // Signal C: contact area
  let signalC: number | null = null;
  if (event.width > 1 && event.height > 1) {
    const area = event.width * event.height;
    signalC = Math.min(
      Math.max((area - settings.minContactArea) / (settings.maxContactArea - settings.minContactArea), 0), 
      1.0
    );
  }

  // Signal D: position on key (always available)
  const rect = keyElement.getBoundingClientRect();
  const posY = (event.clientY - rect.top) / rect.height;
  const signalD = Math.pow(Math.max(1 - posY, 0), 0.5);

  // ── STAGE 2: Combine ─────────────────────────────

  let combined = 0;
  
  if (event.pointerType === 'pen' && signalB !== null) {
    // Priority 1: S Pen / Pen Pressure
    combined = signalB;
  } else if (event.pointerType === 'touch' && signalC !== null) {
    // Priority 2: Contact Area Simulation (60%) + Speed (40%)
    const speedSignal = signalA ?? 0.5;
    combined = (signalC * 0.6) + (speedSignal * 0.4);
  } else {
    // Priority 3: Speed/Duration Fallback
    combined = combineSignals(
      signalA, signalB, signalC, signalD,
      event.pointerType
    );
  }

  // ── NEW: Adaptive Calibration ────────────────────
  
  // Feed raw signal to calibrator (it learns)
  adaptiveCalibrator.update(combined);

  // Get player-relative normalized value
  const adaptedSignal = adaptiveCalibrator.normalize(combined);
  
  // Warmup behavior: blend between fixed and adaptive
  const progress = adaptiveCalibrator.getCalibrationProgress();
  const warmupBlend = Math.min(progress / 20, 1.0); // 1.0 at 10 samples (20%)
  
  const finalSignal = settings.adaptiveEnabled
    ? (combined * (1 - warmupBlend)) + (adaptedSignal * warmupBlend)
    : combined;

  // ── STAGE 3: Curve + map to velocity ─────────────

  const curved = applyCurve(finalSignal, settings.velocityCurve);
  
  // Map to HUMAN velocity curve (biased toward middle range)
  const preset = PRESETS[settings.velocityPreset] || PRESETS.natural;
  const CENTER_VELOCITY = preset.center;
  const CENTER_NORMALIZED = 0.5;
  
  let velocity: number;
  
  if (curved >= CENTER_NORMALIZED) {
    // Upper half: center → max
    const ratio = (curved - CENTER_NORMALIZED) / (1.0 - CENTER_NORMALIZED);
    const eased = Math.pow(ratio, 1.8);
    velocity = CENTER_VELOCITY + eased * (settings.maxVelocity - CENTER_VELOCITY);
  } else {
    // Lower half: center → min
    const ratio = (CENTER_NORMALIZED - curved) / CENTER_NORMALIZED;
    const eased = Math.pow(ratio, 1.8);
    velocity = CENTER_VELOCITY - eased * (CENTER_VELOCITY - settings.minVelocity);
  }

  const rawVelocity = Math.max(
    settings.minVelocity, 
    Math.min(settings.maxVelocity, Math.round(velocity))
  );

  // ── STAGE 4: Frequency compensation ──────────────

  const freqCompensated = applyFreqCompensation(
    rawVelocity,
    midiNote,
    settings.freqCompensationEnabled 
      ? settings.freqCompensationAmount 
      : 0
  );

  // ── STAGE 5: Melodic intelligence (new) ──────────

  const finalVelocity = settings.melodicIntelligenceEnabled
    ? melodicIntelligence.analyze(midiNote, freqCompensated, settings.melodicStrength)
    : freqCompensated;

  // ── STAGE 6: Anti-Extremes Filter ────────────────
  
  const filtered = filterVelocity(finalVelocity, previousVelocity, preset.maxJump);
  previousVelocity = filtered;

  // ── STAGE 7: Musical Context Smoothing ───────────
  
  const anchored = musicalContext.smooth(filtered, preset.smooth, preset.center);
  musicalContext.record(anchored);

  // Record this note in history for melodic intelligence
  melodicIntelligence.record(midiNote, anchored);

  return Math.max(1, Math.min(127, Math.round(anchored)));
}
