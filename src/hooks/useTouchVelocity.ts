import { useCallback } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { velocityTracker } from '../services/velocityTracker';
import { calculateFinalVelocity } from '../utils/unifiedVelocityEngine';

export function useTouchVelocity() {
  const settings = useSettingsStore();

  const calculateVelocity = useCallback((event: PointerEvent, keyElement: HTMLElement, midiNote: number) => {
    return calculateFinalVelocity(
      event,
      keyElement,
      midiNote,
      settings,
      velocityTracker
    );
  }, [settings]);

  return { calculateVelocity };
}
