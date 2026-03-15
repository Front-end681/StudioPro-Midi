import { useSettingsStore } from '../store/settingsStore';
import { useMidiStore } from '../store/midiStore';
import { useEffect } from 'react';

export function useMIDIInit() {
  const setMidiOutputs = useMidiStore((state) => state.setMidiOutputs);
  const setSelectedOutput = useMidiStore((state) => state.setSelectedOutput);
  const setMidiError = useMidiStore((state) => state.setMidiError);
  const setDeviceCapabilities = useMidiStore((state) => state.setDeviceCapabilities);

  useEffect(() => {
    // Detect capabilities
    const testHandler = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        setDeviceCapabilities({
          touchInput: true,
          pressure: e.pressure > 0 && e.pressure !== 0.5,
          contactArea: (e.width > 1) || (e.height > 1)
        });
      } else {
        setDeviceCapabilities({
          touchInput: false,
          pressure: false,
          contactArea: false
        });
      }
      document.removeEventListener('pointerdown', testHandler);
    };
    
    document.addEventListener('pointerdown', testHandler, { once: true });

    if (!navigator.requestMIDIAccess) {
      setMidiError('Web MIDI not supported in this browser.');
      return;
    }

    navigator.requestMIDIAccess().then((access) => {
      const updateOutputs = () => {
        const outputs = Array.from(access.outputs.values());
        setMidiOutputs(outputs);
        
        // Auto-select first if none selected
        const currentSelected = useMidiStore.getState().selectedOutput;
        if (!currentSelected && outputs.length > 0) {
          setSelectedOutput(outputs[0]);
        }
      };

      access.onstatechange = updateOutputs;
      updateOutputs();
    }).catch((err) => {
      setMidiError('Failed to access MIDI: ' + err.message);
    });
  }, [setMidiOutputs, setSelectedOutput, setMidiError]);
}
