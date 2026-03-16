import { useKeyboardStore } from '../../store/keyboardStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useMIDI } from '../../hooks/useMIDI';
import { useAudio } from '../../hooks/useAudio';
import { useResponsive } from '../../hooks/useResponsive';
import OctaveGroup from './OctaveGroup';

export default function PianoKeyboard() {
  const baseOctave = useKeyboardStore((state) => state.baseOctave);
  const numOctaves = useKeyboardStore((state) => state.numOctaves);
  const activeKeys = useKeyboardStore((state) => state.activeKeys);
  const setNotePressed = useKeyboardStore((state) => state.setNotePressed);
  const setNoteReleased = useKeyboardStore((state) => state.setNoteReleased);
  
  const showNoteLabels = useSettingsStore((state) => state.showNoteLabels);
  const { sendNoteOn, sendNoteOff } = useMIDI();
  const { playNote, stopNote } = useAudio();
  const { isMobile, isTablet, isPortrait, isLandscape } = useResponsive();

  const handlePress = (note: number, velocity: number) => {
    setNotePressed(note, velocity);
    playNote(note, velocity);
    sendNoteOn(note, velocity);
  };

  const handleRelease = (note: number) => {
    stopNote(note);
    sendNoteOff(note);
    setNoteReleased(note);
  };

  // Determine effective number of octaves based on breakpoint
  const effectiveNumOctaves = (isMobile || (isTablet && isPortrait)) ? 2 : numOctaves;
  const octaves = Array.from({ length: effectiveNumOctaves }, (_, i) => baseOctave + i);

  return (
    <div className="w-full h-full overflow-x-auto overflow-y-hidden bg-[#0f0f0f] no-scrollbar">
      <div className="flex h-full items-stretch min-w-max">
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
