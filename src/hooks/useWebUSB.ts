import { useCallback } from 'react';
import { useMidiStore } from '../store/midiStore';
import { formatUSBMIDIPacket } from '../utils/midiUtils';

export function useWebUSB() {
  const { 
    usbDevice, 
    setUsbDevice, 
    setUsbStatus,
    setUsbDeviceName,
    setUsbError, 
    setConnectionMode 
  } = useMidiStore();

  const connectUSB = useCallback(async () => {
    const usb = (navigator as any).usb;
    if (!usb) {
      setUsbStatus('not_supported');
      setUsbError('WebUSB not supported in this browser. Use Chrome or Edge.');
      return;
    }

    try {
      setUsbStatus('connecting');
      
      // 1. Request device
      const device = await usb.requestDevice({ filters: [] });

      // 2. Open device
      await device.open();

      // 3. Select configuration (usually 1)
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }

      // 4. Find MIDI Interface and OUT Endpoint
      let midiInterface = null;
      let outEndpoint = null;
      let alternateSetting = 0;
 
      for (const configuration of device.configurations) {
        for (const iface of configuration.interfaces) {
          for (const alternate of iface.alternates) {
            // MIDI Class: 0x01, Subclass: 0x03
            if (alternate.interfaceClass === 0x01 && alternate.interfaceSubclass === 0x03) {
              midiInterface = iface;
              alternateSetting = alternate.alternateSetting;
              for (const endpoint of alternate.endpoints) {
                if (endpoint.direction === 'out') {
                  outEndpoint = endpoint;
                  break;
                }
              }
            }
            if (outEndpoint) break;
          }
          if (outEndpoint) break;
        }
        if (outEndpoint) break;
      }
 
      // Fallback: If class/subclass not found, try to find any OUT endpoint
      if (!outEndpoint) {
        for (const iface of device.configuration!.interfaces) {
          for (const alternate of iface.alternates) {
            for (const endpoint of alternate.endpoints) {
              if (endpoint.direction === 'out') {
                midiInterface = iface;
                alternateSetting = alternate.alternateSetting;
                outEndpoint = endpoint;
                break;
              }
            }
            if (outEndpoint) break;
          }
          if (outEndpoint) break;
        }
      }
 
      if (!midiInterface || !outEndpoint) {
        throw new Error('No MIDI OUT endpoint found on this device.');
      }
 
      // 5. Claim interface
      await device.claimInterface(midiInterface.interfaceNumber);
      
      // Select alternate interface if needed
      if (alternateSetting !== 0) {
        await device.selectAlternateInterface(midiInterface.interfaceNumber, alternateSetting);
      }
      
      // Store endpoint number for sending
      (device as any)._midiOutEndpoint = outEndpoint.endpointNumber;

      setUsbDevice(device);
      setUsbDeviceName(device.productName || 'Unknown MIDI Device');
      setUsbStatus('connected');
      setUsbError(null);
      setConnectionMode('usb');

      // Listen for disconnect
      (navigator as any).usb.addEventListener('disconnect', (event: any) => {
        if (event.device === device) {
          setUsbStatus('disconnected');
          setUsbDeviceName(null);
          setUsbDevice(null);
        }
      });

    } catch (err: any) {
      if (err.name === 'NotFoundError') return; // User cancelled
      console.error('USB Connection Error:', err);
      setUsbStatus('error');
      setUsbError(err.message || 'Failed to connect to USB device');
    }
  }, [setUsbDevice, setUsbStatus, setUsbDeviceName, setUsbError, setConnectionMode]);

  const sendUSBMIDI = useCallback(async (data: number[]) => {
    if (!usbDevice || !usbDevice.opened) return;

    const packet = formatUSBMIDIPacket(data);

    try {
      const endpoint = (usbDevice as any)._midiOutEndpoint || 1;
      await usbDevice.transferOut(endpoint, packet);
    } catch (err) {
      console.error('USB Send Error:', err);
    }
  }, [usbDevice]);

  const disconnectUSB = useCallback(async () => {
    if (usbDevice) {
      try {
        await usbDevice.close();
      } catch (e) {
        console.error('Error closing USB device:', e);
      }
      setUsbDevice(null);
      setUsbDeviceName(null);
      setUsbStatus('disconnected');
    }
  }, [usbDevice, setUsbDevice, setUsbDeviceName, setUsbStatus]);

  const usbAllNotesOff = useCallback(async () => {
    for (let ch = 0; ch < 16; ch++) {
      await sendUSBMIDI([0xB0 + ch, 123, 0]); // All Notes Off
      await sendUSBMIDI([0xB0 + ch, 64, 0]);  // Sustain Off
    }
  }, [sendUSBMIDI]);

  return {
    connectUSB,
    disconnectUSB,
    sendUSBMIDI,
    usbAllNotesOff
  };
}
