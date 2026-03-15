import { create } from 'zustand';
import { DeviceCapabilities } from '../types/midi';

interface MIDIState {
  connectionMode: 'webmidi' | 'usb' | 'wifi' | 'none';
  midiOutputs: MIDIOutput[];
  selectedOutput: MIDIOutput | null;
  midiError: string | null;
  messagesSent: number;
  
  // WiFi state
  wifiStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  wifiRetryCount: number;
  
  // USB state
  usbDevice: any | null;
  usbError: string | null;

  // Device capabilities
  deviceCapabilities: DeviceCapabilities;
  
  setConnectionMode: (mode: 'webmidi' | 'usb' | 'wifi' | 'none') => void;
  setMidiOutputs: (outputs: MIDIOutput[]) => void;
  setSelectedOutput: (output: MIDIOutput | null) => void;
  setMidiError: (error: string | null) => void;
  incrementMessageCount: () => void;
  
  setWifiStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void;
  setWifiRetryCount: (count: number) => void;
  setUsbDevice: (device: any | null) => void;
  setUsbError: (error: string | null) => void;
  setDeviceCapabilities: (caps: DeviceCapabilities) => void;
}

export const useMidiStore = create<MIDIState>((set) => ({
  connectionMode: 'webmidi',
  midiOutputs: [],
  selectedOutput: null,
  midiError: null,
  messagesSent: 0,
  
  wifiStatus: 'disconnected',
  wifiRetryCount: 0,
  usbDevice: null,
  usbError: null,

  deviceCapabilities: {
    pressure: false,
    contactArea: false,
    touchInput: false
  },

  setConnectionMode: (mode) => set({ connectionMode: mode }),
  setMidiOutputs: (outputs) => set({ midiOutputs: outputs }),
  setSelectedOutput: (output) => set({ selectedOutput: output }),
  setMidiError: (error) => set({ midiError: error }),
  incrementMessageCount: () => set((state) => ({ messagesSent: state.messagesSent + 1 })),
  
  setWifiStatus: (status) => set({ wifiStatus: status }),
  setWifiRetryCount: (count) => set({ wifiRetryCount: count }),
  setUsbDevice: (device) => set({ usbDevice: device }),
  setUsbError: (error) => set({ usbError: error }),
  setDeviceCapabilities: (caps) => set({ deviceCapabilities: caps }),
}));
