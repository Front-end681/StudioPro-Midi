import { Link } from 'react-router-dom';
import { useKeyboardStore } from '../../store/keyboardStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Wifi, Usb, Activity } from 'lucide-react';

export default function Header() {
  const baseOctave = useKeyboardStore((state) => state.baseOctave);
  const numOctaves = useKeyboardStore((state) => state.numOctaves);
  const lastVelocity = useKeyboardStore((state) => state.lastVelocity);

  return (
    <header className="h-14 border-b border-[#2e2e2e] flex items-center justify-between px-4 bg-[#1a1a1a] z-50">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-lg font-bold tracking-tight text-[#1D9E75]">
          StudioPro MIDI
        </Link>
        <div className="flex items-center gap-2 px-2 py-1 bg-[#242424] rounded-md border border-[#2e2e2e]">
          <div className="w-2 h-2 rounded-full bg-[#1D9E75] animate-pulse" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#888]">Web MIDI</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-widest text-[#888] font-medium">Range</span>
          <span className="text-xs font-mono">C{baseOctave} – B{baseOctave + numOctaves - 1}</span>
        </div>
        
        <div className="w-8 h-8 rounded-full border border-[#2e2e2e] flex items-center justify-center relative">
          <Activity size={14} className={lastVelocity > 0 ? 'text-[#EF9F27]' : 'text-[#444]'} />
          {lastVelocity > 0 && (
            <div 
              className="absolute inset-0 rounded-full bg-[#EF9F27]/20 animate-ping" 
              style={{ animationDuration: '0.5s' }}
            />
          )}
        </div>
      </div>
    </header>
  );
}
