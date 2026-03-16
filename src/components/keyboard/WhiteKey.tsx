import { useKeyboardStore } from '../../store/keyboardStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useTouchVelocity } from '../../hooks/useTouchVelocity';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface WhiteKeyProps {
  note: number;
  isPressed: boolean;
  onPress: (note: number, velocity: number) => void;
  onRelease: (note: number) => void;
  showLabel: boolean;
}

export default function WhiteKey({ note, isPressed, onPress, onRelease, showLabel }: WhiteKeyProps) {
  const { freqCompensationEnabled } = useSettingsStore();
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const name = noteNames[note % 12];
  const octave = Math.floor(note / 12) - 1;
  const isC = name === 'C';

  const { calculateVelocity } = useTouchVelocity();

  const getLabelColor = () => {
    if (isPressed) return "text-white";
    if (!freqCompensationEnabled) return "text-[#888]";
    
    if (note < 48) return "text-[#EF9F27]"; // Amber for bass
    if (note > 72) return "text-[#3B82F6]"; // Blue for high
    return "text-[#888]";
  };

  return (
    <div
      className={cn(
        "piano-key relative flex-shrink-0 border-r border-[#C8C8C0] transition-colors duration-75",
        isPressed ? "bg-[#1D9E75]" : "bg-[#F5F5F0]",
        "white-key-mobile-padding"
      )}
      style={{ width: 'var(--white-key-width)', height: '100%' }}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        const velocity = calculateVelocity(e.nativeEvent, e.currentTarget as HTMLElement, note);
        onPress(note, velocity);
      }}
      onPointerUp={() => onRelease(note)}
      onPointerLeave={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          onRelease(note);
        }
      }}
    >
      {showLabel && (
        <div className={cn(
          "absolute bottom-4 left-0 right-0 text-center pointer-events-none select-none",
          getLabelColor(),
          isC ? "text-[12px] font-bold" : "text-[11px]"
        )}>
          {name}{octave}
        </div>
      )}
    </div>
  );
}
