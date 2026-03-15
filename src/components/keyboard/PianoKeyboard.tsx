import { useKeyboardStore } from '../../store/keyboardStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useMIDI } from '../../hooks/useMIDI';
import { useAudio } from '../../hooks/useAudio';
import { useTouchVelocity } from '../../hooks/useTouchVelocity';
import OctaveGroup from './OctaveGroup';

export default function PianoKeyboard() {
  const baseOctave = useKeyboardStore((state) => state.baseOctave);
  const numOctaves = useKeyboardStore((state) => state.numOctaves);
  const activeKeys = useKeyboardStore((state) => state.activeKeys);
  const pressStartTimes = useKeyboardStore((state) => state.pressStartTimes);
  const setNotePressed = useKeyboardStore((state) => state.setNotePressed);
  const setNoteReleased = useKeyboardStore((state) => state.setNoteReleased);
  const setPressStartTime = useKeyboardStore((state) => state.setPressStartTime);
  
  const showNoteLabels = useSettingsStore((state) => state.showNoteLabels);
  const { sendNoteOn, sendNoteOff } = useMIDI();
  const { playNote, stopNote } = useAudio();

  const handlePress = (note: number, velocity: number) => {
    // Visual feedback immediately
    setNotePressed(note, velocity);
    
    // Internal audio preview
    playNote(note, velocity);

    // Send MIDI noteOn
    sendNoteOn(note, velocity);
  };

  const handleRelease = (note: number) => {
    // Stop internal audio
    stopNote(note);
    
    // Send MIDI noteOff
    sendNoteOff(note);
    
    setNoteReleased(note);
  };

  const octaves = Array.from({ length: numOctaves }, (_, i) => baseOctave + i);

  return (
    <div className="w-full h-full overflow-x-auto overflow-y-hidden bg-[#0f0f0f] flex no-scrollbar flex-col">
      <div className="flex h-full">
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
