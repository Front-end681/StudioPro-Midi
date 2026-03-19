import { SettingsState } from '../types/midi';
import { durationToVelocity } from './velocityMapper';

class SimpleVelocityEngine {
  private recentDurations: number[] = [];
  private velocityHistory: number[] = [];
  
  predict(settings: SettingsState): number {
    if (this.recentDurations.length === 0) return 75;
    const avg = this.recentDurations.reduce((a, b) => a + b) / this.recentDurations.length;
    return durationToVelocity(avg, settings);
  }
  
  recordDuration(ms: number) {
    this.recentDurations.push(ms);
    if (this.recentDurations.length > 5) this.recentDurations.shift();
  }
  
  stabilize(velocity: number, enabled: boolean): number {
    if (!enabled) return velocity;
    if (this.velocityHistory.length < 3) {
      this.velocityHistory.push(velocity);
      return velocity;
    }

    const avg = this.velocityHistory.reduce((a, b) => a + b) / this.velocityHistory.length;
    const diff = Math.abs(velocity - avg);

    let result = velocity;
    if (diff > 40) {
      // Too far from recent average — pull back
      result = Math.round(avg + (velocity - avg) * 0.5);
    }

    this.velocityHistory.push(result);
    if (this.velocityHistory.length > 5) this.velocityHistory.shift();

    return Math.max(1, Math.min(127, result));
  }
}

export const simpleVelocityEngine = new SimpleVelocityEngine();

export function calculateFinalVelocity(
  event: PointerEvent,
  _keyElement: HTMLElement,
  _midiNote: number,
  settings: SettingsState,
  _tracker: any
): number {
  // If pen pressure is enabled and available, use it as it's a direct signal
  if (event.pointerType === 'pen' && event.pressure > 0 && event.pressure !== 0.5) {
    const MIN_PRESSURE = 0.05;
    const normalized = Math.max(0, (event.pressure - MIN_PRESSURE) / (1.0 - MIN_PRESSURE));
    const velocity = settings.minVelocity + Math.pow(normalized, 0.7) * (settings.maxVelocity - settings.minVelocity);
    return Math.max(1, Math.min(127, Math.round(velocity)));
  }

  // Default: return predicted velocity for immediate note-on
  return simpleVelocityEngine.predict(settings);
}
