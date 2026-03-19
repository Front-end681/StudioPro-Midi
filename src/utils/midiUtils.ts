/**
 * MIDI Utility functions for formatting and processing MIDI data
 */

/**
 * Gets the Code Index Number (CIN) for a MIDI status byte
 * according to the USB MIDI 1.0 specification.
 */
export function getMIDICIN(status: number): number {
  if (status >= 0xF8) return 0x0F; // Real-time Message
  
  const type = status & 0xF0;
  switch (type) {
    case 0x80: return 0x08; // Note Off
    case 0x90: return 0x09; // Note On
    case 0xA0: return 0x0A; // Polyphonic Aftertouch
    case 0xB0: return 0x0B; // Control Change
    case 0xC0: return 0x0C; // Program Change
    case 0xD0: return 0x0D; // Channel Aftertouch
    case 0xE0: return 0x0E; // Pitch Bend
    case 0xF0: {
      // System Common
      switch (status) {
        case 0xF1: return 0x02; // MTC (2 bytes)
        case 0xF2: return 0x03; // Song Position (3 bytes)
        case 0xF3: return 0x02; // Song Select (2 bytes)
        case 0xF6: return 0x05; // Tune Request (1 byte)
        default: return 0x0F;   // Single Byte
      }
    }
    default: return 0x0F;   // Single Byte
  }
}

/**
 * Formats a standard MIDI message (1-3 bytes) into a 4-byte USB MIDI packet.
 */
export function formatUSBMIDIPacket(data: number[], cable: number = 0): Uint8Array {
  const status = data[0];
  const cin = getMIDICIN(status);
  
  const packet = new Uint8Array(4);
  packet[0] = (cable << 4) | cin;
  packet[1] = data[0] || 0;
  packet[2] = data[1] || 0;
  packet[3] = data[2] || 0;
  
  return packet;
}

/**
 * Checks if a MIDI message is a Note On message with velocity > 0
 */
export function isNoteOn(data: number[]): boolean {
  return (data[0] & 0xF0) === 0x90 && data[2] > 0;
}

/**
 * Checks if a MIDI message is a Note Off message (or Note On with velocity 0)
 */
export function isNoteOff(data: number[]): boolean {
  const type = data[0] & 0xF0;
  return type === 0x80 || (type === 0x90 && data[2] === 0);
}
