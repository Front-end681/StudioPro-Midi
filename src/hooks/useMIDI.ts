import { useMidiStore } from '../store/midiStore';
import { useSettingsStore } from '../store/settingsStore';
import { useWebSocket } from './useWebSocket';
import { useWebUSB } from './useWebUSB';

export function useMIDI() {
  const connectionMode = useMidiStore((state) => state.connectionMode);
  const selectedOutput = useMidiStore((state) => state.selectedOutput);
  const incrementMessageCount = useMidiStore((state) => state.incrementMessageCount);
  const midiChannel = useSettingsStore((state) => state.midiChannel);
  const transpose = useSettingsStore((state) => state.transpose);

  const { sendMessage: sendWSMessage } = useWebSocket();
  const { sendUSBMIDI } = useWebUSB();

  const sendRaw = (data: number[]) => {
    if (connectionMode === 'webmidi' && selectedOutput) {
      selectedOutput.send(data);
    } else if (connectionMode === 'wifi') {
      // The server expects { type: 'midi', data: [...] }
      sendWSMessage('midi', { data });
    } else if (connectionMode === 'usb') {
      sendUSBMIDI(data);
    }
    incrementMessageCount();
  };

  const sendNoteOn = (note: number, velocity: number) => {
    const finalNote = Math.max(0, Math.min(127, note + transpose));
    const status = 0x90 + (midiChannel - 1);
    sendRaw([status, finalNote, velocity]);
  };

  const sendNoteOff = (note: number) => {
    const finalNote = Math.max(0, Math.min(127, note + transpose));
    // Some devices prefer Note On with velocity 0 as Note Off
    const status = 0x80 + (midiChannel - 1);
    sendRaw([status, finalNote, 0]);
  };

  const sendSustain = (active: boolean) => {
    const status = 0xB0 + (midiChannel - 1);
    sendRaw([status, 64, active ? 127 : 0]);
  };

  const sendControlChange = (controller: number, value: number) => {
    const status = 0xB0 + (midiChannel - 1);
    sendRaw([status, controller, value]);
  };

  const sendPitchBend = (lsb: number, msb: number) => {
    const status = 0xE0 + (midiChannel - 1);
    sendRaw([status, lsb, msb]);
  };

  const sendAllNotesOff = () => {
    for (let ch = 1; ch <= 16; ch++) {
      sendRaw([0xB0 + (ch - 1), 123, 0]);
      sendRaw([0xB0 + (ch - 1), 64, 0]); // Also sustain off
    }
  };

  return { sendNoteOn, sendNoteOff, sendControlChange, sendPitchBend, sendAllNotesOff, sendSustain };
}
