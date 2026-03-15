import { useKeyboardStore } from '../../store/keyboardStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function OctaveControl() {
  const baseOctave = useKeyboardStore((state) => state.baseOctave);
  const numOctaves = useKeyboardStore((state) => state.numOctaves);
  const setBaseOctave = useKeyboardStore((state) => state.setBaseOctave);

  const handleDown = () => setBaseOctave(Math.max(0, baseOctave - 1));
  const handleUp = () => setBaseOctave(Math.min(8 - numOctaves + 1, baseOctave + 1));

  return (
    <div className="flex items-center gap-1 bg-[#242424] p-1 rounded-lg border border-[#2e2e2e]">
      <button 
        onClick={handleDown}
        disabled={baseOctave <= 0}
        className="p-1.5 hover:bg-[#2e2e2e] disabled:opacity-30 disabled:hover:bg-transparent rounded transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      <div className="px-2 flex flex-col items-center min-w-[40px]">
        <span className="text-[9px] uppercase tracking-widest text-[#888] font-bold">Oct</span>
        <span className="text-xs font-mono font-bold">{baseOctave}</span>
      </div>
      <button 
        onClick={handleUp}
        disabled={baseOctave >= 8 - numOctaves + 1}
        className="p-1.5 hover:bg-[#2e2e2e] disabled:opacity-30 disabled:hover:bg-transparent rounded transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
