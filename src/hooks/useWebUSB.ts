import { useCallback } from 'react';
import { useMidiStore } from '../store/midiStore';

export function useWebUSB() {
  const { usbDevice, setUsbDevice, setUsbError } = useMidiStore();

  const connectUSB = useCallback(async () => {
    const nav = navigator as any;
    if (!nav.usb) {
      setUsbError('WebUSB not supported in this browser.');
      return;
    }

    try {
      const selectedDevice = await nav.usb.requestDevice({ filters: [] });
      await selectedDevice.open();
      
      // Find MIDI interface (Class 1: Audio, Subclass 3: MIDI Streaming)
      let midiInterface = null;
      let outEndpoint = null;
      let midiConfigValue = 1;

      for (const config of selectedDevice.configurations) {
        for (const iface of config.interfaces) {
          for (const alt of iface.alternates) {
            if (alt.interfaceClass === 1 && alt.interfaceSubclass === 3) {
              midiInterface = iface;
              midiConfigValue = config.configurationValue;
              for (const endpoint of alt.endpoints) {
                if (endpoint.direction === 'out') {
                  outEndpoint = endpoint;
                  break;
                }
              }
            }
            if (midiInterface && outEndpoint) break;
          }
          if (midiInterface && outEndpoint) break;
        }
        if (midiInterface && outEndpoint) break;
      }

      if (midiInterface && outEndpoint) {
        await selectedDevice.selectConfiguration(midiConfigValue);
        await selectedDevice.claimInterface(midiInterface.interfaceNumber);
        (selectedDevice as any)._midiOutEndpoint = outEndpoint.endpointNumber;
      } else {
        // Fallback to interface 0, endpoint 1 if not found
        if (selectedDevice.configuration === null) {
          await selectedDevice.selectConfiguration(1);
        }
        await selectedDevice.claimInterface(0);
        (selectedDevice as any)._midiOutEndpoint = 1;
      }

      setUsbDevice(selectedDevice);
      setUsbError(null);
    } catch (err) {
      setUsbError(err instanceof Error ? err.message : 'Failed to connect to USB device');
    }
  }, [setUsbDevice, setUsbError]);

  const sendUSBMIDI = useCallback(async (data: number[]) => {
    if (!usbDevice) return;
    
    try {
      const endpoint = (usbDevice as any)._midiOutEndpoint || 1;
      const status = data[0] & 0xF0;
      let cin = 0x09; // Default to Note On
      
      if (status === 0x80) cin = 0x08; // Note Off
      else if (status === 0x90) cin = 0x09; // Note On
      else if (status === 0xB0) cin = 0x0B; // Control Change
      else if (status === 0xE0) cin = 0x0E; // Pitch Bend
      
      const packet = new Uint8Array([cin, ...data]);
      await usbDevice.transferOut(endpoint, packet);
    } catch (err) {
      console.error('USB MIDI Transfer Error:', err);
    }
  }, [usbDevice]);

  const disconnectUSB = useCallback(async () => {
    if (usbDevice) {
      try {
        await usbDevice.close();
      } catch (err) {
        console.error('Error closing USB device:', err);
      }
      setUsbDevice(null);
    }
  }, [usbDevice, setUsbDevice]);

  return {
    connectUSB,
    disconnectUSB,
    sendUSBMIDI
  };
}
