import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { useSettingsStore } from '../store/settingsStore';
import { useKeyboardStore } from '../store/keyboardStore';

export function useAudio() {
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { audioEnabled, volume, sampleSet } = useSettingsStore();
  const isSustainOn = useKeyboardStore((state) => state.isSustainOn);
  const sustainedNotes = useRef<Set<number>>(new Set());

  useEffect(() => {
    setIsLoaded(false);
    
    const urls = sampleSet === 'piano' 
      ? {
          C4: 'C4.mp3',
          'F#4': 'Fs4.mp3',
          A4: 'A4.mp3',
          C5: 'C5.mp3',
        }
      : {
          C4: 'C4.mp3', // Synth set could have different samples, but using same for now as placeholder
        };

    const baseUrl = sampleSet === 'piano'
      ? 'https://tonejs.github.io/audio/salamander/'
      : 'https://tonejs.github.io/audio/casio/'; // Casio is a common synth-like set in Tone.js examples

    samplerRef.current = new Tone.Sampler({
      urls,
      release: 1,
      baseUrl,
      onload: () => {
        setIsLoaded(true);
      },
    }).toDestination();

    return () => {
      samplerRef.current?.dispose();
    };
  }, [sampleSet]);

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
    if (!audioEnabled || !samplerRef.current || !samplerRef.current.loaded) return;
    
    // Ensure audio context is started
    if (Tone.getContext().state !== 'running') {
      Tone.start();
    }

    const noteName = Tone.Frequency(midiNote, 'midi').toNote();
    samplerRef.current.triggerAttack(noteName, Tone.now(), velocity / 127);
    sustainedNotes.current.delete(midiNote);
  };

  const stopNote = (midiNote: number) => {
    if (!samplerRef.current || !samplerRef.current.loaded) return;
    if (isSustainOn) {
      sustainedNotes.current.add(midiNote);
    } else {
      const noteName = Tone.Frequency(midiNote, 'midi').toNote();
      samplerRef.current.triggerRelease(noteName);
    }
  };

  return { playNote, stopNote, isLoaded };
}
