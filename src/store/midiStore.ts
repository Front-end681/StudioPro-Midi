import { create } from 'zustand';

interface MIDIState {
  connectionMode: 'webmidi' | 'usb' | 'wifi' | 'none';
  connectionStatus: 'connected' | 'no-devices' | 'error' | 'disconnected';
  midiOutputs: MIDIOutput[];
  selectedOutput: MIDIOutput | null;
  midiError: string | null;
  messagesSent: number;
  
  // WiFi state
  wifiStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  wifiRetryCount: number;
  
  // USB state
  usbDevice: any | null;
  usbStatus: 'disconnected' | 'connecting' | 'connected' | 'error' | 'not_supported';
  usbDeviceName: string | null;
  usbError: string | null;

  setConnectionMode: (mode: 'webmidi' | 'usb' | 'wifi' | 'none') => void;
  setConnectionStatus: (status: 'connected' | 'no-devices' | 'error' | 'disconnected') => void;
  setMidiOutputs: (outputs: MIDIOutput[]) => void;
  setSelectedOutput: (output: MIDIOutput | null) => void;
  setMidiError: (error: string | null) => void;
  incrementMessageCount: () => void;
  
  setWifiStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void;
  setWifiRetryCount: (count: number) => void;
  setUsbDevice: (device: any | null) => void;
  setUsbStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error' | 'not_supported') => void;
  setUsbDeviceName: (name: string | null) => void;
  setUsbError: (error: string | null) => void;
}

export const useMidiStore = create<MIDIState>((set) => ({
  connectionMode: 'webmidi',
  connectionStatus: 'disconnected',
  midiOutputs: [],
  selectedOutput: null,
  midiError: null,
  messagesSent: 0,
  
  wifiStatus: 'disconnected',
  wifiRetryCount: 0,
  usbDevice: null,
  usbStatus: 'disconnected',
  usbDeviceName: null,
  usbError: null,

  setConnectionMode: (mode) => set({ connectionMode: mode }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setMidiOutputs: (outputs) => set({ midiOutputs: outputs }),
  setSelectedOutput: (output) => set({ selectedOutput: output }),
  setMidiError: (error) => set({ midiError: error }),
  incrementMessageCount: () => set((state) => ({ messagesSent: state.messagesSent + 1 })),
  
  setWifiStatus: (status) => set({ wifiStatus: status }),
  setWifiRetryCount: (count) => set({ wifiRetryCount: count }),
  setUsbDevice: (device) => set({ usbDevice: device }),
  setUsbStatus: (status) => set({ usbStatus: status }),
  setUsbDeviceName: (name) => set({ usbDeviceName: name }),
  setUsbError: (error) => set({ usbError: error }),
}));
