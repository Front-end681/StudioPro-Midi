import { useTouchVelocity } from '../../hooks/useTouchVelocity';
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
  const { calculateVelocity } = useTouchVelocity();

  return (
    <div
      className={cn(
        "piano-key absolute z-10 transition-colors duration-75 rounded-b-sm shadow-md black-key-touch-target",
        isPressed ? "bg-[#2a7a5a]" : "bg-[#1a1a1a]"
      )}
      style={{ 
        width: 'var(--black-key-width)', 
        height: 'var(--black-key-height)',
        right: 'calc(-1 * var(--black-key-width) / 2)',
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
        onRelease(note);
      }}
      onPointerLeave={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          onRelease(note);
        }
      }}
    />
  );
}
