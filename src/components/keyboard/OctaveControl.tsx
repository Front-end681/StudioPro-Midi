import { useKeyboardStore } from '../../store/keyboardStore';
import { useLayout } from '../../hooks/useLayout';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface OctaveControlProps {
  compact?: boolean;
}

export default function OctaveControl({ compact = false }: OctaveControlProps) {
  const baseOctave = useKeyboardStore((state) => state.baseOctave);
  const numOctaves = useKeyboardStore((state) => state.numOctaves);
  const setBaseOctave = useKeyboardStore((state) => state.setBaseOctave);
  const layout = useLayout();

  const handleDown = () => setBaseOctave(Math.max(0, baseOctave - 1));
  const handleUp = () => setBaseOctave(Math.min(8 - numOctaves + 1, baseOctave + 1));

  const showLabel = !layout.isPhone || layout.isLandscape;

  return (
    <div className="flex items-center gap-1 bg-[#0A0A0A] p-1 rounded-xl border border-[#2e2e2e]">
      <button 
        onClick={handleDown}
        disabled={baseOctave <= 0}
        className="p-1.5 hover:bg-[#141414] disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
      >
        <ChevronLeft size={16} />
      </button>
      <div className={`px-2 flex flex-col items-center min-w-[32px]`}>
        {showLabel && (
          <span className="uppercase tracking-widest text-[#666] font-black" style={{ fontSize: 'var(--font-xs)' }}>
            {compact ? 'OCT' : 'OCTAVE'}
          </span>
        )}
        <span className="font-mono font-black text-[#1D9E75]" style={{ fontSize: 'var(--font-sm)' }}>{baseOctave}</span>
      </div>
      <button 
        onClick={handleUp}
        disabled={baseOctave >= 8 - numOctaves + 1}
        className="p-1.5 hover:bg-[#141414] disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
