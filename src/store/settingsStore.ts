import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SettingsState } from '../types/midi';

interface SettingsActions extends SettingsState {
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
}

export const useSettingsStore = create<SettingsActions>()(
  persist(
    (set) => ({
      numOctaves: 3,
      defaultOctave: 4,
      showNoteLabels: true,
      showOctaveNumbers: true,
      keyWidth: 'normal',
      velocityCurve: 'linear',
      velocityPreset: 'normal',
      minSpeed: 0.02,
      maxSpeed: 1.2,
      velocitySensitivity: 0.65,
      velocityWindow: 80,
      minVelocity: 10,
      maxVelocity: 127,
      midiChannel: 1,
      transpose: 0,
      sendNoteOffOnSustainRelease: true,
      allNotesOffOnDisconnect: true,
      audioEnabled: true,
      volume: 80,
      sampleSet: 'piano',
      latencyMs: 20,
      theme: 'dark',
      accentColor: '#1D9E75',
      keyAnimation: true,
      wifiIP: '',
      wifiPort: 3001,
      autoReconnect: true,
      lastConnectionMode: 'webmidi',

      updateSetting: (key, value) => set((state) => ({ ...state, [key]: value })),
    }),
    {
      name: 'studiopro-midi-settings',
    }
  )
);
