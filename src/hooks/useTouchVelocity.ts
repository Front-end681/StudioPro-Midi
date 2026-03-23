import React, { useCallback } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { musicAwareEngine } from '../utils/musicAwareEngine';

export function useTouchVelocity() {
  const { musicalStyle } = useSettingsStore();

  const calculateVelocity = useCallback((_event: PointerEvent | React.PointerEvent, _keyElement: HTMLElement, midiNote: number) => {
    // Set style from settings
    musicAwareEngine.setStyle(musicalStyle);
    
    // Calculate instantly
    const velocity = musicAwareEngine.calculateVelocity(midiNote, performance.now());
    
    return velocity;
  }, [musicalStyle]);

  return { calculateVelocity };
}
