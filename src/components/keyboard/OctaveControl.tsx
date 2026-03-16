import { useKeyboardStore } from '../../store/keyboardStore';
import { useResponsive } from '../../hooks/useResponsive';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function OctaveControl() {
  const baseOctave = useKeyboardStore((state) => state.baseOctave);
  const numOctaves = useKeyboardStore((state) => state.numOctaves);
  const setBaseOctave = useKeyboardStore((state) => state.setBaseOctave);
  const { isMobile, isTablet, isPortrait, isLandscape } = useResponsive();

  const handleDown = () => setBaseOctave(Math.max(0, baseOctave - 1));
  const handleUp = () => setBaseOctave(Math.min(8 - numOctaves + 1, baseOctave + 1));

  const isCompact = (isMobile && isLandscape) || (isTablet && isPortrait);
  const isMinimal = isMobile && isLandscape;

  return (
    <div className="flex items-center gap-0.5 sm:gap-1 bg-[#242424] p-0.5 sm:p-1 rounded-lg border border-[#2e2e2e]">
      <button 
        onClick={handleDown}
        disabled={baseOctave <= 0}
        className="p-1 sm:p-1.5 hover:bg-[#2e2e2e] disabled:opacity-30 disabled:hover:bg-transparent rounded transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
      >
        <ChevronLeft size={isMinimal ? 14 : 16} />
      </button>
      <div className={`px-1 sm:px-2 flex flex-col items-center ${isMinimal ? 'min-w-[24px]' : 'min-w-[36px] sm:min-w-[40px]'}`}>
        {!isMinimal && (
          <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-[#888] font-bold">
            {isCompact ? 'Oct' : 'Octave'}
          </span>
        )}
        <span className="text-xs font-mono font-bold">{baseOctave}</span>
      </div>
      <button 
        onClick={handleUp}
        disabled={baseOctave >= 8 - numOctaves + 1}
        className="p-1 sm:p-1.5 hover:bg-[#2e2e2e] disabled:opacity-30 disabled:hover:bg-transparent rounded transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
      >
        <ChevronRight size={isMinimal ? 14 : 16} />
      </button>
    </div>
  );
}
