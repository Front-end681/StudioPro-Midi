import { useCallback } from 'react';
import { useMidiStore } from '../store/midiStore';

export function useWebUSB() {
  const { usbDevice, setUsbDevice, setUsbError, setConnectionMode } = useMidiStore();

  const connectUSB = useCallback(async () => {
    const nav = navigator as any;
    if (!nav.usb) {
      setUsbError('WebUSB not supported in this browser.');
      return;
    }

    try {
      const selectedDevice = await nav.usb.requestDevice({ filters: [] });
      
      if (!selectedDevice.opened) {
        await selectedDevice.open();
      }
      
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
        if (selectedDevice.configuration?.configurationValue !== midiConfigValue) {
          await selectedDevice.selectConfiguration(midiConfigValue);
        }
        await selectedDevice.claimInterface(midiInterface.interfaceNumber);
        (selectedDevice as any)._midiOutEndpoint = outEndpoint.endpointNumber;
      } else {
        // Fallback to interface 0, endpoint 1 if not found
        if (selectedDevice.configuration === null) {
          await selectedDevice.selectConfiguration(1);
        }
        try {
          await selectedDevice.claimInterface(0);
          (selectedDevice as any)._midiOutEndpoint = 1;
        } catch (e) {
          console.warn('Failed to claim interface 0, device might not be MIDI compliant');
        }
      }

      setUsbDevice(selectedDevice);
      setUsbError(null);
      setConnectionMode('usb');
    } catch (err) {
      if (err instanceof Error && err.name === 'NotFoundError') {
        // User cancelled the dialog, don't show as error
        return;
      }
      setUsbError(err instanceof Error ? err.message : 'Failed to connect to USB device');
      setConnectionMode('webmidi'); // Fallback to webmidi
    }
  }, [setUsbDevice, setUsbError, setConnectionMode]);

  const sendUSBMIDI = useCallback(async (data: number[]) => {
    if (!usbDevice || !usbDevice.opened) return;
    
    try {
      const endpoint = (usbDevice as any)._midiOutEndpoint || 1;
      const status = data[0] & 0xF0;
      let cin = 0x09; // Default to Note On
      
      if (status === 0x80) cin = 0x08; // Note Off
      else if (status === 0x90) cin = 0x09; // Note On
      else if (status === 0xB0) cin = 0x0B; // Control Change
      else if (status === 0xE0) cin = 0x0E; // Pitch Bend
      
      // USB MIDI 1.0 packets must be exactly 4 bytes
      // Byte 0: (Cable Number << 4) | CIN
      // Byte 1-3: MIDI data padded with 0
      const packet = new Uint8Array(4);
      packet[0] = (0 << 4) | cin; // Cable 0
      packet[1] = data[0] || 0;
      packet[2] = data[1] || 0;
      packet[3] = data[2] || 0;
      
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
