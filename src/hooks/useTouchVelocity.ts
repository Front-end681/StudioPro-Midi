import { useCallback, useRef } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { useKeyboardStore } from '../store/keyboardStore';
import { velocityTracker } from '../services/velocityTracker';
import { 
  calculateFinalVelocity, 
  penPressureToVelocity, 
  contactAreaToVelocity 
} from '../utils/unifiedVelocityEngine';

export function useTouchVelocity() {
  const settings = useSettingsStore();
  const { setLastVelocity, pressStartTimes } = useKeyboardStore();
  const pendingAreaVelocity = useRef<Map<number, number>>(new Map());

  const calculateVelocity = useCallback((event: PointerEvent, keyElement: HTMLElement, midiNote: number) => {
    // ── DEVICE AUTO-DETECTION ────────────────────────
    if (settings.pressureMode === 'duration') {
      if (event.pointerType === 'pen' && event.pressure > 0 && event.pressure !== 0.5) {
        settings.updateSetting('pressureMode', 'pen');
      } else if (event.pointerType === 'touch' && event.width > 1 && event.height > 1) {
        settings.updateSetting('pressureMode', 'area');
      }
    }

    // ── UNIFIED ENGINE ───────────────────────────────
    const velocity = calculateFinalVelocity(
      event,
      keyElement,
      midiNote,
      settings,
      velocityTracker
    );

    // Store area signal if available for later refinement
    if (event.pointerType === 'touch' && event.width > 1 && event.height > 1) {
      const areaVel = contactAreaToVelocity(event, settings);
      if (areaVel !== null) {
        pendingAreaVelocity.current.set(event.pointerId, areaVel);
      }
    }

    return velocity;
  }, [settings]);

  const refineVelocity = useCallback((event: PointerEvent, midiNote: number) => {
    const startTime = pressStartTimes.get(midiNote);
    if (!startTime) return;

    const duration = performance.now() - startTime;
    
    // Simple duration to velocity mapping (shorter = faster/harder)
    // This is a placeholder for a more complex duration engine if needed
    const durationVelocity = Math.max(1, Math.min(127, Math.round(127 * (1 - Math.min(duration / 300, 1)))));

    if (pendingAreaVelocity.current.has(event.pointerId)) {
      const areaVel = pendingAreaVelocity.current.get(event.pointerId)!;
      // Final: 55% area + 45% actual duration
      const finalVelocity = Math.round(areaVel * 0.55 + durationVelocity * 0.45);
      setLastVelocity(finalVelocity);
      pendingAreaVelocity.current.delete(event.pointerId);
    } else {
      setLastVelocity(durationVelocity);
    }
  }, [pressStartTimes, setLastVelocity]);

  return { calculateVelocity, refineVelocity };
}
