import { useCallback } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { velocityTracker } from '../services/velocityTracker';

export function useTouchVelocity() {
  const settings = useSettingsStore();

  const calculateVelocity = useCallback((event: PointerEvent) => {
    return velocityTracker.calculate(event, {
      minSpeed: settings.minSpeed,
      maxSpeed: settings.maxSpeed,
      curve: settings.velocitySensitivity,
      windowMs: settings.velocityWindow,
      minVelocity: settings.minVelocity,
      maxVelocity: settings.maxVelocity
    });
  }, [
    settings.minSpeed, 
    settings.maxSpeed, 
    settings.velocitySensitivity, 
    settings.velocityWindow, 
    settings.minVelocity, 
    settings.maxVelocity
  ]);

  return { calculateVelocity };
}
