import { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { useSettingsStore } from '../store/settingsStore';
import { useKeyboardStore } from '../store/keyboardStore';

export function useAudio() {
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const { audioEnabled, volume } = useSettingsStore();
  const isSustainOn = useKeyboardStore((state) => state.isSustainOn);
  const sustainedNotes = useRef<Set<number>>(new Set());

  useEffect(() => {
    samplerRef.current = new Tone.Sampler({
      urls: {
        C4: 'C4.mp3',
        'F#4': 'Fs4.mp3',
        A4: 'A4.mp3',
        C5: 'C5.mp3',
      },
      release: 1,
      baseUrl: 'https://tonejs.github.io/audio/salamander/',
    }).toDestination();

    return () => {
      samplerRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (samplerRef.current) {
      samplerRef.current.volume.value = Tone.gainToDb(volume / 100);
    }
  }, [volume]);

  // Handle sustain release when sustain pedal is lifted
  useEffect(() => {
    if (!isSustainOn && sustainedNotes.current.size > 0 && samplerRef.current) {
      sustainedNotes.current.forEach((note) => {
        const noteName = Tone.Frequency(note, 'midi').toNote();
        samplerRef.current?.triggerRelease(noteName);
      });
      sustainedNotes.current.clear();
    }
  }, [isSustainOn]);

  const playNote = (midiNote: number, velocity: number) => {
    if (!audioEnabled || !samplerRef.current) return;
    const noteName = Tone.Frequency(midiNote, 'midi').toNote();
    samplerRef.current.triggerAttack(noteName, Tone.now(), velocity / 127);
    sustainedNotes.current.delete(midiNote);
  };

  const stopNote = (midiNote: number) => {
    if (!samplerRef.current) return;
    if (isSustainOn) {
      sustainedNotes.current.add(midiNote);
    } else {
      const noteName = Tone.Frequency(midiNote, 'midi').toNote();
      samplerRef.current.triggerRelease(noteName);
    }
  };

  return { playNote, stopNote };
}
