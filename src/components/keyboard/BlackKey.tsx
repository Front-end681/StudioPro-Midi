import { useTouchVelocity } from '../../hooks/useTouchVelocity';
import { useLayout } from '../../hooks/useLayout';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BlackKeyProps {
  note: number;
  isPressed: boolean;
  onPress: (note: number, velocity: number) => void;
  onRelease: (note: number) => void;
}

export default function BlackKey({ note, isPressed, onPress, onRelease }: BlackKeyProps) {
  const { calculateVelocity, refineVelocity } = useTouchVelocity();
  const layout = useLayout();

  return (
    <div
      className={cn(
        "piano-key absolute z-10 transition-colors duration-75 rounded-b-sm shadow-md black-key-touch-target",
        isPressed 
          ? "bg-[#1D9E75] shadow-[0_0_15px_rgba(29,158,117,0.4)]" 
          : "bg-gradient-to-b from-[#1a1a1a] to-[#000000]"
      )}
      style={{ 
        width: `${layout.blackKeyW}px`, 
        height: '62%',
        right: -layout.blackKeyW / 2,
        top: 0
      }}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        const velocity = calculateVelocity(e.nativeEvent, e.currentTarget as HTMLElement, note);
        onPress(note, velocity);
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        refineVelocity(e.nativeEvent, note);
        onRelease(note);
      }}
      onPointerLeave={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          refineVelocity(e.nativeEvent, note);
          onRelease(note);
        }
      }}
    />
  );
}
