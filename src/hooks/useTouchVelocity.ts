import { useCallback } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { useKeyboardStore } from '../store/keyboardStore';
import { 
  calculateFinalVelocity, 
  simpleVelocityEngine 
} from '../utils/unifiedVelocityEngine';
import { durationToVelocity } from '../utils/velocityMapper';

export function useTouchVelocity() {
  const settings = useSettingsStore();
  const { setLastVelocity, pressStartTimes } = useKeyboardStore();

  const calculateVelocity = useCallback((event: PointerEvent, keyElement: HTMLElement, midiNote: number) => {
    // ── UNIFIED ENGINE ───────────────────────────────
    // This now returns a PREDICTED velocity for immediate note-on
    return calculateFinalVelocity(
      event,
      keyElement,
      midiNote,
      settings,
      null // tracker no longer needed
    );
  }, [settings]);

  const refineVelocity = useCallback((_event: PointerEvent, midiNote: number) => {
    const startTime = pressStartTimes.get(midiNote);
    if (!startTime) return;

    const duration = performance.now() - startTime;
    
    // 1. Record the actual duration to improve future predictions
    simpleVelocityEngine.recordDuration(duration);

    // 2. Calculate the actual velocity based on this duration
    const actualVelocity = durationToVelocity(duration, settings);

    // 3. Apply stability filter to prevent wild jumps
    const stabilizedVelocity = simpleVelocityEngine.stabilize(
      actualVelocity, 
      settings.stabilityFilterEnabled
    );

    // 4. Update the UI/Store with the final "true" velocity
    setLastVelocity(stabilizedVelocity);
    
    return stabilizedVelocity;
  }, [pressStartTimes, setLastVelocity, settings]);

  return { calculateVelocity, refineVelocity };
}
