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
      if (selectedDevice.configuration === null) {
        await selectedDevice.selectConfiguration(1);
      }
      await selectedDevice.claimInterface(0);
      setUsbDevice(selectedDevice);
      setUsbError(null);
    } catch (err) {
      setUsbError(err instanceof Error ? err.message : 'Failed to connect to USB device');
    }
  }, [setUsbDevice, setUsbError]);

  const sendUSBMIDI = useCallback(async (data: number[]) => {
    if (!usbDevice) return;
    
    try {
      // MIDI over USB usually uses 4-byte packets
      // [Code Index Number, MIDI_0, MIDI_1, MIDI_2]
      const packet = new Uint8Array([0x09, ...data]); // 0x09 is Note On
      await usbDevice.transferOut(1, packet);
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
