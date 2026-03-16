import { useKeyboardStore } from '../../store/keyboardStore';
import { RefreshCw } from 'lucide-react';
import { useMIDI } from '../../hooks/useMIDI';
import { useResponsive } from '../../hooks/useResponsive';

export default function BottomBar() {
  const lastNote = useKeyboardStore((state) => state.lastNote);
  const lastVelocity = useKeyboardStore((state) => state.lastVelocity);
  const isSustainOn = useKeyboardStore((state) => state.isSustainOn);
  const setSustain = useKeyboardStore((state) => state.setSustain);
  const clearActiveKeys = useKeyboardStore((state) => state.clearActiveKeys);
  const { sendControlChange, sendAllNotesOff } = useMIDI();
  const { isMobile, isPortrait, isLandscape } = useResponsive();

  const handleReset = () => {
    sendAllNotesOff();
    clearActiveKeys();
  };

  const toggleSustain = () => {
    const newState = !isSustainOn;
    setSustain(newState);
    sendControlChange(64, newState ? 127 : 0);
  };

  const getNoteName = (midi: number | null) => {
    if (midi === null) return '---';
    const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const name = names[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `${name}${octave}`;
  };

  const getVelocityColor = (velocity: number): string => {
    if (velocity <= 40) return '#1D9E75'; // teal = soft
    if (velocity <= 90) return '#EF9F27'; // amber = medium
    return '#E24B4A'; // red = hard
  };

  if (isMobile && isPortrait) {
    return (
      <footer className="h-[68px] border-t border-[#2e2e2e] bg-[#1a1a1a] flex flex-col z-[100]">
        {/* Row 1 */}
        <div className="h-9 flex items-center px-4 gap-4 border-b border-[#2e2e2e]/50">
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-widest text-[#666] font-bold">Note</span>
            <span className="text-xs font-mono font-bold text-[#f0f0f0]">{getNoteName(lastNote)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-widest text-[#666] font-bold">Vel</span>
            <span className="text-xs font-mono font-bold text-[#f0f0f0]">{lastVelocity || '---'}</span>
          </div>
          <div className="flex-1 h-1.5 bg-[#242424] rounded-full overflow-hidden border border-[#2e2e2e]">
            <div 
              className="h-full transition-all duration-75"
              style={{ 
                width: `${(lastVelocity / 127) * 100}%`,
                background: getVelocityColor(lastVelocity)
              }}
            />
          </div>
        </div>
        {/* Row 2 */}
        <div className="h-8 flex items-stretch">
          <button 
            onClick={toggleSustain}
            className={`flex-1 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider transition-all border-r border-[#2e2e2e] ${isSustainOn ? 'bg-[#1D9E75] text-white' : 'bg-[#242424] text-[#888]'}`}
          >
            Sustain
          </button>
          <button 
            onClick={handleReset}
            className="flex-1 flex items-center justify-center gap-2 bg-[#242424] text-[#888] text-[10px] font-bold uppercase tracking-wider active:bg-[#2e2e2e] active:text-white"
          >
            <RefreshCw size={12} />
            Reset
          </button>
        </div>
      </footer>
    );
  }

  const barHeight = isMobile && isLandscape ? 'h-12' : 'h-14 sm:h-16';
  const showIntensityLabel = !(isMobile && isLandscape);
  const sustainLabel = isMobile && isLandscape ? 'SUS' : 'Sustain';

  return (
    <footer className={`${barHeight} border-t border-[#2e2e2e] bg-[#1a1a1a] flex items-center px-4 gap-4 sm:gap-8 z-[100] transition-all duration-300`}>
      <div className="flex flex-col min-w-[40px] sm:min-w-[60px]">
        <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#888] font-medium">Note</span>
        <span className="text-xs sm:text-sm font-mono font-bold">{getNoteName(lastNote)}</span>
      </div>

      <div className="flex flex-col min-w-[40px] sm:min-w-[60px]">
        <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#888] font-medium">Vel</span>
        <span className="text-xs sm:text-sm font-mono font-bold">{lastVelocity || '---'}</span>
      </div>

      <div className="flex-1 flex flex-col gap-1">
        {showIntensityLabel && (
          <div className="flex justify-between items-end">
            <span className="text-[10px] uppercase tracking-widest text-[#888] font-medium">Intensity</span>
          </div>
        )}
        <div className="h-1.5 sm:h-2 bg-[#242424] rounded-full overflow-hidden border border-[#2e2e2e]">
          <div 
            className="h-full transition-all duration-75"
            style={{ 
              width: `${(lastVelocity / 127) * 100}%`,
              background: getVelocityColor(lastVelocity)
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button 
          onClick={toggleSustain}
          className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 border rounded-md transition-all min-w-[44px] min-h-[44px] justify-center ${isSustainOn ? 'bg-[#1D9E75] border-[#1D9E75] text-white shadow-[0_0_10px_rgba(29,158,117,0.3)]' : 'bg-[#242424] border-[#2e2e2e] text-[#888]'}`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider">{sustainLabel}</span>
        </button>

        <button 
          onClick={handleReset}
          className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-[#242424] hover:bg-[#2e2e2e] border border-[#2e2e2e] rounded-md transition-colors group min-w-[44px] min-h-[44px] justify-center"
        >
          <RefreshCw size={14} className="text-[#888] group-active:rotate-180 transition-transform duration-300" />
          <span className="text-[10px] font-bold uppercase tracking-wider group-active:text-white">Reset</span>
        </button>
      </div>
    </footer>
  );
}
