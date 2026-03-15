import { useKeyboardStore } from '../../store/keyboardStore';
import { RefreshCw } from 'lucide-react';
import { useMIDI } from '../../hooks/useMIDI';

export default function BottomBar() {
  const lastNote = useKeyboardStore((state) => state.lastNote);
  const lastVelocity = useKeyboardStore((state) => state.lastVelocity);
  const isSustainOn = useKeyboardStore((state) => state.isSustainOn);
  const setSustain = useKeyboardStore((state) => state.setSustain);
  const clearActiveKeys = useKeyboardStore((state) => state.clearActiveKeys);
  const { sendControlChange, sendAllNotesOff } = useMIDI();

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

  return (
    <footer className="fixed bottom-0 left-0 w-full h-16 border-t border-[#2e2e2e] bg-[#1a1a1a] flex items-center px-4 gap-8 z-[100]">
      <div className="flex flex-col min-w-[60px]">
        <span className="text-[10px] uppercase tracking-widest text-[#888] font-medium">Note</span>
        <span className="text-sm font-mono font-bold">{getNoteName(lastNote)}</span>
      </div>

      <div className="flex flex-col min-w-[60px]">
        <span className="text-[10px] uppercase tracking-widest text-[#888] font-medium">Velocity</span>
        <span className="text-sm font-mono font-bold">{lastVelocity || '---'}</span>
      </div>

      <div className="flex-1 flex flex-col gap-1">
        <div className="flex justify-between items-end">
          <span className="text-[10px] uppercase tracking-widest text-[#888] font-medium">Intensity</span>
        </div>
        <div className="h-2 bg-[#242424] rounded-full overflow-hidden border border-[#2e2e2e]">
          <div 
            className="h-full transition-all duration-75"
            style={{ 
              width: `${(lastVelocity / 127) * 100}%`,
              background: getVelocityColor(lastVelocity)
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSustain}
          className={`flex items-center gap-2 px-3 py-2 border rounded-md transition-all ${isSustainOn ? 'bg-[#1D9E75] border-[#1D9E75] text-white shadow-[0_0_10px_rgba(29,158,117,0.3)]' : 'bg-[#242424] border-[#2e2e2e] text-[#888]'}`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider">Sustain</span>
        </button>

        <button 
          onClick={handleReset}
          className="flex items-center gap-2 px-3 py-2 bg-[#242424] hover:bg-[#2e2e2e] border border-[#2e2e2e] rounded-md transition-colors group"
        >
          <RefreshCw size={14} className="text-[#888] group-active:rotate-180 transition-transform duration-300" />
          <span className="text-[10px] font-bold uppercase tracking-wider group-active:text-white">Reset</span>
        </button>
      </div>
    </footer>
  );
}
