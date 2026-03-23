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
      stabilityFilterEnabled: true,
      minVelocity: 15,
      maxVelocity: 115,
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
      musicalStyle: 'free',

      updateSetting: (key, value) => set((state) => ({ ...state, [key]: value })),
    }),
    {
      name: 'studiopro-midi-settings',
      onRehydrateStorage: () => (state) => {
        if (state && (state.accentColor === '#00E5FF' || state.accentColor === 'cyan')) {
          state.updateSetting('accentColor', '#1D9E75');
        }
      },
    }
  )
);
