import { useSettingsStore } from '../store/settingsStore';
import { useMidiStore } from '../store/midiStore';
import { useEffect } from 'react';

export function useMIDIInit() {
  const setMidiOutputs = useMidiStore((state) => state.setMidiOutputs);
  const setSelectedOutput = useMidiStore((state) => state.setSelectedOutput);
  const setMidiError = useMidiStore((state) => state.setMidiError);
  const setConnectionStatus = useMidiStore((state) => state.setConnectionStatus);

  useEffect(() => {
    if (!navigator.requestMIDIAccess) {
      setMidiError('Web MIDI not supported in this browser.');
      setConnectionStatus('error');
      return;
    }

    navigator.requestMIDIAccess({ sysex: false }).then((access) => {
      const updateOutputs = () => {
        const outputs = Array.from(access.outputs.values());
        setMidiOutputs(outputs);
        
        if (outputs.length > 0) {
          // Auto-select first if none selected
          const currentSelected = useMidiStore.getState().selectedOutput;
          if (!currentSelected) {
            setSelectedOutput(outputs[0]);
          }
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('no-devices');
        }
      };

      access.onstatechange = updateOutputs;
      updateOutputs();
    }).catch((err) => {
      setMidiError('Failed to access MIDI: ' + err.message);
      setConnectionStatus('error');
    });
  }, [setMidiOutputs, setSelectedOutput, setMidiError, setConnectionStatus]);
}
