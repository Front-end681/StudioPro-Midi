import { useState, useEffect } from 'react';
import { useKeyboardStore } from '../../store/keyboardStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useMIDI } from '../../hooks/useMIDI';
import { useAudio } from '../../hooks/useAudio';
import { useLayout } from '../../hooks/useLayout';
import OctaveGroup from './OctaveGroup';

import { musicAwareEngine } from '../../utils/musicAwareEngine';

export default function PianoKeyboard() {
  const baseOctave = useKeyboardStore((state) => state.baseOctave);
  const activeKeys = useKeyboardStore((state) => state.activeKeys);
  const setNotePressed = useKeyboardStore((state) => state.setNotePressed);
  const setNoteReleased = useKeyboardStore((state) => state.setNoteReleased);
  
  const showNoteLabels = useSettingsStore((state) => state.showNoteLabels);
  const { sendNoteOn, sendNoteOff } = useMIDI();
  const { playNote, stopNote } = useAudio();
  const layout = useLayout();

  const handlePress = (note: number, velocity: number) => {
    setNotePressed(note, velocity);
    playNote(note, velocity);
    sendNoteOn(note, velocity);
  };

  const handleRelease = (note: number, velocity?: number) => {
    stopNote(note);
    sendNoteOff(note);
    setNoteReleased(note, velocity);
  };

  const octaves = Array.from({ length: layout.octaves }, (_, i) => baseOctave + i);

  return (
    <div 
      className="piano-keyboard-root min-h-0 min-w-0 relative overflow-x-auto overflow-y-hidden bg-[#050505] no-scrollbar flex flex-col"
      style={{ height: '100%', alignSelf: 'stretch' }}
    >
      <div className="piano-keys-row flex min-w-max">
        {octaves.map((octave) => (
          <OctaveGroup
            key={octave}
            octave={octave}
            activeKeys={activeKeys}
            onPress={handlePress}
            onRelease={handleRelease}
            showLabels={showNoteLabels}
          />
        ))}
      </div>
    </div>
  );
}
