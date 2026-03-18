import { useEffect } from 'react';
import { useKeyboardStore } from '../store/keyboardStore';
import { useMIDI } from './useMIDI';

export function useKeyboardShortcuts() {
  const { baseOctave, setBaseOctave, numOctaves, setNotePressed, setNoteReleased, setSustain, isSustainOn, clearActiveKeys } = useKeyboardStore();
  const { sendNoteOn, sendNoteOff, sendControlChange, sendAllNotesOff } = useMIDI();

  useEffect(() => {
    const keyMap: Record<string, number> = {
      'a': 0,  // C
      'w': 1,  // C#
      's': 2,  // D
      'e': 3,  // D#
      'd': 4,  // E
      'f': 5,  // F
      't': 6,  // F#
      'g': 7,  // G
      'y': 8,  // G#
      'h': 9,  // A
      'u': 10, // A#
      'j': 11, // B
      'k': 12, // C+1
      'l': 13, // D+1
    };

    const activeKeys = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();

      if (key === 'escape') {
        sendAllNotesOff();
        clearActiveKeys();
        return;
      }
      if (key === 'z') {
        setBaseOctave(Math.max(0, baseOctave - 1));
        return;
      }
      if (key === 'x') {
        setBaseOctave(Math.min(8 - numOctaves + 1, baseOctave + 1));
        return;
      }
      if (key === ' ') {
        setSustain(true);
        sendControlChange(64, 127);
        return;
      }

      if (key in keyMap) {
        activeKeys.add(key);
        const note = (baseOctave + 1) * 12 + keyMap[key];
        setNotePressed(note, 90);
        sendNoteOn(note, 90);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (key === ' ') {
        setSustain(false);
        sendControlChange(64, 0);
        return;
      }

      if (key in keyMap) {
        activeKeys.delete(key);
        const note = (baseOctave + 1) * 12 + keyMap[key];
        setNoteReleased(note);
        sendNoteOff(note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [baseOctave, numOctaves, setBaseOctave, setNotePressed, setNoteReleased, setSustain, sendNoteOn, sendNoteOff, sendControlChange]);
}
