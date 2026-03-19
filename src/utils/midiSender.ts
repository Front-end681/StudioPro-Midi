import { useMidiStore } from '../store/midiStore';
import { wifiMidiService } from '../services/wifiMidiService';
import { formatUSBMIDIPacket } from './midiUtils';

/**
 * Unified MIDI Sender
 * Routes MIDI messages to all active connections simultaneously.
 * This is a pure utility object that can be used anywhere.
 */
export const midiSender = {
  sendNoteOn: (note: number, velocity: number, channel: number = 1) => {
    const store = useMidiStore.getState();
    const midiData = [0x90 + (channel - 1), note, velocity];
    
    // 1. Web MIDI
    if (store.selectedOutput) {
      store.selectedOutput.send(midiData);
    }
    
    // 2. WiFi MIDI
    if (store.wifiStatus === 'connected') {
      wifiMidiService.send('noteOn', { note, velocity, channel });
    }
    
    // 3. USB MIDI
    if (store.usbStatus === 'connected' && store.usbDevice) {
      sendUSBMIDIRaw(store.usbDevice, midiData);
    }
    
    store.incrementMessageCount();
  },

  sendNoteOff: (note: number, channel: number = 1) => {
    const store = useMidiStore.getState();
    const midiData = [0x80 + (channel - 1), note, 0];
    
    if (store.selectedOutput) {
      store.selectedOutput.send(midiData);
    }
    
    if (store.wifiStatus === 'connected') {
      wifiMidiService.send('noteOff', { note, channel });
    }
    
    if (store.usbStatus === 'connected' && store.usbDevice) {
      sendUSBMIDIRaw(store.usbDevice, midiData);
    }
    
    store.incrementMessageCount();
  },

  sendCC: (controller: number, value: number, channel: number = 1) => {
    const store = useMidiStore.getState();
    const midiData = [0xB0 + (channel - 1), controller, value];
    
    if (store.selectedOutput) {
      store.selectedOutput.send(midiData);
    }
    
    if (store.wifiStatus === 'connected') {
      wifiMidiService.send('cc', { controller, value, channel });
    }
    
    if (store.usbStatus === 'connected' && store.usbDevice) {
      sendUSBMIDIRaw(store.usbDevice, midiData);
    }
  },

  sendPitchBend: (lsb: number, msb: number, channel: number = 1) => {
    const store = useMidiStore.getState();
    const midiData = [0xE0 + (channel - 1), lsb, msb];
    
    if (store.selectedOutput) {
      store.selectedOutput.send(midiData);
    }
    
    if (store.wifiStatus === 'connected') {
      wifiMidiService.send('pitchBend', { lsb, msb, channel });
    }
    
    if (store.usbStatus === 'connected' && store.usbDevice) {
      sendUSBMIDIRaw(store.usbDevice, midiData);
    }
  },

  allNotesOff: () => {
    const store = useMidiStore.getState();
    
    if (store.selectedOutput) {
      for (let ch = 0; ch < 16; ch++) {
        store.selectedOutput.send([0xB0 + ch, 123, 0]);
        store.selectedOutput.send([0xB0 + ch, 64, 0]);
      }
    }
    
    if (store.wifiStatus === 'connected') {
      wifiMidiService.send('allNotesOff', {});
    }
    
    if (store.usbStatus === 'connected' && store.usbDevice) {
      for (let ch = 0; ch < 16; ch++) {
        sendUSBMIDIRaw(store.usbDevice, [0xB0 + ch, 123, 0]);
        sendUSBMIDIRaw(store.usbDevice, [0xB0 + ch, 64, 0]);
      }
    }
  }
};

/**
 * Internal helper for USB MIDI sending without hook overhead
 */
async function sendUSBMIDIRaw(device: any, data: number[]) {
  if (!device || !device.opened) return;

  const packet = formatUSBMIDIPacket(data);

  try {
    const endpoint = device._midiOutEndpoint || 1;
    await device.transferOut(endpoint, packet);
  } catch (err) {
    console.error('USB Raw Send Error:', err);
  }
}
